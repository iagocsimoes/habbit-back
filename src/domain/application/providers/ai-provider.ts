import { TextChange } from '@/domain/enterprise/entities/correction'

export interface CorrectionResult {
  correctedText: string
  changes?: TextChange[]
  tokensUsed: number
}

export interface TranscriptionResult {
  text: string
  language: string
  duration: number
}

export interface SummaryResult {
  summary: string
  tokensUsed: number
}

export abstract class AIProvider {
  abstract correctText(
    text: string,
    language: string,
    correctionStyle?: string,
  ): Promise<CorrectionResult>

  abstract correctTextStream(
    text: string,
    language: string,
    correctionStyle?: string,
  ): AsyncIterable<string>

  abstract transcribeAudio(
    audioBuffer: Buffer,
    language?: string,
  ): Promise<TranscriptionResult>

  abstract summarizeText(
    text: string,
    language: string,
    style?: string,
  ): Promise<SummaryResult>
}
