import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface UpdateSummaryShortcutUseCaseRequest {
  userId: string
  summaryShortcut: string
}

type UpdateSummaryShortcutUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateSummaryShortcutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    summaryShortcut,
  }: UpdateSummaryShortcutUseCaseRequest): Promise<UpdateSummaryShortcutUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    user.summaryShortcut = summaryShortcut

    await this.userRepository.save(user)

    return right(null)
  }
}
