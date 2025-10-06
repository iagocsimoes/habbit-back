import { Injectable } from '@nestjs/common'
import { Either, right } from '@/core/types/either'
import { CorrectionRepository } from '../../repositories/correction-repository'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetUserStatsUseCaseRequest {
  userId: string
}

export interface GetUserStatsUseCaseResponse {
  totalCorrections: number
  monthlyLimit: number
  remaining: number
  totalTokensUsed: number
}

type GetUserStatsUseCaseResult = Either<
  ResourceNotFoundError,
  GetUserStatsUseCaseResponse
>

@Injectable()
export class GetUserStatsUseCase {
  constructor(
    private correctionRepository: CorrectionRepository,
    private userRepository: UserRepository,
  ) {}

  async execute({
    userId,
  }: GetUserStatsUseCaseRequest): Promise<GetUserStatsUseCaseResult> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return right({
        totalCorrections: 0,
        monthlyLimit: 3000,
        remaining: 3000,
        totalTokensUsed: 0,
      })
    }

    const totalCorrections =
      await this.correctionRepository.countByUserIdInCurrentMonth(userId)
    const totalTokensUsed =
      await this.correctionRepository.getTotalTokensInCurrentMonth(userId)

    const monthlyLimit = 3000
    const remaining = Math.max(0, 3000 - totalCorrections)

    return right({
      totalCorrections,
      monthlyLimit,
      remaining,
      totalTokensUsed,
    })
  }
}
