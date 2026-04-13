import { AggregateRoot } from '@/core/entities/aggregate-root'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export enum UserPlan {
  PRO = 'PRO',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  email: string
  passwordHash: string
  name?: string
  plan: UserPlan
  role: UserRole
  shortcut: string
  voiceShortcut: string
  summaryShortcut: string
  correctionStyle: string
  createdAt: Date
  updatedAt: Date
}

export class User extends AggregateRoot<UserProps> {
  get email() {
    return this.props.email
  }

  get passwordHash() {
    return this.props.passwordHash
  }

  get name() {
    return this.props.name
  }

  get plan() {
    return this.props.plan
  }

  get role() {
    return this.props.role
  }

  get shortcut() {
    return this.props.shortcut
  }

  get voiceShortcut() {
    return this.props.voiceShortcut
  }

  get summaryShortcut() {
    return this.props.summaryShortcut
  }

  get correctionStyle() {
    return this.props.correctionStyle
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  set plan(plan: UserPlan) {
    this.props.plan = plan
    this.touch()
  }

  set passwordHash(hash: string) {
    this.props.passwordHash = hash
    this.touch()
  }

  set shortcut(shortcut: string) {
    this.props.shortcut = shortcut
    this.touch()
  }

  set voiceShortcut(voiceShortcut: string) {
    this.props.voiceShortcut = voiceShortcut
    this.touch()
  }

  set summaryShortcut(summaryShortcut: string) {
    this.props.summaryShortcut = summaryShortcut
    this.touch()
  }

  set correctionStyle(style: string) {
    this.props.correctionStyle = style
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(props: Partial<UserProps>, id?: UniqueEntityID) {
    const user = new User(
      {
        email: props.email!,
        passwordHash: props.passwordHash!,
        name: props.name,
        plan: props.plan ?? UserPlan.PRO,
        role: props.role ?? UserRole.USER,
        shortcut: props.shortcut ?? 'Ctrl+Shift+Space',
        voiceShortcut: props.voiceShortcut ?? 'Ctrl+Shift+V',
        summaryShortcut: props.summaryShortcut ?? 'Ctrl+Shift+S',
        correctionStyle: props.correctionStyle ?? 'correct',
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
