import { IsString, MaxLength, IsOptional, IsIn } from 'class-validator'

export class CorrectTextDto {
  @IsString()
  @MaxLength(5000, { message: 'Text must not exceed 5000 characters' })
  text!: string

  @IsOptional()
  @IsIn(['pt', 'en', 'es'], { message: 'Language must be pt, en, or es' })
  language?: string
}
