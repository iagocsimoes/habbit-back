import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserPlan, UserRole } from '@/domain/enterprise/entities/user'

export interface MakeUserProps {
  email?: string
  passwordHash?: string
  name?: string
  plan?: UserPlan
  role?: UserRole
}

export function makeUser(
  override: MakeUserProps = {},
  id?: UniqueEntityID,
): User {
  return User.create(
    {
      email: override.email ?? 'john@example.com',
      passwordHash: override.passwordHash ?? 'hashed-password-123',
      name: override.name ?? 'John Doe',
      plan: override.plan ?? UserPlan.FREE,
      role: override.role ?? UserRole.USER,
    },
    id,
  )
}
