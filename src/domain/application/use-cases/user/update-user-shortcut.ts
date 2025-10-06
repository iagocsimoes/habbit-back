import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface UpdateUserShortcutUseCaseRequest {
  userId: string
  shortcut: string
}

type UpdateUserShortcutUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateUserShortcutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    shortcut,
  }: UpdateUserShortcutUseCaseRequest): Promise<UpdateUserShortcutUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    user.shortcut = shortcut

    await this.userRepository.save(user)

    return right(null)
  }
}
