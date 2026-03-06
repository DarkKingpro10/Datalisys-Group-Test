import type { PaymentQueryParams } from '../domain/models/SalesModel.js';
import type { SalesReadRepository } from '../domain/ports/SalesReadRepository.js';

export class GetAuditPaymentsWithoutItems {
  constructor(private repo: SalesReadRepository) {}

  async execute(params: PaymentQueryParams) {
    return this.repo.getAuditPaymentsWithoutItems(params);
  }
}