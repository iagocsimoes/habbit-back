import { Injectable, Logger } from '@nestjs/common'
import { randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { Either, right } from '@/core/types/either'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { WebhookEvent } from '@/infra/payment/abacatepay.service'
import { MailService } from '@/infra/mail/mail.service'

interface HandleAbacatePayWebhookUseCaseRequest {
  event: WebhookEvent
}

type HandleAbacatePayWebhookUseCaseResponse = Either<null, { success: true }>

@Injectable()
export class HandleAbacatePayWebhookUseCase {
  private readonly logger = new Logger(HandleAbacatePayWebhookUseCase.name)

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async execute({
    event,
  }: HandleAbacatePayWebhookUseCaseRequest): Promise<HandleAbacatePayWebhookUseCaseResponse> {
    const { billing } = event

    // Eventos possíveis: billing.created, billing.paid, billing.cancelled, billing.refunded
    switch (event.kind) {
      case 'billing.paid': {
        await this.handleBillingPaid(billing)
        break
      }

      case 'billing.cancelled': {
        await this.handleBillingCancelled(billing)
        break
      }

      case 'billing.refunded': {
        await this.handleBillingRefunded(billing)
        break
      }
    }

    return right({ success: true })
  }

  private async handleBillingPaid(billing: any) {
    this.logger.log('Webhook billing.paid received')

    const userEmail = billing.metadata?.userId // Na verdade é o email

    if (!userEmail) {
      this.logger.warn('Email not found in billing metadata')
      return
    }

    // 1. Buscar ou criar usuário
    let user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    })

    let isNewUser = false
    let generatedPassword = ''

    if (!user) {
      this.logger.log('Creating new user from billing')
      generatedPassword = randomBytes(16).toString('base64url').slice(0, 16)
      const passwordHash = await bcrypt.hash(generatedPassword, 10)

      user = await this.prisma.user.create({
        data: {
          email: userEmail,
          passwordHash,
          plan: 'PRO',
        },
      })

      isNewUser = true
      this.logger.log(`New user created: ${user.id}`)
    } else {
      this.logger.log(`Existing user found: ${user.id}`)
    }

    // 2. Ativar ou criar assinatura
    await this.prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: 'PRO',
        status: 'active',
        currentPeriodEnd: this.getNextMonthDate(),
      },
      update: {
        status: 'active',
        currentPeriodEnd: this.getNextMonthDate(),
        cancelAtPeriodEnd: false,
      },
    })

    this.logger.log(`Subscription activated for user: ${user.id}`)

    // 3. Enviar email de boas-vindas apenas para novos usuários
    if (isNewUser) {
      try {
        await this.mailService.sendWelcomeEmail({
          to: userEmail,
          email: userEmail,
          password: generatedPassword,
        })
        this.logger.log(`Welcome email sent for user: ${user.id}`)
      } catch (error) {
        this.logger.error(`Failed to send welcome email for user: ${user.id}`, error instanceof Error ? error.stack : undefined)
      }
    }
  }

  private async handleBillingCancelled(billing: any) {
    const userId = billing.metadata?.userId
    if (!userId) return

    await this.prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: true,
      },
    })
  }

  private async handleBillingRefunded(billing: any) {
    const userId = billing.metadata?.userId
    if (!userId) return

    await this.prisma.subscription.updateMany({
      where: { userId },
      data: {
        status: 'canceled',
      },
    })
  }

  private getNextMonthDate(): Date {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
  }
}
