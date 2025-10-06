import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { Correction } from '@/domain/enterprise/entities/correction'
import { CorrectionRepository } from '../../repositories/correction-repository'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

interface GetCorrectionUseCaseRequest {
  correctionId: string
  userId: string
}

export interface GetCorrectionUseCaseResponse {
  correction: Correction
}

type GetCorrectionUseCaseResult = Either<
  ResourceNotFoundError | NotAllowedError,
  GetCorrectionUseCaseResponse
>

@Injectable()
export class GetCorrectionUseCase {
  constructor(private correctionRepository: CorrectionRepository) {}

  async execute({
    correctionId,
    userId,
  }: GetCorrectionUseCaseRequest): Promise<GetCorrectionUseCaseResult> {
    const correction = await this.correctionRepository.findById(correctionId)

    if (!correction) {
      return left(new ResourceNotFoundError())
    }

    if (correction.userId.toString() !== userId) {
      return left(new NotAllowedError())
    }

    return right({ correction })
  }
}
