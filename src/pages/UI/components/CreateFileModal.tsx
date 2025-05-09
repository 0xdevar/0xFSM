import React, { useState, useEffect } from 'react'
import { Modal, TextInput, Select, Button, Stack, Text } from '@mantine/core'
import { AppFile } from '../../../App'

interface CreateFileModalProps {
  opened: boolean
  onClose: () => void
  onCreate: (file: AppFile) => void // Use AppFile type
  existingFiles: AppFile[] // Pass existing files to check for duplicates
}

export default function CreateFileModal ({
  opened,
  onClose,
  onCreate,
  existingFiles
}: CreateFileModalProps) {
  const [fileName, setFileName] = useState('')
  const [fileType, setFileType] = useState<'client' | 'server' | null>(null) // Use null initial state
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!opened) {
      setFileName('')
      setFileType(null)
      setError(null)
    }
  }, [opened])

  // Validate input and check for duplicates on change
  useEffect(() => {
    setError(null) // Clear previous error
    const trimmedName = fileName.trim()

    if (!trimmedName) return // Don't validate empty name yet

    // Basic validation (e.g., no spaces, special chars, etc. - adapt as needed)
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedName)) {
      setError(
        'Invalid characters in name. Use letters, numbers, underscore, hyphen, dot.'
      )
      return
    }
    if (trimmedName.toLowerCase() === 'fxmanifest') {
      setError('Cannot name a file "fxmanifest".')
      return
    }

    if (fileType && trimmedName) {
      // Check if file with same name and type already exists
      const exists = existingFiles.some(
        f =>
          f.name.toLowerCase() === trimmedName.toLowerCase() &&
          f.type === fileType
      )
      if (exists) {
        setError(
          `A ${fileType} file named "${trimmedName}.lua" already exists.`
        )
      }
    }
  }, [fileName, fileType, existingFiles])

  const handleCreate = () => {
    const trimmedName = fileName.trim()
    // Final validation before creating
    if (!trimmedName || !fileType || error) {
      // Error state should already be set, or fields are missing
      if (!trimmedName) setError('File name is required.')
      else if (!fileType) setError('File type must be selected.')
      return
    }

    // Call the onCreate prop passed from the parent (RightSidebar)
    onCreate({ name: trimmedName, type: fileType })
    // No need to reset here, useEffect on 'opened' handles it
    onClose() // Close the modal
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title='Create New Script File'
      centered
      size='sm'
    >
      <Stack gap='md'>
        <TextInput
          label='File Name (.lua extension added automatically)'
          placeholder='e.g., my_client_script'
          value={fileName}
          onChange={event => setFileName(event.currentTarget.value)}
          required
          error={error && error.includes('name') ? error : null} // Show error related to name
          data-autofocus // Focus this input when modal opens
        />
        <Select
          label='File Type'
          placeholder='Select type (client or server)'
          data={[
            { value: 'client', label: 'Client-Side Script' },
            { value: 'server', label: 'Server-Side Script' }
          ]}
          value={fileType}
          onChange={value => setFileType(value as 'client' | 'server' | null)}
          required
          error={error && error.includes('type') ? error : null} // Show error related to type
        />
        {/* Display general errors (like duplicate) */}
        {error && !error.includes('name') && !error.includes('type') && (
          <Text c='red' size='sm'>
            {error}
          </Text>
        )}
        <Button
          onClick={handleCreate}
          disabled={!fileName.trim() || !fileType || !!error} // Disable if fields missing or error exists
          mt='md'
        >
          Create File
        </Button>
      </Stack>
    </Modal>
  )
}
