import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { CorrectionRepository } from '../../repositories/correction-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

interface DeleteCorrectionUseCaseRequest {
  correctionId: string
  userId: string
}

type DeleteCorrectionUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

@Injectable()
export class DeleteCorrectionUseCase {
  constructor(private correctionRepository: CorrectionRepository) {}

  async execute({
    correctionId,
    userId,
  }: DeleteCorrectionUseCaseRequest): Promise<DeleteCorrectionUseCaseResponse> {
    const correction = await this.correctionRepository.findById(correctionId)

    if (!correction) {
      return left(new ResourceNotFoundError())
    }

    if (correction.userId.toString() !== userId) {
      return left(new NotAllowedError())
    }

    await this.correctionRepository.delete(correctionId)

    return right(null)
  }
}
