import { TextChange } from '@/domain/enterprise/entities/correction'

export interface CorrectionResult {
  correctedText: string
  changes?: TextChange[]
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
}
