/**
 * Generic repository interface.
 *
 * T = entity type   K = primary-key type (default: string)
 */
export interface IRepository<T, K = string> {
  findById(id: K): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(item: T): Promise<void>;
  delete(id: K): Promise<void>;
  clear(): Promise<void>;
}
