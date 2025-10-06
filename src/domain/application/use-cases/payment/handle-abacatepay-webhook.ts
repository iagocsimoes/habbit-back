import { Injectable } from '@nestjs/common'
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
    console.log('🔔 Webhook billing.paid recebido:', billing)

    const userEmail = billing.metadata?.userId // Na verdade é o email
    console.log('📧 Email do usuário:', userEmail)

    if (!userEmail) {
      console.log('❌ Email não encontrado no metadata')
      return
    }

    // 1. Buscar ou criar usuário
    let user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    })

    let isNewUser = false
    let randomPassword = ''

    if (!user) {
      console.log('✨ Criando novo usuário...')
      // Criar usuário com senha aleatória
      randomPassword = Math.random().toString(36).slice(-12)
      const bcrypt = require('bcrypt')
      const passwordHash = await bcrypt.hash(randomPassword, 10)

      user = await this.prisma.user.create({
        data: {
          email: userEmail,
          passwordHash,
          plan: 'PRO',
        },
      })

      isNewUser = true
      console.log('✅ Usuário criado:', user.id)
    } else {
      console.log('👤 Usuário já existe:', user.id)
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

    console.log('✅ Assinatura ativada')

    // 3. Enviar email de boas-vindas apenas para novos usuários
    if (isNewUser) {
      console.log('📤 Enviando email de boas-vindas...')
      try {
        await this.mailService.sendWelcomeEmail({
          to: userEmail,
          email: userEmail,
          password: randomPassword,
        })
        console.log('✅ Email enviado com sucesso!')
      } catch (error) {
        console.error('❌ Failed to send welcome email:', error)
        // Não falhar o webhook se o email falhar
      }
    } else {
      console.log('ℹ️ Usuário já existia, email não enviado')
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
