import { UserRepository } from '@/domain/application/repositories/user-repository'
import { User } from '@/domain/enterprise/entities/user'

export class InMemoryUserRepository implements UserRepository {
  public items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email)
    return user ?? null
  }

  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id)
    return user ?? null
  }

  async save(user: User): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(user.id))
    if (index >= 0) {
      this.items[index] = user
    }
  }
}
