import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  ActionIcon,
  Text,
  ScrollArea,
  Tooltip,
  Box,
  Select
} from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { useGraphContext, EVENT_PREFIX, EventScope } from '../GraphContext'
import { notifications } from '@mantine/notifications'
import { nanoid } from 'nanoid'

interface EventSettingsModalProps {
  opened: boolean
  onClose: () => void
  graphKey: string
}

// Interface for list items to ensure stable keys and focus management
interface ArgumentNameItem {
  id: string // Unique ID for React key prop
  name: string
}

export default function EventSettingsModal ({
  opened,
  onClose,
  graphKey
}: EventSettingsModalProps) {
  // Correctly destructure updateEventSettings
  const { getGraph, updateEventSettings } = useGraphContext()
  const [argumentNames, setArgumentNames] = useState<ArgumentNameItem[]>([])
  const [currentScope, setCurrentScope] = useState<EventScope>('client') // Add state for scope
  const [error, setError] = useState<string | null>(null)
  const eventName = graphKey.startsWith(EVENT_PREFIX)
    ? graphKey.substring(EVENT_PREFIX.length)
    : graphKey

  const lastInputRef = useRef<HTMLInputElement>(null)

  // Load current argument names and scope when modal opens or graphKey changes
  useEffect(() => {
    if (opened && graphKey) {
      const graphData = getGraph(graphKey)
      if (!graphData) {
        console.error(
          `EventSettingsModal: Could not find graph data for key: ${graphKey}`
        )
        setError(`Failed to load data for event ${eventName}.`)
        setArgumentNames([])
        setCurrentScope('client') // Default scope on error
        return
      }
      const initialArgNames = graphData.argumentNames || []
      setArgumentNames(initialArgNames.map(name => ({ id: nanoid(5), name })))
      setCurrentScope((graphData.scope as EventScope) || 'client') // Load scope, default if undefined
      setError(null)
    } else if (!opened) {
      setArgumentNames([])
      setCurrentScope('client')
      setError(null)
    }
  }, [opened, graphKey, getGraph, eventName])

  // Validate argument names
  useEffect(() => {
    setError(null)
    const names = argumentNames.map(arg => arg.name.trim())
    const invalidName = names.find(
      name => name !== '' && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
    )
    if (invalidName) {
      setError(
        `Invalid argument name "${invalidName}". Use letters, numbers, underscore; cannot start with number.`
      )
      return
    }
    const uniqueNames = new Set(names.filter(name => name !== ''))
    if (uniqueNames.size !== names.filter(name => name !== '').length) {
      setError('Duplicate argument names are not allowed.')
      return
    }
  }, [argumentNames])

  // Focus last input
  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus()
    }
  }, [argumentNames.length])

  const handleArgNameChange = (id: string, newName: string) => {
    setArgumentNames(currentArgs =>
      currentArgs.map(arg => (arg.id === id ? { ...arg, name: newName } : arg))
    )
  }

  const addArgumentName = () => {
    setArgumentNames(currentArgs => [
      ...currentArgs,
      { id: nanoid(5), name: '' }
    ])
  }

  const removeArgumentName = (id: string) => {
    setArgumentNames(currentArgs => currentArgs.filter(arg => arg.id !== id))
  }

  // Save arguments and scope back to context
  const handleSave = () => {
    if (error) {
      notifications.show({
        title: 'Validation Error',
        message: error,
        color: 'red'
      })
      return
    }
    const finalArgNames = argumentNames
      .map(p => p.name.trim())
      .filter(name => name)

    const uniqueArgNames = [...new Set(finalArgNames)]
    if (uniqueArgNames.length !== finalArgNames.length) {
      notifications.show({
        title: 'Error',
        message: 'Duplicate argument names found on save.',
        color: 'red'
      })
      return
    }
    const invalidName = uniqueArgNames.find(
      name => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
    )
    if (invalidName) {
      notifications.show({
        title: 'Error',
        message: `Invalid argument name "${invalidName}" found on save.`,
        color: 'red'
      })
      return
    }

    console.log(
      `EventSettingsModal: Saving arguments for ${graphKey}:`, 
      uniqueArgNames,
      `Scope: ${currentScope}`
    )
    updateEventSettings(graphKey, uniqueArgNames, currentScope)
    onClose()
    notifications.show({
      title: 'Settings Updated',
      message: `Settings saved for event handler "${eventName}".`,
      color: 'blue'
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600}>
          Edit Settings for:
          <Text span c='teal' inherit>
            {eventName}
          </Text>
        </Text>
      }
      size='md'
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap='md'>
        <Text size='sm' c='dimmed' mb="xs">
          Define the argument names and scope for your event handler.
          Argument names become local variables within the event graph. Order matters.
          {eventName === 'playerConnecting' && (
            <Text inherit c='orange' size='xs' mt={4}>
              Note: `playerConnecting` has standard arguments (playerName,
              setKickReason, deferrals). Add them if needed.
            </Text>
          )}
          {eventName === 'playerDropped' && (
            <Text inherit c='orange' size='xs' mt={4}>
              Note: `playerDropped` has a standard argument (reason). Add it if
              needed.
            </Text>
          )}
        </Text>

        <Select
          label='Event Handler Scope'
          data={[
            { value: 'client', label: 'Client-Side' },
            { value: 'server', label: 'Server-Side' },
          ]}
          value={currentScope}
          onChange={(value) => setCurrentScope(value as EventScope)}
          allowDeselect={false}
          required
        />

        <Text size="sm" fw={500} mt="sm">Arguments:</Text>
        <ScrollArea mah={250} type='auto' style={{ overflowY: 'auto', maxHeight: '100px' }}>
          <Stack gap='xs' p={4}>
            {argumentNames.length === 0 && (
              <Text size='sm' c='dimmed' ta='center' p='sm'>
                No arguments defined yet.
              </Text>
            )}
            {argumentNames.map((arg, index) => (
              <Group key={arg.id} wrap='nowrap' gap='xs'>
                <TextInput
                  placeholder={`Argument ${index + 1} Name`}
                  value={arg.name}
                  onChange={e =>
                    handleArgNameChange(arg.id, e.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                  ref={index === argumentNames.length - 1 ? lastInputRef : null}
                  error={
                    arg.name.trim() === ''
                      ? 'Name cannot be empty'
                      : !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(arg.name.trim())
                      ? 'Invalid format'
                      : null
                  }
                />
                <Tooltip label='Remove Argument' withArrow position='left'>
                  <span>
                    <ActionIcon
                      color='red'
                      variant='light'
                      onClick={() => removeArgumentName(arg.id)}
                      radius='sm'
                    >
                      <IconTrash size='1rem' stroke={1.5} />
                    </ActionIcon>
                  </span>
                </Tooltip>
              </Group>
            ))}
          </Stack>
        </ScrollArea>

        {error && (
          <Box
            bg='var(--mantine-color-red-light)'
            p='xs'
            style={{ borderRadius: 'var(--mantine-radius-sm)' }}
          >
            <Text c='red' size='sm'>
              {error}
            </Text>
          </Box>
        )}

        <Button
          leftSection={<IconPlus size='1rem' stroke={1.5} />}
          variant='light'
          onClick={addArgumentName}
          fullWidth
          mt='xs'
        >
          Add Argument Name
        </Button>

        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!error}>
            Save Settings
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}