# Appendix — Useful Commands and Patterns

## File Upload Pattern (Frontend)

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'image')
  
  const response = await fetch('/api/files', {
    method: 'POST',
    body: formData,
  })
  
  const result = await response.json()
  return result.fileId
}
```

## Metadata Update Pattern

```typescript
const updateMetadata = async (fileId: string, metadata: FileMetadata) => {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })
  
  return response.json()
}
```

## Component Integration with Redux

```typescript
function CreativeLibraryWorkspace() {
  const dispatch = useAppDispatch()
  const files = useAppSelector(state => state.creativeLibrary.files)
  
  useEffect(() => {
    dispatch(fetchFiles()) // Async thunk from RTK Query
  }, [dispatch])
  
  return (
    <>
      {files.map(file => (
        <FileCard key={file.id} file={file} />
      ))}
    </>
  )
}
```

## API Route Error Handling

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Operation
  } catch (error) {
    console.error('Operation failed:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
```

---
