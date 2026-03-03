import type { SalesReadRepository } from '../domain/ports/SalesReadRepository.js'

/**
 * Use case para exponer metadatos usados por el frontend (order statuses, customer states, product categories)
 * Sigue la regla hexagonal: la capa de aplicación depende de un puerto (SalesReadRepository).
 */
export class GetMeta {
  constructor(private repo: SalesReadRepository) {}

  async listOrderStatuses() {
    return this.repo.listOrderStatuses()
  }

  async listCustomerStates() {
    return this.repo.listCustomerStates()
  }

  async listProductCategories() {
    return this.repo.listProductCategories()
  }
}

export default GetMeta
