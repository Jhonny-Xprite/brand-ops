import React, { useRef } from 'react'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { MotionButton } from '@/components/atoms'

import { useAppDispatch, useAppSelector } from '../../store'
import { uploadFile } from '../../store/creativeLibrary/files.slice'

interface FileUploadInputProps {
  onFilesSelected?(files: File[]): Promise<void> | void
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ onFilesSelected }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploading } = useAppSelector((state) => state.files)

  const processFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? [])

    if (files.length === 0) {
      return
    }

    if (onFilesSelected) {
      await onFilesSelected(files)
      return
    }

    for (const file of files) {
      await dispatch(uploadFile(file))
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(event.target.files)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-end">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />
      <MotionButton
        variant="primary"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-busy={uploading ? 'true' : 'false'}
        className="gap-3 px-8"
      >
        {uploading ? (
          <>
            <div aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-bold uppercase tracking-[0.1em]">{t('creative_library.uploading')}</span>
          </>
        ) : (
          <>
            <span className="text-xs font-bold uppercase tracking-[0.25em] opacity-70">Comando:</span>
            <span className="text-sm font-bold uppercase tracking-[0.1em]">{t('creative_library.upload_button') || 'Ingerir Ativos'}</span>
          </>
        )}
      </MotionButton>
    </div>
  )
}

export default FileUploadInput
