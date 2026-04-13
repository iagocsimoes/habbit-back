import {
  Controller,
  Post,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { TranscribeAudioUseCase } from '@/domain/application/use-cases/transcriptions/transcribe-audio'
import { TranscribeAndCorrectUseCase } from '@/domain/application/use-cases/transcriptions/transcribe-and-correct'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { MonthlyLimitExceededError } from '@/domain/application/use-cases/corrections/errors/monthly-limit-exceeded-error'

const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB (Whisper API limit)
const ALLOWED_MIMES = [
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
  'audio/m4a',
]

@Controller('transcriptions')
export class TranscriptionsController {
  constructor(
    private transcribeAudio: TranscribeAudioUseCase,
    private transcribeAndCorrect: TranscribeAndCorrectUseCase,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: MAX_AUDIO_SIZE },
    }),
  )
  async create(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language: string = 'pt',
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required')
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid audio format. Supported: webm, mp4, mpeg, mp3, wav, ogg, flac, m4a',
      )
    }

    const result = await this.transcribeAudio.execute({
      userId: user.sub,
      audioBuffer: file.buffer,
      language,
    })

    if (result.isLeft()) {
      throw new BadRequestException('Failed to transcribe audio')
    }

    return {
      text: result.value.text,
      language: result.value.language,
      duration: result.value.duration,
    }
  }

  @Post('correct')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: MAX_AUDIO_SIZE },
    }),
  )
  async createAndCorrect(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language: string = 'pt',
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required')
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid audio format. Supported: webm, mp4, mpeg, mp3, wav, ogg, flac, m4a',
      )
    }

    const result = await this.transcribeAndCorrect.execute({
      userId: user.sub,
      audioBuffer: file.buffer,
      language,
    })

    if (result.isLeft()) {
      const error = result.value

      if (error instanceof MonthlyLimitExceededError) {
        throw new BadRequestException(error.message)
      }

      throw new BadRequestException('Failed to transcribe and correct audio')
    }

    const { originalText, correction, duration, monthlyUsage, monthlyLimit } =
      result.value

    return {
      transcription: {
        text: originalText,
        duration,
      },
      correction: {
        id: correction.id.toString(),
        originalText: correction.originalText,
        correctedText: correction.correctedText,
        changes: correction.changes,
        language: correction.language,
        tokensUsed: correction.tokensUsed,
        createdAt: correction.createdAt,
      },
      usage: {
        monthly: monthlyUsage,
        limit: monthlyLimit,
        remaining: monthlyLimit - monthlyUsage,
      },
    }
  }
}
