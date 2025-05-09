import '@mantine/spotlight/styles.css'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Box,
  Text,
  Group,
  Button,
  Title,
  ActionIcon,
  Tooltip
} from '@mantine/core' // Added Tooltip
import {
  IconPlus,
  IconSearch,
  IconPlayerPlay,
  IconCode,
  IconFile,
  IconSettings,
  IconWebhook
} from '@tabler/icons-react' // Added IconWebhook
import {
  Spotlight,
  SpotlightActionGroupData,
  spotlight
} from '@mantine/spotlight'
import { DndList } from './components/DndList'
import {
  NodeDefinition,
  DraggableNode
} from '../../components/types/NodeDefinition'
import { nodeActions as nodeRegistry } from '../../components/nodeRegistry'
import { notifications } from '@mantine/notifications'
// Import FunctionScope and EventScope
import {
  useGraphContext,
  FUNC_PREFIX,
  EVENT_PREFIX,
  GraphData,
  FunctionScope,
  EventScope
} from './GraphContext' // Added EVENT_PREFIX, EventScope
import { WorkflowExecutor } from '../../components/WorkflowExecutor'
import FunctionSettingsModal from './components/FunctionSettingsModal'
import EventSettingsModal from './components/EventSettingsModal' // Import EventSettingsModal
import NodeEditorModal from './components/NodeEditorModal'
import { nanoid } from 'nanoid'

interface GraphEditorProps {
  selectedGraphKey: string | null
}

// Helper to filter spotlight actions based on allowed graph type
function filterAndGroupNodes (
  nodeTemplates: NodeDefinition[],
  handleAddNode: (nodeTemplate: NodeDefinition) => void,
  currentGraphType: 'file' | 'function' | 'event' | null
): SpotlightActionGroupData[] {
  const groups: Record<string, SpotlightActionGroupData> = {}
  nodeTemplates.forEach(node => {
    const isAllowed =
      currentGraphType &&
      (!node.allowedGraphTypes ||
        node.allowedGraphTypes.includes(currentGraphType))
    if (isAllowed) {
      if (!groups[node.category])
        groups[node.category] = { group: node.category, actions: [] }
      groups[node.category].actions.push({
        id: node.id,
        label: node.label,
        description: node.description,
        onClick: () => handleAddNode(node),
        leftSection: node.leftSection
      })
    }
  })
  return Object.values(groups)
}

export default function GraphEditor ({ selectedGraphKey }: GraphEditorProps) {
  const {
    graphs,
    addNodeToGraph,
    reorderNodes,
    updateNode,
    deleteNodeFromGraph
  } = useGraphContext()

  const [isFuncSettingsModalOpen, setIsFuncSettingsModalOpen] = useState(false)
  const [isEventSettingsModalOpen, setIsEventSettingsModalOpen] =
    useState(false)
  const [editingNode, setEditingNode] = useState<{
    node: DraggableNode
    index: number
  } | null>(null)

  // Determine graph type, display name, parameters/args, AND SCOPE
  const {
    graphType,
    displayName,
    parameters,
    argumentNames,
    currentGraphScope
  } = useMemo(() => {
    const defaultReturn = {
      graphType: null,
      displayName: 'No Graph Selected',
      parameters: undefined,
      argumentNames: undefined,
      currentGraphScope: undefined
    }

    if (!selectedGraphKey) {
      console.log('GraphEditor: No graph selected.')
      return defaultReturn // Return default if no key
    }

    const graphData = graphs[selectedGraphKey]
    if (!graphData) {
      console.warn(
        `GraphEditor: Graph data not found for key: ${selectedGraphKey}`
      )
      // Don't return default here yet, try to determine type from key format first
      // return defaultReturn;
    }

    let type: 'file' | 'function' | 'event' | null = null
    let name = `Unknown Graph: ${selectedGraphKey}`
    let scope: FunctionScope | EventScope | undefined = undefined
    let params: string[] | undefined = undefined
    let args: string[] | undefined = undefined

    try {
      if (selectedGraphKey.startsWith(FUNC_PREFIX)) {
        type = 'function'
        const funcName = selectedGraphKey.substring(FUNC_PREFIX.length)
        name = `Function: ${funcName}`
        // Get params/scope reliably from potentially existing graphData
        params = graphData?.parameters
        scope = graphData?.scope as FunctionScope
      } else if (selectedGraphKey.startsWith(EVENT_PREFIX)) {
        type = 'event'
        const eventName = selectedGraphKey.substring(EVENT_PREFIX.length)
        name = `Event Handler: ${eventName}`
        // Get args/scope reliably from potentially existing graphData
        args = graphData?.argumentNames
        scope = graphData?.scope as EventScope
      } else if (
        selectedGraphKey.includes('/') &&
        !selectedGraphKey.startsWith(FUNC_PREFIX) &&
        !selectedGraphKey.startsWith(EVENT_PREFIX)
      ) {
        const parts = selectedGraphKey.split('/')
        // Basic check for client/server folder structure
        if (
          parts.length >= 2 &&
          (parts[0] === 'client' || parts[0] === 'server')
        ) {
          type = 'file'
          const fileType = parts[0] as EventScope // File scope is EventScope ('client' or 'server')
          const fileName = parts.slice(1).join('/') // Handle potential subfolders
          name = `File: ${fileType}/${fileName}.lua`
          scope = fileType // File scope is simply its type (client/server)
          // File graphs don't have parameters or argumentNames intrinsically
        }
      }

      // Final check: if type couldn't be determined, log warning
      if (!type) {
        console.warn(
          `GraphEditor: Unrecognized graph key format or failed to determine type: ${selectedGraphKey}`
        )
        return {
          graphType: null,
          displayName: `Error: Invalid Key (${selectedGraphKey})`,
          parameters: undefined,
          argumentNames: undefined,
          currentGraphScope: undefined
        }
      }

      // Return the successfully determined info
      return {
        graphType: type,
        displayName: name,
        parameters: params,
        argumentNames: args,
        currentGraphScope: scope
      }
    } catch (error) {
      console.error('Error processing graph key:', selectedGraphKey, error)
      // Return default on unexpected errors during processing
      return defaultReturn
    }
  }, [selectedGraphKey, graphs]) // Dependencies

  // Get current graph nodes from context state
  const currentGraphNodes: DraggableNode[] = useMemo(
    () => graphs[selectedGraphKey || '']?.nodes || [],
    [selectedGraphKey, graphs]
  )

  // --- Handlers ---
  const handleAddNode = useCallback(
    (nodeTemplate: NodeDefinition) => {
      if (!selectedGraphKey) {
        notifications.show({
          title: 'Cannot Add Node',
          message: 'Please select a file, function, or event first.',
          color: 'yellow'
        })
        return
      }
      // Double-check allowed graph types before adding
      const currentType = graphType // Get determined type from memo
      if (currentType) {
        if (
          nodeTemplate.allowedGraphTypes &&
          !nodeTemplate.allowedGraphTypes.includes(currentType)
        ) {
          notifications.show({
            title: 'Node Not Allowed',
            message: `"${nodeTemplate.label}" cannot be added to a ${currentType} graph.`,
            color: 'orange'
          })
          return
        }
      } else {
        // This case shouldn't happen if selectedGraphKey exists, but as a safeguard:
        notifications.show({
          title: 'Error',
          message: 'Could not determine graph type. Cannot add node.',
          color: 'red'
        })
        return
      }

      // Proceed with adding
      const newNodeInstance: DraggableNode = {
        ...nodeTemplate,
        runtimeId: nanoid(10)
      }
      if (
        newNodeInstance.id === 'callFunction' &&
        !newNodeInstance.argumentSources
      ) {
        newNodeInstance.argumentSources = [] // Ensure array exists
      }
      addNodeToGraph(selectedGraphKey, newNodeInstance)
      notifications.show({
        title: 'Node Added',
        message: `Added "${newNodeInstance.label}" to ${displayName}.`,
        color: 'green',
        autoClose: 2000
      })
    },
    [selectedGraphKey, addNodeToGraph, graphType, displayName]
  )

  const handleReorder = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      if (selectedGraphKey) {
        if (
          from < 0 ||
          from >= currentGraphNodes.length ||
          to < 0 ||
          to > currentGraphNodes.length
        ) {
          console.warn(
            `GraphEditor: Invalid reorder indices (from: ${from}, to: ${to}, length: ${currentGraphNodes.length})`
          )
          return
        }
        reorderNodes(selectedGraphKey, from, to)
      }
    },
    [selectedGraphKey, reorderNodes, currentGraphNodes.length]
  )

  const handleDeleteNode = useCallback(
    (index: number) => {
      if (selectedGraphKey) {
        if (index < 0 || index >= currentGraphNodes.length) {
          console.warn(
            `GraphEditor: Invalid delete index (index: ${index}, length: ${currentGraphNodes.length})`
          )
          return
        }
        const nodeLabel = currentGraphNodes[index]?.label || 'Node'
        deleteNodeFromGraph(selectedGraphKey, index)
        // Notification now handled within deleteNodeFromGraph in context
      }
    },
    [selectedGraphKey, deleteNodeFromGraph, currentGraphNodes, displayName]
  ) // displayName removed as notification is in context

  const handleOpenNodeEditor = useCallback(
    (node: DraggableNode, index: number) => {
      if (!node || index < 0) {
        console.error(
          'GraphEditor: Attempted to open editor for invalid node or index.',
          { node, index }
        )
        return
      }
      setEditingNode({ node, index })
    },
    []
  ) // Removed currentGraphScope dependency, it's passed directly to modal now

  const handleCloseNodeEditor = useCallback(() => {
    setEditingNode(null)
  }, [])

  const handleSaveNode = useCallback(
    (updatedNodeData: NodeDefinition & { index: number }) => {
      if (selectedGraphKey) {
        const { index, ...nodeToUpdate } = updatedNodeData
        if (index < 0 || index >= currentGraphNodes.length) {
          console.warn(
            `GraphEditor: Invalid save index (index: ${index}, length: ${currentGraphNodes.length})`
          )
          return
        }
        // Add back the runtimeId before updating
        const originalRuntimeId = currentGraphNodes[index]?.runtimeId
        if (!originalRuntimeId) {
          console.error(
            'GraphEditor: Failed to find original runtimeId for node update at index:',
            index
          )
          setEditingNode(null) // Close modal to prevent further issues
          return
        }
        // Preserve the leftSection property to avoid losing the icon
        const originalLeftSection = currentGraphNodes[index]?.leftSection;
        updateNode(selectedGraphKey, index, {
          ...nodeToUpdate,
          runtimeId: originalRuntimeId,
          leftSection: originalLeftSection // Ensure the icon is retained
        } as DraggableNode)
        notifications.show({
          title: 'Node Updated',
          message: `"${nodeToUpdate.label || 'Node'}" properties saved.`,
          color: 'blue',
          autoClose: 2000
        })
      }
      setEditingNode(null) // Close modal
    },
    [selectedGraphKey, updateNode, currentGraphNodes]
  ) // Use currentGraphNodes directly

  // Workflow Execution
  const executeWorkflow = useCallback(() => {
    if (!selectedGraphKey) {
      notifications.show({
        title: 'Execution Error',
        message: 'No graph selected.',
        color: 'red'
      })
      return
    }
    if (graphType !== 'file') {
      notifications.show({
        title: 'Execution Info',
        message:
          'Workflow execution simulation is currently only available for Script Files.',
        color: 'yellow'
      })
      return
    }
    if (currentGraphNodes.length === 0) {
      notifications.show({
        title: 'Execution Info',
        message: `Graph "${displayName}" is empty. Nothing to execute.`,
        color: 'blue'
      })
      return
    }

    // Define the graph lookup function needed by the executor
    const graphLookup = (key: string): GraphData | undefined => {
      return graphs[key]
    }

    try {
      const executor = new WorkflowExecutor(currentGraphNodes, graphLookup)
      const { success, results, variables, returnValue } = executor.execute()

      if (success) {
        notifications.show({
          title: 'Execution Complete',
          message: `Simulated execution of "${displayName}" finished. ${results.length} actions logged.`,
          color: 'green'
        })
        console.log('Execution Results:', results)
        console.log('Final Variables:', variables)
        if (returnValue !== undefined) console.log('Return Value:', returnValue)
      } else {
        // Error notification is shown within the executor now
        console.error('Execution Failed. See logs for details.')
      }
    } catch (error: any) {
      console.error('Error initializing or running WorkflowExecutor:', error)
      notifications.show({
        title: 'Execution Failed',
        message: `An unexpected error occurred: ${
          error.message || 'Unknown error'
        }`,
        color: 'red'
      })
    }
  }, [selectedGraphKey, graphType, currentGraphNodes, graphs, displayName])

  // Spotlight Actions
  const spotlightActions = useMemo(
    () => filterAndGroupNodes(nodeRegistry, handleAddNode, graphType),
    [nodeRegistry, handleAddNode, graphType]
  )

  // --- Render ---
  return (
    <Box
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: '#141517',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {selectedGraphKey ? (
        <>
          {/* Header */}
          <Group
            justify='space-between'
            align='center'
            p='md'
            style={{
              borderBottom: '1px solid var(--mantine-color-dark-4)',
              background: '#1A1B1E',
              flexShrink: 0
            }}
          >
            <Group gap='xs' align='center'>
              {/* Icons based on determined graphType */}
              {graphType === 'function' ? (
                <IconCode size={20} />
              ) : graphType === 'event' ? (
                <IconWebhook size={20} />
              ) : graphType === 'file' ? (
                <IconFile size={20} />
              ) : null}
              <Title
                order={4}
                c='white'
                style={{
                  maxWidth: 300,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {' '}
                {displayName || 'Loading...'}{' '}
              </Title>{' '}
              {/* Handle potential null displayName briefly */}
              {/* Settings Icons: Show based on type AND selected key */}
              {graphType === 'function' &&
                selectedGraphKey.startsWith(FUNC_PREFIX) && (
                  <Tooltip label='Edit Function Parameters' withArrow>
                    <ActionIcon
                      variant='subtle'
                      color='gray'
                      size='sm'
                      onClick={() => setIsFuncSettingsModalOpen(true)}
                      ml='xs'
                    >
                      <IconSettings size='1rem' />
                    </ActionIcon>
                  </Tooltip>
                )}
              {graphType === 'event' &&
                selectedGraphKey.startsWith(EVENT_PREFIX) && (
                  <Tooltip label='Edit Event Arguments' withArrow>
                    <ActionIcon
                      variant='subtle'
                      color='gray'
                      size='sm'
                      onClick={() => setIsEventSettingsModalOpen(true)}
                      ml='xs'
                    >
                      <IconSettings size='1rem' />
                    </ActionIcon>
                  </Tooltip>
                )}
            </Group>
            <Group gap='sm'>
              {' '}
              {/* Action Buttons */}
              <Tooltip
                label={
                  graphType !== 'file'
                    ? 'Execution simulation only available for Script Files'
                    : 'Execute Script Simulation'
                }
                withArrow
              >
                <Button
                  variant='light'
                  color='blue'
                  size='xs'
                  radius='md'
                  leftSection={<IconPlayerPlay size={16} />}
                  onClick={executeWorkflow}
                  disabled={graphType !== 'file'}
                >
                  {' '}
                  Execute{' '}
                </Button>
              </Tooltip>
              <Tooltip
                label={
                  !graphType
                    ? 'Select a file/function/event first'
                    : 'Add Node (Ctrl+K)'
                }
                withArrow
              >
                <Button
                  variant='gradient'
                  gradient={{ from: 'teal', to: 'lime' }}
                  size='xs'
                  radius='md'
                  leftSection={<IconPlus size={16} />}
                  onClick={() => spotlight.open()}
                  disabled={!graphType}
                >
                  {' '}
                  Add Node{' '}
                </Button>
              </Tooltip>
            </Group>
          </Group>

          {/* Node List Area */}
          <Box style={{ flex: 1, overflowY: 'auto', padding: 'md' }}>
            {/* Pass current graph nodes directly */}
            <DndList
              items={currentGraphNodes}
              onReorder={handleReorder}
              onOpenNodeEditor={handleOpenNodeEditor}
              onDeleteNode={handleDeleteNode}
            />
            {currentGraphNodes.length === 0 && (
              <Text c='dimmed' ta='center' mt='xl'>
                Graph is empty. Click "Add Node" or press Ctrl+K.
              </Text>
            )}
          </Box>

          {/* Spotlight */}
          <Spotlight
            actions={spotlightActions}
            nothingFound='No matching nodes found...'
            highlightQuery
            limit={100}
            scrollable
            searchProps={{
              leftSection: <IconSearch size={20} stroke={1.5} />,
              placeholder: 'Search nodes to add...'
            }}
          />

          {/* Function Settings Modal - Conditionally render based on type and selectedKey */}
          {graphType === 'function' &&
            selectedGraphKey &&
            selectedGraphKey.startsWith(FUNC_PREFIX) && (
              <FunctionSettingsModal
                opened={isFuncSettingsModalOpen}
                onClose={() => setIsFuncSettingsModalOpen(false)}
                graphKey={selectedGraphKey}
              />
            )}

          {/* Event Settings Modal - Conditionally render based on type and selectedKey */}
          {graphType === 'event' &&
            selectedGraphKey &&
            selectedGraphKey.startsWith(EVENT_PREFIX) && (
              <EventSettingsModal
                opened={isEventSettingsModalOpen}
                onClose={() => setIsEventSettingsModalOpen(false)}
                graphKey={selectedGraphKey}
              />
            )}

          {/* Node Editor Modal - Render if editingNode is set */}
          {editingNode && (
            <NodeEditorModal
              opened={!!editingNode} // Ensures modal opens only when editingNode is not null
              onClose={handleCloseNodeEditor}
              onSave={handleSaveNode}
              node={editingNode} // Pass the whole editingNode object { node, index }
              currentGraphScope={currentGraphScope} // Pass the determined scope
            />
          )}
        </>
      ) : (
        // Display when no graph is selected
        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'dimmed',
            textAlign: 'center'
          }}
        >
          <Text>
            Select a file, function, or event handler from the sidebars.
          </Text>
        </Box>
      )}
    </Box>
  )
}
