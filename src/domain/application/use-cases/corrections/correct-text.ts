import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { Correction } from '@/domain/enterprise/entities/correction'
import { CorrectionRepository } from '../../repositories/correction-repository'
import { UserRepository } from '../../repositories/user-repository'
import { AIProvider } from '../../providers/ai-provider'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { MonthlyLimitExceededError } from './errors/monthly-limit-exceeded-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPlan } from '@/domain/enterprise/entities/user'

interface CorrectTextUseCaseRequest {
  userId: string
  text: string
  language?: string
}

type CorrectTextUseCaseResponse = Either<
  ResourceNotFoundError | MonthlyLimitExceededError,
  {
    correction: Correction
    monthlyUsage: number
    monthlyLimit: number | string
  }
>

const PLAN_LIMITS = {
  [UserPlan.PRO]: 3000,
}

@Injectable()
export class CorrectTextUseCase {
  constructor(
    private correctionRepository: CorrectionRepository,
    private userRepository: UserRepository,
    private aiProvider: AIProvider,
  ) {}

  async execute({
    userId,
    text,
    language = 'pt',
  }: CorrectTextUseCaseRequest): Promise<CorrectTextUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    // Verificar limite mensal
    const monthlyUsage =
      await this.correctionRepository.countByUserIdInCurrentMonth(userId)
    const limit = PLAN_LIMITS[user.plan]

    if (monthlyUsage >= limit) {
      return left(new MonthlyLimitExceededError())
    }

    // Corrigir texto com IA usando o estilo preferido do usuário
    const result = await this.aiProvider.correctText(
      text,
      language,
      user.correctionStyle,
    )

    const correction = Correction.create({
      userId: new UniqueEntityID(userId),
      originalText: text,
      correctedText: result.correctedText,
      changes: result.changes,
      language,
      tokensUsed: result.tokensUsed,
    })

    await this.correctionRepository.create(correction)

    const monthlyLimit = limit

    return right({
      correction,
      monthlyUsage: monthlyUsage + 1,
      monthlyLimit,
    })
  }
}
