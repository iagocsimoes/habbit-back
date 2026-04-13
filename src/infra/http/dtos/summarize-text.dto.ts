import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator'

export class SummarizeTextDto {
  @IsString()
  @MaxLength(10000, { message: 'Text must not exceed 10000 characters' })
  text!: string

  @IsOptional()
  @IsIn(['pt', 'en', 'es'], { message: 'Language must be pt, en, or es' })
  language?: string

  @IsOptional()
  @IsIn(['bullets', 'paragraph', 'oneline', 'detailed'], {
    message: 'Style must be bullets, paragraph, oneline, or detailed',
  })
  style?: string
}
