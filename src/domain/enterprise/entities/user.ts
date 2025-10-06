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
        correctionStyle: props.correctionStyle ?? 'correct',
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )

    return user
  }
}
