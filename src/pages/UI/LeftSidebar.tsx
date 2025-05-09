import React, { useState } from 'react'
import {
  Box,
  Group,
  ScrollArea,
  Text,
  ActionIcon,
  TextInput,
  Button,
  Popover,
  Stack,
  Paper,
  Select,
  Divider,
  Tooltip
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCode,
  IconPlus,
  IconTrash,
  IconWebhook,
  IconServer,
  IconDeviceLaptop,
  IconWorld
} from '@tabler/icons-react'
import {
  useGraphContext,
  FUNC_PREFIX,
  EVENT_PREFIX,
  FunctionScope,
  EventScope,
  GraphData
} from './GraphContext'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'

interface LeftSidebarProps {
  selectedGraphKey: string | null
  onSelectGraph: (graphKey: string | null) => void
}

export function LeftSidebar ({
  selectedGraphKey,
  onSelectGraph
}: LeftSidebarProps) {
  const {
    getFunctionNames,
    addFunctionGraph,
    getEventNames,
    addEventGraph,
    deleteGraph,
    getGraph
  } = useGraphContext()

  // Popover States
  const [newFuncName, setNewFuncName] = useState('')
  const [newFuncScope, setNewFuncScope] = useState<FunctionScope>('shared')
  const [funcPopoverOpened, funcPopoverHandlers] = useDisclosure(false)
  const [funcNameError, setFuncNameError] = useState<string | null>(null)

  const [newEventName, setNewEventName] = useState('')
  const [newEventScope, setNewEventScope] = useState<EventScope>('client')
  const [eventPopoverOpened, eventPopoverHandlers] = useDisclosure(false)
  const [eventNameError, setEventNameError] = useState<string | null>(null)

  // Data Fetching
  const functionNames = getFunctionNames()
  const eventNames = getEventNames()

  // Style Constants
  const selectedBgColor = 'var(--mantine-color-blue-light-color)'
  const defaultBgColor = '#2C2E33'
  const hoverBgColor = '#373A40'
  const listBgColor = '#1F2023'
  const selectedTextColor = '#FFFFFF'
  const defaultTextColor = '#C1C2C5'
  const scopeIcons: Record<FunctionScope | EventScope, React.ReactNode> = {
    client: <IconDeviceLaptop size='0.9rem' stroke={1.5} />,
    server: <IconServer size='0.9rem' stroke={1.5} />,
    shared: <IconWorld size='0.9rem' stroke={1.5} />
  }
  const scopeColors: Record<FunctionScope | EventScope, string> = {
    client: 'blue',
    server: 'orange',
    shared: 'green'
  }

  // Validation Functions
  const validateFunctionName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return 'Function name cannot be empty.'
    if (trimmed.includes(':')) return 'Function name cannot contain a colon.'
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmed))
      return 'Invalid format (use letters, numbers, _, start with letter or _).'
    // Check for duplicates (case-insensitive for user-friendliness)
    if (
      functionNames.some(
        existing => existing.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return `Function "${trimmed}" already exists.`
    }
    return null // No error
  }

  const validateEventName = (name: string): string | null => {
    const trimmed = name.trim()
    if (!trimmed) return 'Event name cannot be empty.'
    if (trimmed.includes(':')) return 'Event name cannot contain a colon.'
    // Check for duplicates (case-insensitive)
    if (
      eventNames.some(
        existing => existing.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return `Event Handler for "${trimmed}" already exists.`
    }
    // Add other FiveM event name conventions if needed (e.g., length limits?)
    return null // No error
  }

  // Handlers
  const handleCreateFunction = () => {
    const error = validateFunctionName(newFuncName)
    setFuncNameError(error)
    if (error) return

    const added = addFunctionGraph(newFuncName.trim(), newFuncScope)
    if (added) {
      const newKey = `${FUNC_PREFIX}${newFuncName.trim()}`
      onSelectGraph(newKey)
      setNewFuncName('')
      setNewFuncScope('shared')
      setFuncNameError(null)
      funcPopoverHandlers.close() // Close manually on success
      notifications.show({
        title: 'Function Created',
        message: `Function "${newFuncName.trim()}" (${newFuncScope}) added.`,
        color: 'green',
        autoClose: 3000
      })
    } else {
      // This case should technically be caught by duplicate validation, but as a fallback:
      notifications.show({
        title: 'Info',
        message: `Function "${newFuncName.trim()}" already exists.`,
        color: 'yellow',
        autoClose: 3000
      })
    }
  }

  const handleCreateEvent = () => {
    const error = validateEventName(newEventName)
    setEventNameError(error)
    if (error) return

    const added = addEventGraph(newEventName.trim(), newEventScope)
    if (added) {
      const newKey = `${EVENT_PREFIX}${newEventName.trim()}`
      onSelectGraph(newKey)
      setNewEventName('')
      setNewEventScope('client')
      setEventNameError(null)
      eventPopoverHandlers.close() // Close manually on success
      notifications.show({
        title: 'Event Handler Created',
        message: `Handler for "${newEventName.trim()}" (${newEventScope}) added.`,
        color: 'green',
        autoClose: 3000
      })
    } else {
      notifications.show({
        title: 'Info',
        message: `Event handler for "${newEventName.trim()}" already exists.`,
        color: 'yellow',
        autoClose: 3000
      })
    }
  }

  // --- MODIFIED: Show confirmation before deleting ---
  const handleDeleteItem = (key: string, name: string, typeLabel: string) => {
    modals.openConfirmModal({
      title: `Delete ${typeLabel}?`,
      centered: true,
      children: (
        <Text size='sm'>
          Are you sure you want to delete the {typeLabel.toLowerCase()} "{name}
          "? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: `Delete ${typeLabel}`, cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        console.log(
          `LeftSidebar: Confirmed deletion for ${typeLabel}: ${name} (Key: ${key})`
        )
        deleteGraph(key) // Call context delete function
        if (selectedGraphKey === key) {
          onSelectGraph(null) // Deselect if it was selected
        }
        notifications.show({
          title: `${typeLabel} Deleted`,
          message: `Successfully deleted "${name}".`,
          color: 'red',
          autoClose: 3000
        })
      },
      onCancel: () => console.log('Deletion cancelled.')
    })
  }

  // Render Helper for Lists
  const renderItemList = (
    items: string[],
    prefix: typeof FUNC_PREFIX | typeof EVENT_PREFIX,
    baseIcon: React.ReactNode,
    typeLabel: string
  ) => {
    if (!items || items.length === 0) {
      return (
        <Text size='xs' c='dimmed' ta='center' p='md'>
          No {typeLabel.toLowerCase()}s created yet.
        </Text>
      )
    }

    // Sort items alphabetically, case-insensitive
    const sortedItems = [...items].sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    )

    return sortedItems.map(name => {
      const graphKey = `${prefix}${name}`
      const graphData = getGraph(graphKey)
      let scope: FunctionScope | EventScope = 'shared' // Default assumption
      if (graphData?.scope) {
        scope = graphData.scope
      } else if (prefix === EVENT_PREFIX) {
        scope = 'client' // Default event scope if missing
      }
      const isActive = selectedGraphKey === graphKey
      const bgColor = isActive ? selectedBgColor : defaultBgColor
      const textColor = isActive ? selectedTextColor : defaultTextColor

      return (
        <Box
          key={graphKey}
          onClick={() => onSelectGraph(graphKey)}
          bg={bgColor}
          p='xs'
          style={{
            borderRadius: 'var(--mantine-radius-sm)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: isActive ? 'inset 0 1px 3px rgba(0, 0, 0, 0.3)' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: isActive
              ? `1px solid ${scopeColors[scope] || 'gray'}`
              : '1px solid transparent'
          }}
          onMouseEnter={e => {
            if (!isActive) e.currentTarget.style.backgroundColor = hoverBgColor
          }}
          onMouseLeave={e => {
            if (!isActive)
              e.currentTarget.style.backgroundColor = defaultBgColor
          }}
        >
          <Group
            gap='xs'
            wrap='nowrap'
            style={{ overflow: 'hidden', flex: 1, marginRight: '8px' }}
          >
            <Box c={textColor} style={{ flexShrink: 0 }}>
              {baseIcon}
            </Box>
            <Tooltip label={`${typeLabel}: ${name}`} openDelay={500} withArrow>
              <span>
                <Text c={textColor} fw={isActive ? 600 : 400} size='sm' truncate>
                  {' '}
                  {name}{' '}
                </Text>
              </span>
            </Tooltip>
          </Group>
          <Group
            gap='xs'
            align='center'
            wrap='nowrap'
            style={{ flexShrink: 0 }}
          >
            <Tooltip label={`Scope: ${scope}`} withArrow>
               <span>
                <Box c={scopeColors[scope] || 'gray'}>{scopeIcons[scope]}</Box>
               </span>
            </Tooltip>
            <Tooltip
              label={`Delete ${typeLabel} "${name}"`}
              withArrow
              position='left'
            >
              <ActionIcon
                variant='subtle'
                color='red'
                size='sm'
                // Pass necessary info to delete handler
                onClick={e => {
                  e.stopPropagation()
                  handleDeleteItem(graphKey, name, typeLabel)
                }}
                aria-label={`Delete ${typeLabel} ${name}`}
                className='delete-button' // Keep class for hover style
              >
                {' '}
                <IconTrash size='0.9rem' stroke={1.5} />{' '}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Box>
      )
    })
  }

  // Component Structure
  return (
    <Paper
      w={250}
      p='md'
      shadow='xs'
      withBorder
      style={{
        background: '#1A1B1E',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Group justify='space-between' mb='xs' px='xs'>
          <Text fw={700} size='xs' c='dimmed' tt='uppercase'>
            Functions
          </Text>
          
          <Popover
            opened={funcPopoverOpened}
            onChange={funcPopoverHandlers.toggle}
            trapFocus
            position='bottom-end'
            withArrow
            shadow='md'
            withinPortal
            closeOnClickOutside={false} // Prevent closing when interacting with Select
          >
            <Popover.Target>
              <Tooltip label='Add New Function' withArrow>
                <ActionIcon
                  variant='light'
                  color='blue'
                  size='sm'
                  onClick={funcPopoverHandlers.open}
                  radius='sm'
                >
                  <IconPlus size='1rem' stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown p='sm'>
              
              <Stack gap='sm'>
                <TextInput
                  label='Function Name'
                  placeholder='myNewFunction'
                  size='xs'
                  value={newFuncName}
                  onChange={e => {
                    setNewFuncName(e.currentTarget.value)
                    setFuncNameError(
                      validateFunctionName(e.currentTarget.value)
                    )
                  }}
                  error={funcNameError}
                  data-autofocus
                />
                <Select
                  label='Scope'
                  size='xs'
                  data={[
                    { value: 'shared', label: 'Shared' },
                    { value: 'client', label: 'Client' },
                    { value: 'server', label: 'Server' }
                  ]}
                  value={newFuncScope}
                  onChange={v => setNewFuncScope(v as FunctionScope)}
                  allowDeselect={false}
                />
                <Group justify='flex-end' mt='xs'>
                  <Button
                    size='xs'
                    variant='default'
                    onClick={funcPopoverHandlers.close}
                  >
                    Cancel
                  </Button>
                  <Button
                    size='xs'
                    onClick={handleCreateFunction}
                    disabled={!!funcNameError || !newFuncName.trim()}
                  >
                    Create
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
        <Box
          style={{
            maxHeight: 'calc(50vh - 120px)',
            minHeight: '100px',
            overflowY: 'auto',
            backgroundColor: listBgColor,
            borderRadius: 'var(--mantine-radius-sm)',
            border: `1px solid var(--mantine-color-dark-4)`
          }}
        >
          <ScrollArea style={{ height: '100%' }} type='auto'>
            <Stack gap={4} p={4}>
              {renderItemList(
                functionNames,
                FUNC_PREFIX,
                <IconCode size='1rem' stroke={1.5} />,
                'Function'
              )}
            </Stack>
          </ScrollArea>
        </Box>
      </Box>

      <Divider my='md' />

      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flex: 1
        }}
      >
        <Group justify='space-between' mb='xs' px='xs'>
          <Text fw={700} size='xs' c='dimmed' tt='uppercase'>
            Event Handlers
          </Text>
          <Popover
            opened={eventPopoverOpened}
            onChange={eventPopoverHandlers.toggle}
            trapFocus
            position='bottom-end'
            withArrow
            shadow='md'
            withinPortal
            closeOnClickOutside={false} // Prevent closing when interacting with Select
          >
            <Popover.Target>
              <Tooltip label='Add New Event Handler' withArrow>
                <ActionIcon
                  variant='light'
                  color='teal'
                  size='sm'
                  onClick={eventPopoverHandlers.open}
                  radius='sm'
                >
                  <IconPlus size='1rem' stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown p='sm'>
              <Stack gap='sm'>
                <TextInput
                  label='Event Name'
                  placeholder='myCustomEvent'
                  size='xs'
                  value={newEventName}
                  onChange={e => {
                    setNewEventName(e.currentTarget.value)
                    setEventNameError(validateEventName(e.currentTarget.value))
                  }}
                  error={eventNameError}
                  data-autofocus
                />
                <Select
                  label='Scope'
                  size='xs'
                  data={[
                    { value: 'client', label: 'Client' },
                    { value: 'server', label: 'Server' }
                  ]}
                  value={newEventScope}
                  onChange={v => setNewEventScope(v as EventScope)}
                  allowDeselect={false}
                />
                <Group justify='flex-end' mt='xs'>
                  <Button
                    size='xs'
                    variant='default'
                    onClick={eventPopoverHandlers.close}
                  >
                    Cancel
                  </Button>
                  <Button
                    size='xs'
                    color='teal'
                    onClick={handleCreateEvent}
                    disabled={!!eventNameError || !newEventName.trim()}
                  >
                    Create
                  </Button>
                </Group>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: listBgColor,
            borderRadius: 'var(--mantine-radius-sm)',
            border: `1px solid var(--mantine-color-dark-4)`
          }}
        >
          <ScrollArea style={{ height: '100%' }} type='auto'>
            <Stack gap={4} p={4}>
              {renderItemList(
                eventNames,
                EVENT_PREFIX,
                <IconWebhook size='1rem' stroke={1.5} />,
                'Event Handler'
              )}
            </Stack>
          </ScrollArea>
        </Box>
      </Box>

      <style>{`.delete-button { opacity: 0; transition: opacity 0.2s ease; } .mantine-Box:hover .delete-button { opacity: 0.6; } .delete-button:hover { opacity: 1; background-color: rgba(255, 87, 87, 0.1); }`}</style>
    </Paper>
  )
}