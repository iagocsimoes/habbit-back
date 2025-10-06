import {
  Controller,
  Post,
  Get,
  Headers,
  RawBodyRequest,
  Req,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { Request } from 'express'
import { CreateBillingUseCase } from '@/domain/application/use-cases/payment/create-billing'
import { CreateBillingPublicUseCase } from '@/domain/application/use-cases/payment/create-billing-public'
import { HandleAbacatePayWebhookUseCase } from '@/domain/application/use-cases/payment/handle-abacatepay-webhook'
import { AbacatePayService } from '@/infra/payment/abacatepay.service'
import { MailService } from '@/infra/mail/mail.service'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { Public } from '@/infra/auth/public.decorator'
import { CreateBillingPublicDto } from '../dtos/create-billing-public.dto'

@Controller('payment')
export class PaymentController {
  constructor(
    private createBilling: CreateBillingUseCase,
    private createBillingPublic: CreateBillingPublicUseCase,
    private handleAbacatePayWebhook: HandleAbacatePayWebhookUseCase,
    private abacatePayService: AbacatePayService,
    private mailService: MailService,
  ) {}

  @Post('create-billing')
  async createSession(@CurrentUser() user: UserPayload) {
    const result = await this.createBilling.execute({
      userId: user.sub,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to create billing')
    }

    return result.value
  }

  @Public()
  @Post('create-billing-public')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createSessionPublic(@Body() body: CreateBillingPublicDto) {
    const result = await this.createBillingPublic.execute({
      email: body.email,
      name: body.name,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to create billing')
    }

    return result.value
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string,
  ) {
    console.log('🌐 Webhook recebido!')
    console.log('📝 Headers:', request.headers)
    console.log('📦 Body:', request.body)

    if (!signature) {
      console.log('❌ Faltando header x-signature')
      throw new BadRequestException('Missing x-signature header')
    }

    const rawBody = request.rawBody
    if (!rawBody) {
      console.log('❌ Faltando raw body')
      throw new BadRequestException('Missing raw body')
    }

    console.log('🔐 Verificando assinatura...')
    const event = this.abacatePayService.verifyWebhookSignature(
      rawBody.toString(),
      signature,
    )

    if (!event) {
      console.log('❌ Assinatura inválida')
      throw new BadRequestException('Invalid webhook signature')
    }

    console.log('✅ Assinatura válida, processando evento:', event.kind)
    await this.handleAbacatePayWebhook.execute({ event })

    return { received: true }
  }

  @Get('subscription-status')
  async getSubscriptionStatus(@CurrentUser() user: UserPayload) {
    return {
      userId: user.sub,
      message: 'Use this endpoint to check subscription status',
    }
  }

  @Public()
  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    try {
      await this.mailService.sendWelcomeEmail({
        to: body.email,
        email: body.email,
        password: 'senha-teste-123',
      })
      return { success: true, message: 'Email enviado com sucesso!' }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        details: error.toString(),
      }
    }
  }
}
