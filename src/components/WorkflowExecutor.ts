import {
  NodeDefinition,
  DraggableNode,
  ArgumentSource
} from './types/NodeDefinition'
import { notifications } from '@mantine/notifications'
import { FUNC_PREFIX, GraphData } from '../pages/UI/GraphContext'

interface LoopStateBase {
  type: 'while' | 'forNumeric' | 'forGeneric'
  startNodeIndex: number
  endNodeIndex: number
}
interface WhileLoopState extends LoopStateBase {
  type: 'while'
}
interface ForLoopNumericState extends LoopStateBase {
  type: 'forNumeric'
  controlVar: string
  current: number
  end: number
  step: number
}
interface ForLoopGenericState extends LoopStateBase {
  type: 'forGeneric'
  iterType: 'pairs' | 'ipairs'
  iterator: IterableIterator<[any, any]> | null
  targetArray?: any[]
  currentIndex?: number
  keyVar: string
  valueVar: string
  isFinished: boolean
}
type LoopState = WhileLoopState | ForLoopNumericState | ForLoopGenericState

export interface ExecutionContext {
  variables: Record<string, any>
  results: any[]
  _internal: {
    returnValue?: any
    hasReturned: boolean
    graphLookup: (graphKey: string) => GraphData | undefined
    executorInstance: WorkflowExecutor
    loopStack: LoopState[]
    breakLoop: boolean
  }
  addResult: (result: any) => void
  setVariable: (name: string, value: any) => void
  getVariable: (name: string, defaultValue?: any) => any
  setReturnValue: (value: any) => void
  executeSubgraph: (graphKey: string, args: any[]) => any
  simulateTriggerServerEvent: (eventName: string, args: any[]) => void
  simulateTriggerClientEvent: (
    eventName: string,
    target: number | string | number[],
    args: any[]
  ) => void
}

// --- WorkflowExecutor Class ---
export class WorkflowExecutor {
  private graphLookup: (graphKey: string) => GraphData | undefined
  private readonly initialNodes: ReadonlyArray<DraggableNode>

  constructor (
    initialNodes: DraggableNode[],
    graphLookupFunc: (graphKey: string) => GraphData | undefined
  ) {
    if (!Array.isArray(initialNodes)) {
      throw new Error('WorkflowExecutor requires an array of nodes.')
    }
    this.initialNodes = Object.freeze(
      initialNodes.map((n, i) =>
        Object.freeze({ ...n, runtimeId: n.runtimeId || `exec-node-${i}` })
      )
    )
    this.graphLookup = graphLookupFunc
    console.log(
      `WorkflowExecutor initialized with ${this.initialNodes.length} nodes.`
    )
  }

  // execute method
  execute (initialArgs: any[] = [], functionParameters: string[] = []) {
    const scopeType = functionParameters.length > 0 ? 'Function' : 'File'
    console.log(`WorkflowExecutor: Starting execution (Scope: ${scopeType})`)
    // Context Initialization
    const context: ExecutionContext = {
      variables: {},
      results: [],
      _internal: {
        returnValue: undefined,
        hasReturned: false,
        graphLookup: this.graphLookup,
        executorInstance: this,
        loopStack: [],
        breakLoop: false
      },
      addResult: (result: any) => {
        if (result !== undefined) context.results.push(result)
      },
      setVariable: (name: string, value: any) => {
        if (name && typeof name === 'string') {
          context.variables[name] = value
        } else {
          console.warn(
            '[Context] Attempted to set variable with invalid name:',
            name
          )
        }
      },
      getVariable: (name: string, defaultValue: any = undefined) => {
        if (Object.prototype.hasOwnProperty.call(context.variables, name)) {
          return context.variables[name]
        }
        return defaultValue
      },
      setReturnValue: (value: any) => {
        if (!context._internal.hasReturned) {
          context._internal.returnValue = value
          context._internal.hasReturned = true
        } else {
          console.warn(
            '[Context] Return value already set. Ignoring subsequent ReturnNode.'
          )
        }
      },
      executeSubgraph: (graphKey: string, args: any[]): any => {
        console.log(
          `[Context] Executing Subgraph: ${graphKey} with args:`,
          args
        )
        try {
          return this.executeFunctionByKey(graphKey, args)
        } catch (subError: any) {
          console.error(
            `[Context] Error during subgraph execution (${graphKey}):`,
            subError
          )
          notifications.show({
            title: 'Subgraph Execution Error',
            message: `Error in ${graphKey}: ${subError.message}`,
            color: 'red'
          })
          throw subError
        }
      },
      simulateTriggerServerEvent: (eventName, args) => {
        const logMsg = `[SIMULATE] TriggerServerEvent: '${eventName}' Args: ${JSON.stringify(
          args
        )}`
        console.log(logMsg)
        context.addResult({
          action: 'simulateTriggerServerEvent',
          eventName,
          args,
          log: logMsg
        })
      },
      simulateTriggerClientEvent: (eventName, target, args) => {
        const logMsg = `[SIMULATE] TriggerClientEvent: '${eventName}' Target: ${JSON.stringify(
          target
        )} Args: ${JSON.stringify(args)}`
        console.log(logMsg)
        context.addResult({
          action: 'simulateTriggerClientEvent',
          eventName,
          target,
          args,
          log: logMsg
        })
      }
    }
    // Argument Handling
    if (scopeType === 'Function' && functionParameters.length > 0) {
      functionParameters.forEach((paramName, index) => {
        context.setVariable(
          paramName,
          index < initialArgs.length ? initialArgs[index] : null
        )
      })
    }
    // Main Execution Loop
    let executionOk = true
    let currentNodeIndex = 0
    const maxIterations = 10000
    let iterationCount = 0

    while (
      currentNodeIndex < this.initialNodes.length &&
      iterationCount < maxIterations
    ) {
      iterationCount++
      const node = this.initialNodes[currentNodeIndex]
      // Safety Checks
      if (!node) {
        const errorMsg = `Execution halted: Node at index ${currentNodeIndex} is undefined.`
        console.error(errorMsg)
        notifications.show({
          title: 'Execution Error',
          message: errorMsg,
          color: 'red'
        })
        executionOk = false
        break
      }
      if (context._internal.hasReturned && scopeType === 'Function') {
        console.log(
          `WorkflowExecutor: Function returned at node ${
            node.label || node.id
          } (Index ${currentNodeIndex}). Halting subgraph execution.`
        )
        break
      }
      if (context._internal.breakLoop) {
        if (context._internal.loopStack.length > 0) {
          const brokenLoop = context._internal.loopStack.pop()
          if (brokenLoop) {
            currentNodeIndex = brokenLoop.endNodeIndex + 1
            context._internal.breakLoop = false
            continue
          } else {
            const errorMsg = `Execution halted: Break node encountered, but loop stack state is inconsistent.`
            console.error(errorMsg)
            notifications.show({
              title: 'Execution Error',
              message: errorMsg,
              color: 'red'
            })
            executionOk = false
            break
          }
        } else {
          const errorMsg = `Execution halted: Break node encountered outside of a loop (Index ${currentNodeIndex}).`
          console.error(errorMsg)
          notifications.show({
            title: 'Execution Error',
            message: errorMsg,
            color: 'red'
          })
          executionOk = false
          break
        }
      }

      // Execute Node Logic
      let nextNodeIndex = currentNodeIndex + 1
      let jumpToIndex = -1

      try {
        let nodeResult: any = undefined
        if (typeof node.execute === 'function') {
          nodeResult = node.execute.call(node, context) // Call the node's execute method
          // Log result
          if (nodeResult !== undefined) {
            const resultLog = {
              nodeId: node.id,
              nodeLabel: node.label,
              runtimeId: node.runtimeId,
              output: nodeResult
            }
            context.addResult(resultLog)
          }
        }

        // Handle Control Flow (add cases for new nodes if they affect flow, most won't)
        switch (node.id) {
          case 'ifCondition':
            {
              if (!Boolean(nodeResult)) {
                const elseOrEndIndex = this.findMatchingElseOrEnd(
                  currentNodeIndex,
                  'elseCondition',
                  'endIf'
                )
                if (elseOrEndIndex === -1)
                  throw new Error(
                    `Missing matching 'Else' or 'End If' for 'If' at index ${currentNodeIndex}`
                  )
                nextNodeIndex = elseOrEndIndex + 1
              }
            }
            break
          case 'elseCondition':
            {
              const endIfIndex = this.findMatchingEnd(currentNodeIndex, 'endIf')
              if (endIfIndex === -1)
                throw new Error(
                  `Missing matching 'End If' for 'Else' at index ${currentNodeIndex}`
                )
              nextNodeIndex = endIfIndex + 1
            }
            break
          case 'whileCondition':
            {
              if (Boolean(nodeResult)) {
                const endNodeIndex = this.findMatchingEnd(
                  currentNodeIndex,
                  'endWhile'
                )
                if (endNodeIndex === -1)
                  throw new Error(
                    `Missing 'End While' for 'While' at index ${currentNodeIndex}`
                  )
                if (
                  !context._internal.loopStack.length ||
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex !== currentNodeIndex
                ) {
                  context._internal.loopStack.push({
                    type: 'while',
                    startNodeIndex: currentNodeIndex,
                    endNodeIndex
                  })
                }
                nextNodeIndex = currentNodeIndex + 1
              } else {
                const endNodeIndex = this.findMatchingEnd(
                  currentNodeIndex,
                  'endWhile'
                )
                if (endNodeIndex === -1)
                  throw new Error(
                    `Missing 'End While' for 'While' at index ${currentNodeIndex}`
                  )
                if (
                  context._internal.loopStack.length > 0 &&
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex === currentNodeIndex
                ) {
                  context._internal.loopStack.pop()
                }
                nextNodeIndex = endNodeIndex + 1
              }
            }
            break
          case 'forLoopNumeric':
            {
              const { shouldEnterLoop: shouldEnterNum, loopParams: numParams } =
                nodeResult as { shouldEnterLoop: boolean; loopParams?: any }
              const endForIndex = this.findMatchingEnd(
                currentNodeIndex,
                'endFor'
              )
              if (endForIndex === -1)
                throw new Error(
                  `Missing 'End For' for numeric loop at index ${currentNodeIndex}`
                )
              if (shouldEnterNum && numParams) {
                if (
                  !context._internal.loopStack.length ||
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex !== currentNodeIndex
                ) {
                  context._internal.loopStack.push({
                    type: 'forNumeric',
                    startNodeIndex: currentNodeIndex,
                    endNodeIndex: endForIndex,
                    ...numParams
                  })
                }
                nextNodeIndex = currentNodeIndex + 1
              } else {
                if (
                  context._internal.loopStack.length > 0 &&
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex === currentNodeIndex
                ) {
                  context._internal.loopStack.pop()
                }
                nextNodeIndex = endForIndex + 1
              }
            }
            break
          case 'forLoopGeneric':
            {
              const { shouldEnterLoop: shouldEnterGen, loopParams: genParams } =
                nodeResult as { shouldEnterLoop: boolean; loopParams?: any }
              const endForGenIndex = this.findMatchingEnd(
                currentNodeIndex,
                'endForGeneric'
              )
              if (endForGenIndex === -1)
                throw new Error(
                  `Missing 'End For (Generic)' for loop at index ${currentNodeIndex}`
                )
              if (shouldEnterGen && genParams) {
                if (
                  !context._internal.loopStack.length ||
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex !== currentNodeIndex
                ) {
                  context._internal.loopStack.push({
                    type: 'forGeneric',
                    startNodeIndex: currentNodeIndex,
                    endNodeIndex: endForGenIndex,
                    isFinished: false,
                    ...genParams
                  })
                }
                nextNodeIndex = currentNodeIndex + 1
              } else {
                if (
                  context._internal.loopStack.length > 0 &&
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ].startNodeIndex === currentNodeIndex
                ) {
                  context._internal.loopStack.pop()
                }
                nextNodeIndex = endForGenIndex + 1
              }
            }
            break
          case 'endWhile':
            {
              if (context._internal.loopStack.length > 0) {
                const loopState =
                  context._internal.loopStack[
                    context._internal.loopStack.length - 1
                  ]
                if (loopState.type === 'while') {
                  jumpToIndex = loopState.startNodeIndex
                } else {
                  throw new Error(
                    `Mismatched 'End While' at index ${currentNodeIndex}. Expected While state, found ${loopState.type}.`
                  )
                }
              } else {
                throw new Error(
                  `'End While' encountered at index ${currentNodeIndex} without an active loop.`
                )
              }
            }
            break
          case 'endFor':
            {
              if (context._internal.loopStack.length > 0) {
                const loopState = context._internal.loopStack[
                  context._internal.loopStack.length - 1
                ] as ForLoopNumericState // Assume correct type
                if (loopState.type === 'forNumeric') {
                  loopState.current += loopState.step
                  context.setVariable(loopState.controlVar, loopState.current)
                  const continueLoop =
                    loopState.step > 0
                      ? loopState.current <= loopState.end
                      : loopState.current >= loopState.end
                  if (continueLoop) {
                    jumpToIndex = loopState.startNodeIndex + 1
                  } else {
                    context._internal.loopStack.pop()
                    jumpToIndex = loopState.endNodeIndex + 1
                  }
                } else {
                  throw new Error(
                    `Mismatched 'End For' at index ${currentNodeIndex}. Expected ForNumeric state, found ${loopState.type}.`
                  )
                }
              } else {
                throw new Error(
                  `'End For' encountered at index ${currentNodeIndex} without an active loop.`
                )
              }
            }
            break
          case 'endForGeneric':
            {
              if (context._internal.loopStack.length > 0) {
                const loopState = context._internal.loopStack[
                  context._internal.loopStack.length - 1
                ] as ForLoopGenericState // Assume correct type
                if (loopState.type === 'forGeneric') {
                  let continueLoop = false
                  if (!loopState.isFinished && loopState.iterator) {
                    if (
                      loopState.iterType === 'ipairs' &&
                      loopState.targetArray
                    ) {
                      loopState.currentIndex!++
                      if (
                        loopState.currentIndex! < loopState.targetArray.length
                      ) {
                        const luaIndex = loopState.currentIndex! + 1
                        const nextValue =
                          loopState.targetArray[loopState.currentIndex!]
                        context.setVariable(loopState.keyVar, luaIndex)
                        context.setVariable(loopState.valueVar, nextValue)
                        continueLoop = true
                      } else {
                        loopState.isFinished = true
                      }
                    } else {
                      const next = loopState.iterator.next()
                      if (!next.done) {
                        const [nextKey, nextValue] = next.value
                        context.setVariable(loopState.keyVar, nextKey)
                        context.setVariable(loopState.valueVar, nextValue)
                        continueLoop = true
                      } else {
                        loopState.isFinished = true
                      }
                    }
                  }
                  if (continueLoop) {
                    jumpToIndex = loopState.startNodeIndex + 1
                  } else {
                    context._internal.loopStack.pop()
                    jumpToIndex = loopState.endNodeIndex + 1
                  }
                } else {
                  throw new Error(
                    `Mismatched 'End For (Generic)' at index ${currentNodeIndex}. Expected ForGeneric state, found ${loopState.type}.`
                  )
                }
              } else {
                throw new Error(
                  `'End For (Generic)' encountered at index ${currentNodeIndex} without an active loop.`
                )
              }
            }
            break
          case 'endIf': // Existing case, remains same
            nextNodeIndex = currentNodeIndex + 1
            break

          // --- NEW NODES (Most don't affect control flow) ---
          // stringSubstring, stringLength, stringFind, stringReplace, stringCase,
          // mathAdvanced, tableRemove, tableSort... these perform actions but
          // execution just proceeds to the next node by default.
          // Their logic is handled within their `execute` methods.

          default: // Other nodes proceed sequentially
            nextNodeIndex = currentNodeIndex + 1
            break
        }
      } catch (error: any) {
        // Error Handling
        console.error(
          `WorkflowExecutor: Error executing node ${
            node.label || node.id
          } (Index ${currentNodeIndex}):`,
          error
        )
        notifications.show({
          title: `Node Execution Error (${node.label || node.id})`,
          message: `Error: ${
            error.message || 'Unknown error'
          } at index ${currentNodeIndex}. Check console.`,
          color: 'red',
          autoClose: 7000
        })
        executionOk = false
        break
      }

      // Determine next index
      if (jumpToIndex !== -1) {
        currentNodeIndex = jumpToIndex
      } else {
        currentNodeIndex = nextNodeIndex
      }
    }

    // Post-Execution Checks
    if (iterationCount >= maxIterations) {
      const errorMsg = `Execution halted: Maximum iteration limit (${maxIterations}) reached. Potential infinite loop detected.`
      console.error(errorMsg)
      notifications.show({
        title: 'Execution Error',
        message: errorMsg,
        color: 'red',
        autoClose: false
      })
      executionOk = false
    }
    if (context._internal.loopStack.length > 0) {
      const openLoops = context._internal.loopStack
        .map(l => `${l.type} started at index ${l.startNodeIndex}`)
        .join(', ')
      const warningMsg = `Execution finished, but loop stack is not empty: [${openLoops}]. Missing End node(s)?`
      console.warn(warningMsg)
      notifications.show({
        title: 'Execution Warning',
        message: warningMsg,
        color: 'orange',
        autoClose: 10000
      })
    }

    console.log(`WorkflowExecutor: Execution finished. Success: ${executionOk}`)
    return {
      success: executionOk,
      results: context.results,
      variables: context.variables,
      returnValue: context._internal.returnValue
    }
  }

  // --- Helper Methods (findMatchingEnd, findMatchingElseOrEnd, executeFunctionByKey) remain the same ---
  private findMatchingEnd (
    startIndex: number,
    endNodeType: 'endWhile' | 'endFor' | 'endIf' | 'endForGeneric'
  ): number {
    let depth = 0
    const startNodeType = this.initialNodes[startIndex]?.id
    if (!startNodeType) return -1
    let expectedStartType: string | undefined
    switch (endNodeType) {
      case 'endWhile':
        expectedStartType = 'whileCondition'
        break
      case 'endFor':
        expectedStartType = 'forLoopNumeric'
        break
      case 'endForGeneric':
        expectedStartType = 'forLoopGeneric'
        break
      case 'endIf':
        expectedStartType = 'ifCondition'
        break
    }
    for (let k = startIndex + 1; k < this.initialNodes.length; k++) {
      const node = this.initialNodes[k]
      if (!node) continue
      if (node.id === expectedStartType) {
        depth++
      } else if (node.id === endNodeType) {
        if (depth === 0) return k
        depth--
      } else if (endNodeType === 'endIf' && node.id === 'elseCondition') {
        if (depth === 0) {
        }
      }
    }
    return -1
  }
  private findMatchingElseOrEnd (
    startIndex: number,
    elseNodeType: 'elseCondition',
    endNodeType: 'endIf'
  ): number {
    let depth = 0
    const startNodeType = this.initialNodes[startIndex]?.id
    if (startNodeType !== 'ifCondition') return -1
    for (let k = startIndex + 1; k < this.initialNodes.length; k++) {
      const node = this.initialNodes[k]
      if (!node) continue
      if (node.id === startNodeType) {
        depth++
      } else if (node.id === elseNodeType) {
        if (depth === 0) return k
      } else if (node.id === endNodeType) {
        if (depth === 0) return k
        depth--
      }
    }
    return -1
  }
  private executeFunctionByKey (graphKey: string, args: any[]): any {
    const graphData = this.graphLookup(graphKey)
    if (!graphData) throw new Error(`Function graph "${graphKey}" not found.`)
    if (!Array.isArray(graphData.nodes))
      throw new Error(`Invalid node data for function graph "${graphKey}".`)
    if (graphData.parameters === undefined)
      throw new Error(`Graph "${graphKey}" is not a function graph.`)
    const subExecutor = new WorkflowExecutor(graphData.nodes, this.graphLookup)
    const { success, returnValue } = subExecutor.execute(
      args,
      graphData.parameters
    )
    if (!success) {
      console.error(`Subgraph execution failed for "${graphKey}".`)
      return null
    }
    return returnValue
  }
}
