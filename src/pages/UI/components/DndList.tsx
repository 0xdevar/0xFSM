import React from 'react'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from '@hello-pangea/dnd'
import { ActionIcon, Box, Group, Text, Tooltip } from '@mantine/core'
import { IconSettings, IconGripVertical, IconTrash } from '@tabler/icons-react'
import cx from 'clsx'
import classes from './style/DndList.module.css' 
import { DraggableNode } from '../../../components/types/NodeDefinition' 

interface DndListProps {
  items: DraggableNode[]
  onReorder: (result: { from: number; to: number }) => void
  onOpenNodeEditor: (node: DraggableNode, index: number) => void
  onDeleteNode: (index: number) => void
}

export function DndList ({
  items,
  onReorder,
  onOpenNodeEditor,
  onDeleteNode
}: DndListProps) {
  const handleOpenEditor = (node: DraggableNode, index: number) => {
    onOpenNodeEditor(node, index)
  }

  const handleDeleteClick = (index: number) => {
    onDeleteNode(index)
  }

  const handleDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === result.source.index
    ) {
      return
    }
    onReorder({ from: result.source.index, to: result.destination.index })
  }

  const draggables = items.map((node, index) => {
    console.log('test log: ' + JSON.stringify(node, null, 2))
    return (
      <Draggable
        key={node.runtimeId}
        index={index}
        draggableId={node.runtimeId}
        >
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cx(classes.item, {
              [classes.itemDragging]: snapshot.isDragging
            })}
            style={{ ...provided.draggableProps.style, padding: '8px' }}
            mb={4}
          >
            {/* Drag Handle */}
            <Tooltip
              label='Drag to Reorder'
              position='left'
              withArrow
              openDelay={500}
            >
              <div {...provided.dragHandleProps} className={classes.dragHandle}>
                <IconGripVertical
                  size='1.2rem'
                  stroke={1.5}
                  style={{ color: 'var(--mantine-color-dark-3)' }}
                />
              </div>
            </Tooltip>

            {/* Node Icon/Symbol Area <<< FIX: Check if leftSection is valid element >>> */}
            <Box mr='sm' className={classes.iconSection}>
              {React.isValidElement(node.leftSection) ? (
                node.leftSection
              ) : (
                <div className={classes.iconPlaceholder}>?</div>
              )}
            </Box>

            <div className={classes.nodeDetails}>
              <Text fw={500} size='sm' truncate>
                {node.label || 'Unnamed Node'}
              </Text>
              <Text size='xs' c='dimmed' truncate>
                {node.description || 'No description'}
              </Text>
            </div>

            {/* Action Icons */}
            <Group gap={5} wrap='nowrap' style={{ flexShrink: 0 }}>
              <Text size='xs' c='dimmed' truncate>
                {node.value ||
                  node.name ||
                  node.nativeNameOrHash ||
                  node.functionName ||
                  node.eventName ||
                  node.variableName ||
                  node.tableVariable ||
                  node.resultVariable ||
                  node.message ||
                  'No description'}
              </Text>
              <Tooltip label='Edit Node Properties' withArrow openDelay={500}>
                <ActionIcon
                  variant='subtle'
                  color='blue'
                  size='md'
                  radius='sm'
                  aria-label={`Edit node ${node.label || 'Unnamed Node'}`}
                  onClick={() => handleOpenEditor(node, index)}
                >
                  
                  <IconSettings size='1rem' stroke={1.5} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Delete Node' withArrow openDelay={500}>
                <ActionIcon
                  variant='subtle'
                  color='red'
                  size='md'
                  radius='sm'
                  aria-label={`Delete node ${node.label || 'Unnamed Node'}`}
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteClick(index)
                  }}
                >
                  
                  <IconTrash size='1rem' stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
        )}
      </Draggable>
    )
  })

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId='graph-nodes-list' direction='vertical'>
        {provided => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={classes.droppableArea}
            
            style={{padding: '5px' }}
          >
            {draggables}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}