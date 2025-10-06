import { User as PrismaUser, Plan as PrismaPlan, Role as PrismaRole } from '@prisma/client'
import { User, UserPlan, UserRole } from '@/domain/enterprise/entities/user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        email: raw.email,
        passwordHash: raw.passwordHash,
        name: raw.name ?? undefined,
        plan: raw.plan as UserPlan,
        role: raw.role as UserRole,
        shortcut: raw.shortcut,
        correctionStyle: raw.correctionStyle,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id.toString(),
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name ?? null,
      plan: user.plan as PrismaPlan,
      role: user.role as PrismaRole,
      shortcut: user.shortcut,
      correctionStyle: user.correctionStyle,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
