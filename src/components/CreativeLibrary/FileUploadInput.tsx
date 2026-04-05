import React, { useRef } from 'react'
import { useTranslation } from '@/lib/i18n/TranslationContext'
import { MotionButton } from '@/components/atoms'

import { useAppDispatch, useAppSelector } from '../../store'
import { uploadFile, type UploadFileRequest } from '../../store/creativeLibrary/files.slice'

interface FileUploadInputProps {
  onFilesSelected?: React.Dispatch<File[]>
  uploadContext?: Omit<UploadFileRequest, 'file'>
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ onFilesSelected, uploadContext }) => {
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
      await dispatch(uploadFile({ file, ...uploadContext }))
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
        className="gap-3 rounded-2xl px-6 py-3 shadow-sm"
      >
        {uploading ? (
          <>
            <div aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm font-bold uppercase tracking-[0.1em]">{t('creative_library.uploading')}</span>
          </>
        ) : (
          <>
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em]">
              {t('creative_library.upload_add')}
            </span>
            <span className="text-sm font-bold tracking-[0.02em]">{t('creative_library.upload_button') || 'Ingerir Ativos'}</span>
          </>
        )}
      </MotionButton>
    </div>
  )
}

export default FileUploadInput
