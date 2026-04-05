import { useCallback, useEffect, useState } from 'react'

import {
  getDomainUploadScope,
  type ProjectLibraryDomain,
  type ProjectLibraryRelationType,
  type SerializedProjectLibraryItem,
} from '@/lib/projectDomain'

export interface RelationTargetInput {
  targetItemId: string
  relationType: ProjectLibraryRelationType
}

export interface SaveProjectLibraryItemInput {
  id?: string
  category: string
  title: string
  description?: string
  content?: string
  status?: string
  linkUrl?: string
  kind?: 'NOTE' | 'FILE' | 'LINK' | 'PALETTE'
  isPrimary?: boolean
  assetFile?: File | null
  assetFileId?: string | null
  payload?: Record<string, string | boolean | string[] | null>
  relationTargets?: RelationTargetInput[]
}

function buildQuery(projectId: string, domain?: ProjectLibraryDomain, search?: string) {
  const searchParams = new URLSearchParams()
  if (domain) {
    searchParams.set('domain', domain)
  }
  if (search?.trim()) {
    searchParams.set('search', search.trim())
  }
  return `/api/projeto/${projectId}/library?${searchParams.toString()}`
}

async function uploadAsset(projectId: string, domain: ProjectLibraryDomain, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  formData.append('scope', getDomainUploadScope(domain))

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Falha no upload do arquivo.' }))
    throw new Error(errorData.error || 'Falha no upload do arquivo.')
  }

  const result = (await response.json()) as { file: { id: string } }
  return result.file.id
}

export function useProjectDomainLibrary(projectId: string, domain: ProjectLibraryDomain) {
  const [items, setItems] = useState<SerializedProjectLibraryItem[]>([])
  const [allItems, setAllItems] = useState<SerializedProjectLibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(
    async (search?: string) => {
      setLoading(true)
      setError(null)
      try {
        const [domainResponse, allItemsResponse] = await Promise.all([
          fetch(buildQuery(projectId, domain, search)),
          fetch(buildQuery(projectId)),
        ])

        if (!domainResponse.ok) {
          throw new Error('Nao foi possivel carregar os itens deste dominio.')
        }

        if (!allItemsResponse.ok) {
          throw new Error('Nao foi possivel carregar as relacoes disponiveis.')
        }

        const domainData = (await domainResponse.json()) as { items: SerializedProjectLibraryItem[] }
        const allData = (await allItemsResponse.json()) as { items: SerializedProjectLibraryItem[] }

        setItems(domainData.items)
        setAllItems(allData.items)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Nao foi possivel carregar os itens deste dominio.')
      } finally {
        setLoading(false)
      }
    },
    [domain, projectId],
  )

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const saveItem = useCallback(
    async (input: SaveProjectLibraryItemInput) => {
      setSaving(true)
      setError(null)

      try {
        const assetFileId =
          input.assetFile instanceof File ? await uploadAsset(projectId, domain, input.assetFile) : input.assetFileId

        const body = {
          domain,
          category: input.category,
          title: input.title,
          description: input.description,
          content: input.content,
          status: input.status,
          linkUrl: input.linkUrl,
          kind: input.kind,
          isPrimary: input.isPrimary,
          assetFileId,
          payload: input.payload ?? {},
          relationTargets: input.relationTargets ?? [],
        }

        const response = await fetch(
          input.id ? `/api/projeto/${projectId}/library/${input.id}` : `/api/projeto/${projectId}/library`,
          {
            method: input.id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Nao foi possivel salvar este item.' }))
          throw new Error(errorData.error || 'Nao foi possivel salvar este item.')
        }

        await loadItems()
      } finally {
        setSaving(false)
      }
    },
    [domain, loadItems, projectId],
  )

  const deleteItem = useCallback(
    async (itemId: string) => {
      setSaving(true)
      setError(null)
      try {
        const response = await fetch(`/api/projeto/${projectId}/library/${itemId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Nao foi possivel remover este item.' }))
          throw new Error(errorData.error || 'Nao foi possivel remover este item.')
        }

        await loadItems()
      } finally {
        setSaving(false)
      }
    },
    [loadItems, projectId],
  )

  return {
    items,
    allItems,
    loading,
    saving,
    error,
    loadItems,
    saveItem,
    deleteItem,
  }
}

export default useProjectDomainLibrary
