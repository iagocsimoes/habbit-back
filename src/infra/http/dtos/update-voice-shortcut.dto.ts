import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateVoiceShortcutDto {
  @IsString()
  @IsNotEmpty()
  voiceShortcut: string
}
