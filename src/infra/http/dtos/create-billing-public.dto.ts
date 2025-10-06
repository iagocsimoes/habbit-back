import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateBillingPublicDto {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsOptional()
  name?: string
}
