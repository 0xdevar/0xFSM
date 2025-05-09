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
import { useGraphContext, FUNC_PREFIX, FunctionScope } from '../GraphContext'
import { notifications } from '@mantine/notifications'
import { nanoid } from 'nanoid'

interface FunctionSettingsModalProps {
  opened: boolean
  onClose: () => void
  graphKey: string
}

// Interface for list items to ensure stable keys and focus management
interface ParameterItem {
  id: string // Unique ID for React key prop
  name: string
}

export default function FunctionSettingsModal ({
  opened,
  onClose,
  graphKey
}: FunctionSettingsModalProps) {
  const { getGraph, updateFunctionSettings } = useGraphContext() // Correctly use updateFunctionSettings
  // State holds ParameterItem objects for stable list rendering
  const [parameters, setParameters] = useState<ParameterItem[]>([])
  const [currentScope, setCurrentScope] = useState<FunctionScope>('shared') // Add state for scope
  const [error, setError] = useState<string | null>(null)
  // Extract function name for display (remove "func:")
  const functionName = graphKey.startsWith(FUNC_PREFIX)
    ? graphKey.substring(FUNC_PREFIX.length)
    : graphKey

  // Ref for focusing the last added input
  const lastInputRef = useRef<HTMLInputElement>(null)

  // Load current parameters and scope when modal opens or graphKey changes
  useEffect(() => {
    if (opened && graphKey) {
      const graphData = getGraph(graphKey)
      if (!graphData) {
        console.error(
          `FunctionSettingsModal: Could not find graph data for key: ${graphKey}`
        )
        setError(`Failed to load data for function ${functionName}.`)
        setParameters([])
        setCurrentScope('shared') // Default scope on error
        return
      }
      const initialParamNames = graphData.parameters || []
      // Map names to ParameterItem objects with unique IDs
      setParameters(initialParamNames.map(name => ({ id: nanoid(5), name })))
      setCurrentScope((graphData.scope as FunctionScope) || 'shared') // Load scope, default if undefined
      setError(null) // Clear error on successful load
    } else if (!opened) {
      setParameters([]) // Reset when closed
      setCurrentScope('shared')
      setError(null)
    }
  }, [opened, graphKey, getGraph, functionName])

  // Validate names whenever they change
  useEffect(() => {
    setError(null) // Clear previous error
    const names = parameters.map(p => p.name.trim())
    // Check for empty names (allow during editing, but flag)
    // const hasEmpty = names.some(name => name === '');
    // Check for invalid Lua identifier format
    const invalidName = names.find(
      name => name !== '' && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
    )
    if (invalidName) {
      setError(
        `Invalid parameter name "${invalidName}". Use letters, numbers, underscore; cannot start with number.`
      )
      return
    }
    // Check for duplicates
    const uniqueNames = new Set(names.filter(name => name !== '')) // Ignore empty strings for duplicate check
    if (uniqueNames.size !== names.filter(name => name !== '').length) {
      setError('Duplicate parameter names are not allowed.')
      return
    }
  }, [parameters])

  // Focus the last added input element
  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus()
    }
  }, [parameters.length]) // Run when the number of parameters changes

  // Update parameter name in local state
  const handleParamNameChange = (id: string, newName: string) => {
    setParameters(currentParams =>
      currentParams.map(p => (p.id === id ? { ...p, name: newName } : p))
    )
  }

  // Add a new empty parameter input to the list
  const addParameter = () => {
    // Add new item to the end
    setParameters(currentParams => [
      ...currentParams,
      { id: nanoid(5), name: '' }
    ])
    // Ref will be updated in the next render cycle and focused by the useEffect
  }

  // Remove a parameter input from the list by its unique ID
  const removeParameter = (id: string) => {
    setParameters(currentParams => currentParams.filter(p => p.id !== id))
  }

  // Save the parameters back to the context
  const handleSave = () => {
    // Final validation before saving
    if (error) {
      notifications.show({
        title: 'Validation Error',
        message: error,
        color: 'red'
      })
      return
    }
    // 1. Extract names, trim, and filter out empty strings
    const paramNames = parameters.map(p => p.name.trim()).filter(name => name)

    // 2. Double-check for duplicates (redundant but safe)
    const uniqueParamNames = [...new Set(paramNames)]
    if (uniqueParamNames.length !== paramNames.length) {
      notifications.show({
        title: 'Error Saving Parameters',
        message: 'Duplicate parameter names are not allowed.',
        color: 'red'
      })
      return
    }

    // 3. Double-check validation (redundant but safe)
    const invalidName = uniqueParamNames.find(
      name => !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
    )
    if (invalidName) {
      notifications.show({
        title: 'Error Saving Parameters',
        message: `Invalid parameter name "${invalidName}".`,
        color: 'red'
      })
      return
    }

    // 4. Call context update function
    console.log(
      `FunctionSettingsModal: Saving parameters for ${graphKey}:`,
      uniqueParamNames,
      `Scope: ${currentScope}`
    )
    // Pass the full graphKey and the currentScope
    updateFunctionSettings(graphKey, uniqueParamNames, currentScope)
    onClose() // Close modal on successful save
    notifications.show({
      title: 'Settings Updated',
      message: `Settings saved for function "${functionName}".`,
      color: 'blue'
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600}>
          Edit Settings for:{' '}
          <Text span c='blue' inherit>
            {functionName}
          </Text>
        </Text>
      }
      size='md'
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Stack gap='md'>
        <Text size='sm' c='dimmed' mb="xs">
          Define the input parameters and scope for your function. Parameters
          will be available as local variables inside the function graph. Order
          matters for parameters.
        </Text>

        <Select
          label='Function Scope'
          data={[
            { value: 'shared', label: 'Shared (Client & Server)' },
            { value: 'client', label: 'Client-Side Only' },
            { value: 'server', label: 'Server-Side Only' }
          ]}
          value={currentScope}
          onChange={(value) => setCurrentScope(value as FunctionScope)}
          allowDeselect={false}
          required
        />


        <Text size="sm" fw={500} mt="sm">Parameters:</Text>
        <ScrollArea mah={400} type='auto' style={{ overflowY: 'auto', maxHeight: '100px' }}>
          <Stack gap='xs' p={4}>
            {parameters.length === 0 && (
              <Text size='sm' c='dimmed' ta='center' p='sm'>
                No parameters defined yet.
              </Text>
            )}
            {parameters.map((param, index) => (
              <Group key={param.id} wrap='nowrap' gap='xs'>
                {' '}
                <TextInput
                  placeholder={`Parameter ${index + 1} Name`}
                  value={param.name}
                  onChange={e =>
                    handleParamNameChange(param.id, e.currentTarget.value)
                  }
                  style={{ flex: 1 }}
                  ref={index === parameters.length - 1 ? lastInputRef : null}
                  error={
                    param.name.trim() === ''
                      ? 'Name cannot be empty'
                      : !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param.name.trim())
                      ? 'Invalid format'
                      : null
                  }
                />
                <Tooltip label='Remove Parameter' withArrow position='left'>
                  <ActionIcon
                    color='red'
                    variant='light'
                    onClick={() => removeParameter(param.id)}
                    aria-label='Remove parameter'
                    radius='sm'
                  >
                    <IconTrash size='1rem' stroke={1.5} />
                  </ActionIcon>
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
          onClick={addParameter}
          fullWidth
          mt='xs'
        >
          Add Parameter
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