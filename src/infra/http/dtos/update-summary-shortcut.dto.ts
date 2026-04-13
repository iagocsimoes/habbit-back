import { IsString, IsNotEmpty } from 'class-validator'

export class UpdateSummaryShortcutDto {
  @IsString()
  @IsNotEmpty()
  summaryShortcut: string
}
