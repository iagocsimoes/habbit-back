import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateShortcutDto {
  @IsString()
  @IsNotEmpty()
  shortcut: string
}
