/**
 * Custom template repository port.
 * Location: src/features/templates/application/custom-template-repository.ts
 */
import type { DomainModel } from '@/core/model'
import type { CustomTemplate } from '../domain/custom-template'

export type CustomTemplateRepository = {
  list(workspaceId: string): Promise<CustomTemplate[]>
  get(id: string): Promise<CustomTemplate | null>
  saveFromModel(input: {
    workspaceId: string
    name: string
    model: DomainModel
  }): Promise<CustomTemplate>
  delete(id: string): Promise<void>
}
