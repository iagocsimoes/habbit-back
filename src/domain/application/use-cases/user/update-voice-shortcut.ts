import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface UpdateVoiceShortcutUseCaseRequest {
  userId: string
  voiceShortcut: string
}

type UpdateVoiceShortcutUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateVoiceShortcutUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    voiceShortcut,
  }: UpdateVoiceShortcutUseCaseRequest): Promise<UpdateVoiceShortcutUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    user.voiceShortcut = voiceShortcut

    await this.userRepository.save(user)

    return right(null)
  }
}
