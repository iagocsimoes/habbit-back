import { UseCaseError } from '@/core/errors/use-case-error'

export class MonthlyLimitExceededError extends Error implements UseCaseError {
  constructor() {
    super('Monthly correction limit exceeded.')
  }
}
