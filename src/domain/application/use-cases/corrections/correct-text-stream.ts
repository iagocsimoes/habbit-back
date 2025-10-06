import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { AIProvider } from '../../providers/ai-provider'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { MonthlyLimitExceededError } from './errors/monthly-limit-exceeded-error'
import { UserPlan } from '@/domain/enterprise/entities/user'
import { CorrectionRepository } from '../../repositories/correction-repository'

interface CorrectTextStreamUseCaseRequest {
  userId: string
  text: string
  language?: string
}

type CorrectTextStreamUseCaseResponse = Either<
  ResourceNotFoundError | MonthlyLimitExceededError,
  {
    stream: AsyncIterable<string>
    userId: string
    originalText: string
    language: string
  }
>

const PLAN_LIMITS = {
  [UserPlan.PRO]: 3000,
}

@Injectable()
export class CorrectTextStreamUseCase {
  constructor(
    private userRepository: UserRepository,
    private correctionRepository: CorrectionRepository,
    private aiProvider: AIProvider,
  ) {}

  async execute({
    userId,
    text,
    language = 'pt',
  }: CorrectTextStreamUseCaseRequest): Promise<CorrectTextStreamUseCaseResponse> {
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

    // Obter stream da IA usando o estilo preferido do usuário
    const stream = this.aiProvider.correctTextStream(
      text,
      language,
      user.correctionStyle,
    )

    return right({
      stream,
      userId,
      originalText: text,
      language,
    })
  }
}
