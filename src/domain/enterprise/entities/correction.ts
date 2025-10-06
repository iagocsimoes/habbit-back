import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface TextChange {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style'
  original: string
  corrected: string
  explanation: string
}

export interface CorrectionProps {
  userId: UniqueEntityID
  originalText: string
  correctedText: string
  changes?: TextChange[]
  language: string
  tokensUsed: number
  createdAt: Date
}

export class Correction extends Entity<CorrectionProps> {
  get userId() {
    return this.props.userId
  }

  get originalText() {
    return this.props.originalText
  }

  get correctedText() {
    return this.props.correctedText
  }

  get changes() {
    return this.props.changes
  }

  get language() {
    return this.props.language
  }

  get tokensUsed() {
    return this.props.tokensUsed
  }

  get createdAt() {
    return this.props.createdAt
  }

  static create(props: Partial<CorrectionProps>, id?: UniqueEntityID) {
    const correction = new Correction(
      {
        userId: props.userId!,
        originalText: props.originalText!,
        correctedText: props.correctedText!,
        changes: props.changes,
        language: props.language ?? 'pt',
        tokensUsed: props.tokensUsed ?? 0,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )

    return correction
  }
}
