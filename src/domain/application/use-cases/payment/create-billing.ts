import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'
import { AbacatePayService } from '@/infra/payment/abacatepay.service'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

interface CreateBillingUseCaseRequest {
  userId: string
}

type CreateBillingUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    billingId: string
    url: string
  }
>

@Injectable()
export class CreateBillingUseCase {
  constructor(
    private userRepository: UserRepository,
    private abacatePayService: AbacatePayService,
    private prisma: PrismaService,
  ) {}

  async execute({
    userId,
  }: CreateBillingUseCaseRequest): Promise<CreateBillingUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    // Buscar plano PRO do banco
    const planConfig = await this.prisma.planConfig.findUnique({
      where: { name: 'PRO' },
    })

    if (!planConfig) {
      return left(new ResourceNotFoundError())
    }

    const billing = await this.abacatePayService.createBilling({
      amount: Number(planConfig.price),
      userEmail: user.email,
      userId,
      description: `${planConfig.displayName} - ${planConfig.monthlyLimit} correções/mês`,
    })

    return right({
      billingId: billing.id,
      url: billing.url,
    })
  }
}
