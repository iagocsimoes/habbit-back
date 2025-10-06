import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { AbacatePayService } from '@/infra/payment/abacatepay.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

interface CreateBillingPublicUseCaseRequest {
  email: string
  name?: string
}

type CreateBillingPublicUseCaseResponse = Either<
  Error,
  {
    billingId: string
    url: string
  }
>

@Injectable()
export class CreateBillingPublicUseCase {
  constructor(
    private abacatePayService: AbacatePayService,
    private prisma: PrismaService,
  ) {}

  async execute({
    email,
    name,
  }: CreateBillingPublicUseCaseRequest): Promise<CreateBillingPublicUseCaseResponse> {
    // Buscar plano PRO do banco
    const planConfig = await this.prisma.planConfig.findUnique({
      where: { name: 'PRO' },
    })

    if (!planConfig) {
      return left(new Error('Plan not found'))
    }

    const billing = await this.abacatePayService.createBilling({
      amount: Number(planConfig.price),
      userEmail: email,
      userId: email, // Usar email como identificador temporário
      description: `${planConfig.displayName} - ${planConfig.monthlyLimit} correções/mês`,
    })

    return right({
      billingId: billing.id,
      url: billing.url,
    })
  }
}
