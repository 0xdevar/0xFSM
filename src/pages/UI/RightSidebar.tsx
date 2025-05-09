import React, { useState } from 'react'
import {
  Button,
  Paper,
  Stack,
  Text,
  Box,
  Badge,
  ActionIcon,
  Group,
  Tooltip
} from '@mantine/core'
import CreateFileModal from './components/CreateFileModal'
import { notifications } from '@mantine/notifications'
import {
  IconFilePlus,
  IconTrash,
  IconServer,
  IconDeviceLaptop
} from '@tabler/icons-react'
import { AppFile } from '../../App'
import { modals } from '@mantine/modals'
import classes from './style/RightSidebar.module.css'

interface RightSidebarProps {
  files: AppFile[]
  selectedGraphKey: string | null
  onSelectGraph: (graphKey: string | null) => void
  onAddFile: (file: AppFile) => void // Callback to notify App to add file to its state
  onDeleteFile: (file: AppFile) => void // <<< Callback to notify App to delete file
}

export default function RightSidebar ({
  files,
  selectedGraphKey,
  onSelectGraph,
  onAddFile,
  onDeleteFile
}: RightSidebarProps) {
  const [modalOpen, setModalOpen] = useState(false)

  // Style Constants (can be removed if using CSS module primarily)
  const clientBgColor = '#3b5bdb'
  const serverBgColor = '#d9a800'
  const defaultBgColor = '#2C2E33'
  const hoverBgColor = '#373A40'
  const listBgColor = '#1F2023'
  const selectedTextColor = '#FFFFFF'
  const defaultTextColor = '#C1C2C5'

  const handleCreateFileClick = () => setModalOpen(true)

  const handleCreateFile = (file: AppFile) => {
    console.log('RightSidebar: Calling onAddFile prop with:', file)
    onAddFile(file)
  }

  const handleSelectFile = (file: AppFile) => {
    const fileKey = `${file.type}/${file.name}`
    console.log(`RightSidebar: Calling onSelectGraph prop with key: ${fileKey}`)
    onSelectGraph(fileKey)
  }

  const handleDeleteFileClick = (fileToDelete: AppFile) => {
    const fileKey = `${fileToDelete.type}/${fileToDelete.name}`
    console.log(
      `RightSidebar: Delete requested for file: ${fileToDelete.name} (${fileToDelete.type}), Key: ${fileKey}`
    )

    modals.openConfirmModal({
      title: `Delete Script File?`,
      centered: true,
      children: (
        <Text size='sm'>
          {' '}
          Are you sure you want to delete the file "{fileToDelete.name}.lua" (
          {fileToDelete.type})? All nodes within this file's graph will be lost.
          This action cannot be undone.{' '}
        </Text>
      ),
      labels: { confirm: 'Delete File', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        console.log(
          `RightSidebar: Deletion CONFIRMED for: ${fileToDelete.name}. Calling onDeleteFile prop.`
        )
        try {
          onDeleteFile(fileToDelete) // Call App's handler
          notifications.show({
            title: 'File Deleted',
            message: `Successfully deleted "${fileToDelete.name}.lua".`,
            color: 'red',
            autoClose: 3000
          })
        } catch (error) {
          console.error(
            'RightSidebar: Error occurred during onDeleteFile call:',
            error
          )
          notifications.show({
            title: 'Deletion Error',
            message: `Could not delete file "${fileToDelete.name}.lua". Check console.`,
            color: 'red'
          })
        }
      },
      onCancel: () =>
        console.log(
          `RightSidebar: Deletion cancelled for: ${fileToDelete.name}.`
        )
    })
  }

  return (
    <Paper
      w={300}
      p='md'
      shadow='xs'
      withBorder
      style={{
        backgroundColor: '#1A1B1E',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Button
        onClick={handleCreateFileClick}
        mb='md'
        variant='light'
        color='blue'
        leftSection={<IconFilePlus size='1.1rem' stroke={1.5} />}
        fullWidth
        radius='sm'
      >
        {' '}
        Create Script File{' '}
      </Button>
      <Text size='xs' fw={700} c='dimmed' mb='xs' px='xs' tt='uppercase'>
        {' '}
        Script Files{' '}
      </Text>

      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: listBgColor,
          borderRadius: 'var(--mantine-radius-sm)',
          border: `1px solid var(--mantine-color-dark-4)`
        }}
      >
        <Stack gap={4} p={4}>
          {files.length === 0 && (
            <Text size='xs' c='dimmed' ta='center' p='md'>
              No script files created.
            </Text>
          )}
          {files.map(file => {
            const fileKey = `${file.type}/${file.name}`
            const isSelected = selectedGraphKey === fileKey
            const typeColor =
              file.type === 'client' ? clientBgColor : serverBgColor
            const bgColor = isSelected ? typeColor : defaultBgColor
            const textColor = isSelected ? selectedTextColor : defaultTextColor
            const icon =
              file.type === 'client' ? (
                <IconDeviceLaptop size='1rem' stroke={1.5} />
              ) : (
                <IconServer size='1rem' stroke={1.5} />
              )

            return (
              <Box
                key={fileKey}
                onClick={() => handleSelectFile(file)}
                bg={bgColor}
                p='xs'
                className={classes.fileItem}
                style={{
                  border: isSelected
                    ? `1px solid ${typeColor}`
                    : '1px solid transparent'
                }}
              >
                <Group
                  gap='xs'
                  align='center'
                  wrap='nowrap'
                  style={{ overflow: 'hidden', flex: 1, marginRight: '8px' }}
                >
                  <Box c={textColor} style={{ flexShrink: 0 }}>
                    {icon}
                  </Box>
                  <Tooltip
                    label={`${file.type}/${file.name}.lua`}
                    openDelay={500}
                    withArrow
                  >
                    <Text
                      c={textColor}
                      fw={isSelected ? 600 : 400}
                      size='sm'
                      truncate
                    >
                      {' '}
                      {file.name}.lua{' '}
                    </Text>
                  </Tooltip>
                </Group>

                {/* Type Badge and Delete Button Group */}
                <Group
                  gap='xs'
                  align='center'
                  wrap='nowrap'
                  style={{ flexShrink: 0 }}
                >
                  {/* ... Optional Badge ... */}
                  <Tooltip
                    label={`Delete ${file.name}.lua`}
                    withArrow
                    position='left'
                  >
                    <ActionIcon
                      variant='subtle'
                      color='red'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteFileClick(file)
                      }}
                      aria-label={`Delete file ${file.name}.lua`}
                      className={classes.deleteButton}
                    >
                      <IconTrash size='0.9rem' stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Box>
            )
          })}
        </Stack>
      </Box>
      <CreateFileModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateFile}
        existingFiles={files}
      />
    </Paper>
  )
}