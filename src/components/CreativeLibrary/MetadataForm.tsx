import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { MotionButton } from '@/components/atoms'
import { X, Save } from 'lucide-react'

import {
  buildTagSuggestions,
  mergeTagHistory,
  parseTagInput,
  readTagHistory,
  writeTagHistory,
} from '@/lib/metadataEditor'
import {
  buildVersioningPresentation,
  isRefreshRequiredState,
  shouldShowVersioningNotice,
} from '@/lib/versioning/presentation'
import { StatusNotice } from '@/components/molecules'
import VersionHistoryPanel from './VersionHistoryPanel'
import { useAppDispatch, useAppSelector } from '../../store'
import { fetchFiles, selectFile } from '../../store/creativeLibrary/files.slice'
import { updateMetadata, clearMetadataError } from '../../store/creativeLibrary/metadata.slice'
import { fetchVersioningStatus } from '../../store/creativeLibrary/versioning.slice'

interface MetadataFormState {
  type: string
  status: string
  tags: string
  notes: string
}

type DetailTab = 'metadata' | 'history'

function toFormState(input: {
  type?: string | null
  status?: string | null
  tags?: string[]
  notes?: string | null
}): MetadataFormState {
  return {
    type: input.type || '',
    status: input.status || '',
    tags: (input.tags || []).join(', '),
    notes: input.notes || '',
  }
}

const MetadataForm: React.FC = () => {
  const { t } = useTranslation()
  const formId = 'metadata-form'
  const typeFieldId = 'metadata-type'
  const statusFieldId = 'metadata-status'
  const tagsFieldId = 'metadata-tags'
  const notesFieldId = 'metadata-notes'
  const dispatch = useAppDispatch()
  const { selectedFileId, items } = useAppSelector((state) => state.files)
  const { saving, error } = useAppSelector((state) => state.metadata)
  const selectedVersioningState = useAppSelector((state) =>
    selectedFileId ? state.versioning.byFileId[selectedFileId] ?? null : null,
  )

  const selectedFile = items.find((file) => file.id === selectedFileId)
  const metadata = selectedFile?.metadata

  const [formState, setFormState] = useState<MetadataFormState>({
    type: '',
    status: '',
    tags: '',
    notes: '',
  })
  const [initialState, setInitialState] = useState<MetadataFormState>({
    type: '',
    status: '',
    tags: '',
    notes: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [tagHistory, setTagHistory] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<DetailTab>('metadata')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    setTagHistory(readTagHistory(window.localStorage))
  }, [])

  useEffect(() => {
    if (selectedFile) {
      const nextState = toFormState({
        type: metadata?.type ?? selectedFile.type,
        status: metadata?.status ?? 'Draft',
        tags: metadata?.tags ?? [],
        notes: metadata?.notes ?? '',
      })

      setFormState(nextState)
      setInitialState(nextState)
      setValidationErrors({})
      dispatch(clearMetadataError())
    }
  }, [dispatch, metadata, selectedFile])

  useEffect(() => {
    setActiveTab('metadata')
  }, [selectedFileId])

  const parsedTags = useMemo(() => parseTagInput(formState.tags), [formState.tags])
  const existingTags = useMemo(
    () =>
      Array.from(
        new Set(
          items.flatMap((file) => file.metadata?.tags ?? []),
        ),
      ),
    [items],
  )
  const tagQuery = formState.tags.split(',').at(-1)?.trim() ?? ''
  const tagSuggestions = useMemo(
    () => buildTagSuggestions(parsedTags, existingTags, tagHistory, tagQuery),
    [existingTags, parsedTags, tagHistory, tagQuery],
  )
  const isDirty =
    formState.type !== initialState.type ||
    formState.status !== initialState.status ||
    formState.tags !== initialState.tags ||
    formState.notes !== initialState.notes
  const versioningPresentation = shouldShowVersioningNotice(selectedVersioningState)
    ? buildVersioningPresentation(selectedVersioningState, selectedFile?.filename)
    : null
  const refreshRequired = isRefreshRequiredState(selectedVersioningState)

  const resetAndClose = () => {
    setFormState(initialState)
    setValidationErrors({})
    dispatch(clearMetadataError())
    dispatch(selectFile(null))
  }

  if (!selectedFileId) {
    return (
      <div className="empty-state flex-1 rounded-none border-0 p-12">
        <div className="empty-state-icon">Panel</div>
        <p className="font-display text-lg text-text">{t('creative_library.select_asset')}</p>
      </div>
    )
  }

  if (!selectedFile) {
    return <div className="p-8">File not found</div>
  }

  const validate = () => {
    const errors: Record<string, string> = {}

    if (!formState.type) {
      errors.type = t('metadata.validation.type_required')
    }

    if (!formState.status) {
      errors.status = t('metadata.validation.status_required')
    }

    if (parsedTags.length > 20) {
      errors.tags = 'You can add up to 20 tags.'
    }

    if (formState.notes.length > 500) {
      errors.notes = t('metadata.validation.notes_max')
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (!isDirty || !validate()) {
      return
    }

    try {
      await dispatch(
        updateMetadata({
          fileId: selectedFileId,
          metadata: {
            type: formState.type,
            status: formState.status,
            tags: parsedTags,
            notes: formState.notes,
          },
        }),
      ).unwrap()
    } catch {
      return
    }

    const nextInitialState = toFormState({
      type: formState.type,
      status: formState.status,
      tags: parsedTags,
      notes: formState.notes,
    })

    setInitialState(nextInitialState)
    setFormState(nextInitialState)

    if (typeof window !== 'undefined') {
      const nextHistory = mergeTagHistory(tagHistory, parsedTags)
      setTagHistory(nextHistory)
      writeTagHistory(window.localStorage, nextHistory)
    }

    dispatch(clearMetadataError())
    dispatch(selectFile(null))
  }

  const applyTagSuggestion = (tag: string) => {
    const nextTags = [...parsedTags, tag]
    setFormState((current) => ({
      ...current,
      tags: nextTags.join(', '),
    }))
  }

  return (
    <div className="flex h-full flex-col animate-in fade-in slide-in-from-right duration-500">
      <header className="border-b border-border p-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow-label">{t('metadata.editor_title')}</span>
          <MotionButton
            variant="ghost"
            onClick={resetAndClose}
            className="p-1"
          >
            <X className="w-5 h-5" />
          </MotionButton>
        </div>
        <h3 className="truncate text-xl font-display font-bold text-text">{selectedFile.filename}</h3>
        <div className="mt-5 flex items-center gap-3">
          <MotionButton
            variant={activeTab === 'metadata' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('metadata')}
            className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
          >
            {t('metadata.editor_title').split(' ')[0]}
          </MotionButton>
          <MotionButton
            variant={activeTab === 'history' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('history')}
            className="px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]"
          >
            {t('navigation.history') || 'Histórico'}
          </MotionButton>
        </div>
      </header>

      {activeTab === 'history' ? (
        <VersionHistoryPanel file={selectedFile} versioningState={selectedVersioningState} />
      ) : (
        <>
      {versioningPresentation ? (
        <StatusNotice
          className="mx-8 mt-6"
          tone={versioningPresentation.tone}
          title={versioningPresentation.title}
          message={versioningPresentation.message}
          role={versioningPresentation.tone === 'error' ? 'alert' : 'status'}
          aside={
            versioningPresentation.showRefreshAction ? (
              <MotionButton
                variant="secondary"
                className="px-3 py-2 text-xs font-bold uppercase tracking-[0.2em]"
                onClick={async () => {
                  await dispatch(fetchFiles()).unwrap()
                  if (selectedFileId) {
                    await dispatch(fetchVersioningStatus(selectedFileId)).unwrap()
                  }
                }}
              >
                {t('status.refresh') || 'Atualizar'}
              </MotionButton>
            ) : null
          }
        />
      ) : null}

      <form
        id={formId}
        ref={formRef}
        onSubmit={handleSubmit}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            resetAndClose()
          }

          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault()
            void formRef.current?.requestSubmit()
          }
        }}
        className="flex-1 space-y-8 overflow-auto p-8"
        aria-busy={saving ? 'true' : 'false'}
      >
        <div>
          <label htmlFor={typeFieldId} className="field-label">{t('metadata.asset_type')} *</label>
          <select
            id={typeFieldId}
            aria-label="Metadata type"
            value={formState.type}
            onChange={(event) => setFormState({ ...formState, type: event.target.value })}
            aria-invalid={validationErrors.type ? 'true' : 'false'}
            aria-describedby={validationErrors.type ? `${typeFieldId}-error` : undefined}
            className={`select-field ${
              validationErrors.type ? 'select-field-error' : ''
            }`}
          >
            <option value="">{t('metadata.select_type_placeholder')}</option>
            <option value="image">{t('metadata.types.image')}</option>
            <option value="video">{t('metadata.types.video')}</option>
            <option value="carousel">{t('metadata.types.carousel')}</option>
            <option value="document">{t('metadata.types.document')}</option>
            <option value="other">{t('metadata.types.other')}</option>
          </select>
          {validationErrors.type ? <p id={`${typeFieldId}-error`} className="field-error">{validationErrors.type}</p> : null}
        </div>

        <div>
          <label htmlFor={statusFieldId} className="field-label">{t('metadata.curation_status')} *</label>
          <select
            id={statusFieldId}
            aria-label="Metadata status"
            value={formState.status}
            onChange={(event) => setFormState({ ...formState, status: event.target.value })}
            aria-invalid={validationErrors.status ? 'true' : 'false'}
            aria-describedby={validationErrors.status ? `${statusFieldId}-error` : undefined}
            className={`select-field ${
              validationErrors.status ? 'select-field-error' : ''
            }`}
          >
            <option value="">{t('metadata.select_status_placeholder') || 'Selecione o status...'}</option>
            <option value="Draft">{t('status.draft')}</option>
            <option value="In Review">{t('status.in_review')}</option>
            <option value="Approved">{t('status.approved')}</option>
            <option value="Done">{t('status.done')}</option>
          </select>
          {validationErrors.status ? <p id={`${statusFieldId}-error`} className="field-error">{validationErrors.status}</p> : null}
        </div>

        <div>
          <label htmlFor={tagsFieldId} className="field-label">{t('metadata.tags')}</label>
          <input
            id={tagsFieldId}
            aria-label="Metadata tags"
            type="text"
            placeholder="brand, social, campaign..."
            value={formState.tags}
            onChange={(event) => setFormState({ ...formState, tags: event.target.value })}
            aria-invalid={validationErrors.tags ? 'true' : 'false'}
            aria-describedby={
              validationErrors.tags
                ? `${tagsFieldId}-helper ${tagsFieldId}-error`
                : `${tagsFieldId}-helper`
            }
            className={`input-field ${
              validationErrors.tags ? 'input-field-error' : ''
            }`}
          />
          <p id={`${tagsFieldId}-helper`} className="field-helper">{t('metadata.tags_helper') || 'O histórico de tags permanece local.'}</p>
          {validationErrors.tags ? <p id={`${tagsFieldId}-error`} className="field-error">{validationErrors.tags}</p> : null}

          {tagSuggestions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tagSuggestions.map((tag) => (
                <MotionButton
                  key={tag}
                  variant="secondary"
                  onClick={() => applyTagSuggestion(tag)}
                  className="px-3 py-2 text-xs"
                >
                  {tag}
                </MotionButton>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor={notesFieldId} className="field-label mb-0">{t('metadata.internal_notes')}</label>
            <span className={`text-xs ${formState.notes.length > 450 ? 'text-status-warning' : 'text-text-muted'}`}>
              {formState.notes.length}/500
            </span>
          </div>
          <textarea
            id={notesFieldId}
            aria-label="Metadata notes"
            value={formState.notes}
            onChange={(event) => setFormState({ ...formState, notes: event.target.value })}
            aria-invalid={validationErrors.notes ? 'true' : 'false'}
            aria-describedby={validationErrors.notes ? `${notesFieldId}-error` : undefined}
            className={`textarea-field ${
              validationErrors.notes ? 'textarea-field-error' : ''
            }`}
            placeholder={t('metadata.notes_placeholder') || 'Descreva este ativo...'}
          />
          {validationErrors.notes ? <p id={`${notesFieldId}-error`} className="field-error">{validationErrors.notes}</p> : null}
        </div>

        {error ? (
          <StatusNotice
            className="animate-shake"
            tone="error"
            title={t('status.attention') || 'Atenção necessária'}
            message={error}
            role="alert"
          />
        ) : null}

        {refreshRequired ? (
          <StatusNotice
            tone="error"
            title={t('status.refresh_required') || 'Atualização necessária'}
            message={t('status.refresh_message') || 'É necessário atualizar antes de salvar novas edições.'}
            role="alert"
          />
        ) : null}
      </form>

      <footer className="flex items-center space-x-4 border-t border-border bg-surface-muted p-8">
        <MotionButton
          variant="primary"
          onClick={() => handleSubmit()}
          disabled={saving || !isDirty || refreshRequired}
          className="h-11 flex-1 font-bold"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('metadata.saving')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t('metadata.save_sync')}
            </span>
          )}
        </MotionButton>
        <MotionButton
          variant="secondary"
          onClick={resetAndClose}
          disabled={saving}
          className="h-11 px-6"
        >
          {t('metadata.cancel')}
        </MotionButton>
      </footer>
        </>
      )}
    </div>
  )
}

export default MetadataForm
