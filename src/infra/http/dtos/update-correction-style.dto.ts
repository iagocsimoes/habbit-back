import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateCorrectionStyleDto {
  @IsString()
  @IsNotEmpty()
  correctionStyle: string
}
