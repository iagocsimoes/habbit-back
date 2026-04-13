import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/types/either'
import { AIProvider } from '../../providers/ai-provider'
import { UserRepository } from '../../repositories/user-repository'
import { ResourceNotFoundError } from '../corrections/errors/resource-not-found-error'

interface TranscribeAudioUseCaseRequest {
  userId: string
  audioBuffer: Buffer
  language?: string
}

type TranscribeAudioUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    text: string
    language: string
    duration: number
  }
>

@Injectable()
export class TranscribeAudioUseCase {
  constructor(
    private userRepository: UserRepository,
    private aiProvider: AIProvider,
  ) {}

  async execute({
    userId,
    audioBuffer,
    language = 'pt',
  }: TranscribeAudioUseCaseRequest): Promise<TranscribeAudioUseCaseResponse> {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    const result = await this.aiProvider.transcribeAudio(audioBuffer, language)

    return right({
      text: result.text,
      language: result.language,
      duration: result.duration,
    })
  }
}
