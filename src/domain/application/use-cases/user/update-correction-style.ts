import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface UpdateCorrectionStyleUseCaseRequest {
  userId: string
  correctionStyle: string
}

type UpdateCorrectionStyleUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class UpdateCorrectionStyleUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    userId,
    correctionStyle,
  }: UpdateCorrectionStyleUseCaseRequest): Promise<UpdateCorrectionStyleUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    user.correctionStyle = correctionStyle

    await this.userRepository.save(user)

    return right(null)
  }
}
