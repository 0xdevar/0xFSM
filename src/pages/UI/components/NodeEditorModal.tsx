
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  ColorInput,
  Switch,
  NumberInput,
  Select,
  Text,
  Box,
  Tooltip,
  SegmentedControl,
  ScrollArea,
  ActionIcon,
  Divider,
  Paper,
  Alert,
  Grid,
  ComboboxItem
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconTrash,
  IconPlus,
  IconVariable,
  IconAbc,
  IconHash,
  IconTerminal2,
  IconTerminal,
  IconSettings,
  IconSubtask,
  IconArrowBackUp,
  IconGitBranch,
  IconRepeat,
  IconServerBolt,
  IconDeviceLaptop,
  IconVariableOff,
  IconAlertCircle,
  IconQuote,
  IconCut,
  IconQuestionMark,
  IconLetterCase,
  IconNumber,
  IconPalette,
  IconMath,
  IconMessageChatbot,
  IconMessageCircle,
  IconDatabaseImport,
  IconClock,
  IconWorld,
  IconInfoCircle,
  IconCalculator,
  IconLock
} from '@tabler/icons-react'
import {
  ArgumentSource,
  DraggableNode
} from '../../../components/types/NodeDefinition'
import {
  useGraphContext,
  FUNC_PREFIX,
  FunctionScope,
  EventScope
} from '../GraphContext'
import {
  isValidLuaIdentifier,
  isValidNativeHash,
  isValidNativeName
} from '../../../components/nodes/utils/validationUtils'
import { parseLiteral } from '../../../components/nodes/utils/parsingUtils'

interface NodeEditorModalProps {
  opened: boolean
  onClose: () => void
  onSave: (updatedNode: DraggableNode & { index: number }) => void
  node: { node: DraggableNode; index: number } | null
  currentGraphScope?: FunctionScope | EventScope
}

// Define the specific data types for a variable node
type VariableDataType = 'string' | 'number' | 'boolean' | 'variable' | 'nil';


const ValidatedTextInput = ({
  field,
  nodeData,
  onChange,
  errors,
  label,
  required = false,
  icon,
  ...props
}: any) => (
  <TextInput
    label={label}
    required={required}
    value={nodeData[field] ?? ''}
    onChange={e => onChange(field, e.currentTarget.value)}
    error={errors[field]}
    leftSection={icon}
    {...props}
  />
)
const ValidatedNumberInput = ({
  field,
  nodeData,
  onChange,
  errors,
  label,
  required = false,
  icon,
  ...props
}: any) => (
  <NumberInput
    label={label}
    required={required}
    value={nodeData[field] ?? ''}
    onChange={value => onChange(field, value)}
    error={errors[field]}
    leftSection={icon}
    allowDecimal={props.allowDecimal ?? false}
    step={props.step ?? 1}
    precision={props.precision}
    {...props}
  />
)
const ValidatedTextarea = ({
  field,
  nodeData,
  onChange,
  errors,
  label,
  required = false,
  icon,
  ...props
}: any) => (
  <Textarea
    label={label}
    required={required}
    value={nodeData[field] ?? ''}
    onChange={e => onChange(field, e.currentTarget.value)}
    error={errors[field]}
    leftSection={icon}
    {...props}
  />
)

// VarLiteralPair (remains the same)...
const VarLiteralPair = ({
  nodeData,
  onChange,
  onSwitchChange,
  errors,
  typeField,
  sourceField,
  varFieldName = `${sourceField}Variable`,
  literalFieldName = sourceField,
  switchLabel,
  varInputLabel = 'Variable Name',
  literalInputLabel = 'Literal Value',
  literalInputType = 'text',
  required = true,
  literalProps = {}
}: any) => {
  /* ... no changes ... */
  const isVariable = nodeData[typeField] ?? false
  return (
    <Stack gap='xs'>
      <Switch
        label={switchLabel}
        checked={isVariable}
        onChange={e => onSwitchChange(typeField, e.currentTarget.checked)}
      />
      {isVariable ? (
        <ValidatedTextInput
          field={varFieldName}
          nodeData={nodeData}
          onChange={onChange}
          errors={errors}
          label={varInputLabel}
          placeholder='variableName'
          required={required}
          icon={<IconVariable size='1rem' stroke={1.5} />}
        />
      ) : literalInputType === 'number' ? (
        <ValidatedNumberInput
          field={literalFieldName}
          nodeData={nodeData}
          onChange={onChange}
          errors={errors}
          label={literalInputLabel}
          placeholder='Enter number'
          required={required}
          icon={<IconHash size='1rem' stroke={1.5} />}
          {...literalProps}
        />
      ) : literalInputType === 'textarea' ? (
        <ValidatedTextarea
          field={literalFieldName}
          nodeData={nodeData}
          onChange={onChange}
          errors={errors}
          label={literalInputLabel}
          placeholder='Enter value'
          required={required}
          autosize
          minRows={1}
          icon={<IconAbc size='1rem' stroke={1.5} />}
          {...literalProps}
        />
      ) : (
        <ValidatedTextInput
          field={literalFieldName}
          nodeData={nodeData}
          onChange={onChange}
          errors={errors}
          label={literalInputLabel}
          placeholder='Enter value'
          required={required}
          icon={<IconAbc size='1rem' stroke={1.5} />}
          {...literalProps}
        />
      )}
    </Stack>
  )
}

export default function NodeEditorModal ({
  opened,
  onClose,
  onSave,
  node: nodeInfo,
  currentGraphScope
}: NodeEditorModalProps) {
  const [nodeData, setNodeData] = useState<
    (DraggableNode & { index: number }) | null
  >(null)
  const { getGraph, getFunctionNames } = useGraphContext()
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  // Memoized calculations (availableFunctionsFiltered, targetFunctionParams) remain the same...
  const availableFunctionsFiltered = useMemo(() => {
    /* ... no changes ... */ const allFuncNames = getFunctionNames()
    let targetScope: FunctionScope | EventScope | 'any' = 'any'
    if (nodeData?.id === 'registerCommand' && currentGraphScope) {
      targetScope = currentGraphScope
    }
    return allFuncNames
      .filter(funcName => {
        const funcGraph = getGraph(`${FUNC_PREFIX}${funcName}`)
        if (!funcGraph?.scope) return false
        if (targetScope === 'client') {
          return funcGraph.scope === 'client' || funcGraph.scope === 'shared'
        }
        if (targetScope === 'server') {
          return funcGraph.scope === 'server' || funcGraph.scope === 'shared'
        }
        if (nodeData?.id !== 'registerCommand' && currentGraphScope) {
          if (currentGraphScope === 'client')
            return funcGraph.scope === 'client' || funcGraph.scope === 'shared'
          if (currentGraphScope === 'server')
            return funcGraph.scope === 'server' || funcGraph.scope === 'shared'
          if (currentGraphScope === 'shared')
            return funcGraph.scope === 'shared'
        } else if (!currentGraphScope) {
          return true
        }
        return false
      })
      .map(name => ({ value: name, label: name }))
  }, [getFunctionNames, getGraph, currentGraphScope, nodeData?.id])
  const targetFunctionParams = useMemo(() => {
    /* ... no changes ... */ if (
      nodeData?.id !== 'callFunction' ||
      !nodeData.functionName
    )
      return []
    const funcGraph = getGraph(`${FUNC_PREFIX}${nodeData.functionName}`)
    return funcGraph?.parameters || []
  }, [nodeData?.id, nodeData?.functionName, getGraph])

  // Initialize/Reset state
  useEffect(() => {
    if (nodeInfo) {
      const initialData = JSON.parse(
        JSON.stringify({ ...nodeInfo.node, index: nodeInfo.index })
      )
      // Ensure argumentSources is always an array (remains same)
      initialData.argumentSources = Array.isArray(initialData.argumentSources)
        ? initialData.argumentSources.map((arg: any) => ({
            type:
              arg.type === 'variable' || arg.type === 'literal'
                ? arg.type
                : 'literal',
            value: arg.value ?? ''
          }))
        : []

      // Default values specific to node types
      switch (initialData.id) {
        // --- EXISTING CASES ---
        // ... (all existing cases for print, math, variable, etc. remain unchanged) ...
        case 'registerCommand':
           initialData.commandName =
            initialData.commandName || 'mycommand'
          initialData.functionName = initialData.functionName || ''
          initialData.restricted = initialData.restricted ?? false
          break
        case 'callFunction':
           initialData.functionName = initialData.functionName || ''
          initialData.resultVariable =
            initialData.resultVariable || 'functionResult'
          const targetParams =
            getGraph(`${FUNC_PREFIX}${initialData.functionName}`)?.parameters ||
            []
          if (initialData.argumentSources.length !== targetParams.length) {
            const newArgs: ArgumentSource[] = targetParams.map(
              (_, idx) =>
                initialData.argumentSources[idx] || {
                  type: 'literal',
                  value: ''
                }
            )
            initialData.argumentSources = newArgs
          }
          break
        case 'return':
           initialData.useVariableForResult =
            initialData.useVariableForResult ?? true
          initialData.returnVariable = initialData.returnVariable || ''
          initialData.returnValue = initialData.returnValue ?? ''
          break
        case 'ifCondition':
        case 'whileCondition':
           initialData.conditionLhsType =
            initialData.conditionLhsType ?? 'variable'
          initialData.conditionLhsValue = initialData.conditionLhsValue ?? ''
          initialData.conditionOperator = initialData.conditionOperator ?? '=='
          initialData.conditionRhsType =
            initialData.conditionRhsType ?? 'literal'
          initialData.conditionRhsValue =
            initialData.conditionRhsValue ?? 'true'
          break
        case 'forLoopNumeric':
           initialData.controlVariable =
            initialData.controlVariable || 'i'
          initialData.startValueType = initialData.startValueType || 'literal'
          initialData.startValue = initialData.startValue ?? '1'
          initialData.endValueType = initialData.endValueType || 'literal'
          initialData.endValue = initialData.endValue ?? '10'
          initialData.stepValueType = initialData.stepValueType || 'literal'
          initialData.stepValue = initialData.stepValue ?? '1'
          break
        case 'print':
           initialData.useVariableForMessage =
            initialData.useVariableForMessage ?? false
          initialData.messageVariable = initialData.messageVariable || ''
          initialData.message = initialData.message ?? 'Hello World'
          initialData.printToConsole = initialData.printToConsole ?? true
          initialData.color = initialData.color || '#ffffff'
          break
        case 'math':
           initialData.operation = initialData.operation || 'add'
          initialData.useVariableForValue1 =
            initialData.useVariableForValue1 ?? false
          initialData.value1Variable = initialData.value1Variable || ''
          initialData.value1 = initialData.value1 ?? 0
          initialData.useVariableForValue2 =
            initialData.useVariableForValue2 ?? false
          initialData.value2Variable = initialData.value2Variable || ''
          initialData.value2 = initialData.value2 ?? 0
          initialData.resultVariable =
            initialData.resultVariable || 'mathResult'
          break
        case 'variable':
          initialData.name = initialData.name || 'myVar'
          initialData.varType = initialData.varType || 'local'
          initialData.dataType = (initialData.dataType || 'string') as VariableDataType;
          initialData.value = parseLiteral(
          initialData.value,
          initialData.dataType
          )
          break
        case 'readVariable':
           initialData.variableName = initialData.variableName || ''
          initialData.defaultValue = initialData.defaultValue ?? ''
          break
        case 'concatStrings':
           initialData.useVariableForString1 =
            initialData.useVariableForString1 ?? false
          initialData.string1Variable = initialData.string1Variable || ''
          initialData.string1 = initialData.string1 ?? ''
          initialData.useVariableForString2 =
            initialData.useVariableForString2 ?? false
          initialData.string2Variable = initialData.string2Variable || ''
          initialData.string2 = initialData.string2 ?? ''
          initialData.resultVariable =
            initialData.resultVariable || 'concatResult'
          break
        case 'wait':
           initialData.useVariableForDuration =
            initialData.useVariableForDuration ?? false
          initialData.durationVariable = initialData.durationVariable || ''
          initialData.duration = initialData.duration ?? 1000
          break
        case 'triggerServerEvent':
           initialData.eventName = initialData.eventName || ''
          break
        case 'triggerClientEvent':
           initialData.eventName = initialData.eventName || ''
          initialData.targetPlayer = initialData.targetPlayer ?? '-1'
          initialData.useVariableForTarget =
            initialData.useVariableForTarget ?? false
          break
        case 'forLoopGeneric':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.iterationType = initialData.iterationType || 'pairs'
          initialData.keyVariable =
            initialData.keyVariable ||
            (initialData.iterationType === 'ipairs' ? '_' : 'key')
          initialData.valueVariable = initialData.valueVariable || 'value'
          break
        case 'createTable':
           initialData.variableName =
            initialData.variableName || 'newTable'
          break
        case 'setTableValue':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.keyType = initialData.keyType || 'literal'
          initialData.keyValue = initialData.keyValue ?? 'myKey'
          initialData.valueType = initialData.valueType || 'literal'
          initialData.valueSource = initialData.valueSource ?? ''
          break
        case 'getTableValue':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.keyType = initialData.keyType || 'literal'
          initialData.keyValue = initialData.keyValue ?? 'myKey'
          initialData.resultVariable =
            initialData.resultVariable || 'tableValue'
          initialData.defaultValue = initialData.defaultValue ?? ''
          break
        case 'callNative':
           initialData.nativeNameOrHash =
            initialData.nativeNameOrHash || ''
          initialData.resultVariable = initialData.resultVariable || ''
          break
        case 'vector3':
           initialData.useVariableForX =
            initialData.useVariableForX ?? false
          initialData.xSource = initialData.xSource ?? '0.0'
          initialData.useVariableForY = initialData.useVariableForY ?? false
          initialData.ySource = initialData.ySource ?? '0.0'
          initialData.useVariableForZ = initialData.useVariableForZ ?? false
          initialData.zSource = initialData.zSource ?? '0.0'
          initialData.resultVariable = initialData.resultVariable || 'myVector'
          break
        case 'json':
           initialData.jsonOperation =
            initialData.jsonOperation || 'encode'
          initialData.inputVariable = initialData.inputVariable || 'inputData'
          initialData.resultVariable = initialData.resultVariable || 'jsonData'
          break
        case 'insertIntoTable':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.valueType = initialData.valueType || 'literal'
          initialData.valueSource = initialData.valueSource ?? ''
          break
        case 'getTableLength':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.resultVariable =
            initialData.resultVariable || 'tableLength'
          break
        case 'stringFormat':
           initialData.formatString = initialData.formatString || ''
          initialData.resultVariable =
            initialData.resultVariable || 'formattedString'
          break
        case 'stringSplit':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? false
          initialData.inputStringVariable =
            initialData.inputStringVariable || ''
          initialData.inputString = initialData.inputString ?? ''
          initialData.separator = initialData.separator ?? ','
          initialData.limit = initialData.limit ?? ''
          initialData.resultVariable =
            initialData.resultVariable || 'splitResult'
          break
        case 'typeCheck':
        case 'toString':
        case 'toNumber':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? true
          initialData.inputVariable = initialData.inputVariable || ''
          initialData.inputValue = initialData.inputValue ?? ''
          initialData.resultVariable =
            initialData.resultVariable ||
            (initialData.id === 'typeCheck'
              ? 'valueType'
              : initialData.id === 'toString'
              ? 'stringValue'
              : 'numberValue')
          if (initialData.id === 'toNumber') {
            initialData.base = initialData.base ?? ''
          }
          break
        case 'stringSubstring':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? false
          initialData.inputStringVariable =
            initialData.inputStringVariable || ''
          initialData.inputString = initialData.inputString ?? ''
          initialData.startIndexType = initialData.startIndexType || 'literal'
          initialData.startIndex = initialData.startIndex ?? '1'
          initialData.endIndexType = initialData.endIndexType || 'literal'
          initialData.endIndex = initialData.endIndex ?? ''
          initialData.resultVariable =
            initialData.resultVariable || 'substringResult'
          break
        case 'stringLength':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? false
          initialData.inputStringVariable =
            initialData.inputStringVariable || ''
          initialData.inputString = initialData.inputString ?? ''
          initialData.resultVariable =
            initialData.resultVariable || 'stringLengthResult'
          break
        case 'stringFind':
           initialData.useVariableForHaystack =
            initialData.useVariableForHaystack ?? false
          initialData.haystackVariable = initialData.haystackVariable || ''
          initialData.haystackString = initialData.haystackString ?? ''
          initialData.useVariableForNeedle =
            initialData.useVariableForNeedle ?? false
          initialData.needleVariable = initialData.needleVariable || ''
          initialData.needleString = initialData.needleString ?? ''
          initialData.startIndexType = initialData.startIndexType || 'literal'
          initialData.startIndex = initialData.startIndex ?? '1'
          initialData.plainFind = initialData.plainFind ?? false
          initialData.resultStartIndexVar =
            initialData.resultStartIndexVar || ''
          initialData.resultEndIndexVar = initialData.resultEndIndexVar || ''
          break
        case 'stringReplace':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? false
          initialData.inputStringVariable =
            initialData.inputStringVariable || ''
          initialData.inputString = initialData.inputString ?? ''
          initialData.useVariableForPattern =
            initialData.useVariableForPattern ?? false
          initialData.patternVariable = initialData.patternVariable || ''
          initialData.patternString = initialData.patternString ?? ''
          initialData.useVariableForReplacement =
            initialData.useVariableForReplacement ?? false
          initialData.replacementVariable =
            initialData.replacementVariable || ''
          initialData.replacementString = initialData.replacementString ?? ''
          initialData.limitType = initialData.limitType || 'literal'
          initialData.limit = initialData.limit ?? ''
          initialData.resultStringVariable =
            initialData.resultStringVariable || 'replacedString'
          initialData.resultCountVariable =
            initialData.resultCountVariable || ''
          break
        case 'stringCase':
           initialData.useVariableForInput =
            initialData.useVariableForInput ?? false
          initialData.inputStringVariable =
            initialData.inputStringVariable || ''
          initialData.inputString = initialData.inputString ?? ''
          initialData.caseType = initialData.caseType || 'lower'
          initialData.resultVariable =
            initialData.resultVariable || 'casedString'
          break
        case 'mathAdvanced':
           initialData.mathOperationType =
            initialData.mathOperationType || 'floor'
          initialData.value1Type = initialData.value1Type || 'literal'
          initialData.value1 = initialData.value1 ?? '0'
          initialData.value1Variable = initialData.value1Variable || ''
          initialData.value2Type = initialData.value2Type || 'literal'
          initialData.value2 = initialData.value2 ?? '0'
          initialData.value2Variable = initialData.value2Variable || ''
          initialData.resultVariable =
            initialData.resultVariable || 'mathAdvResult'
          break
        case 'tableRemove':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.indexType = initialData.indexType || 'literal'
          initialData.index = initialData.index ?? ''
          initialData.resultRemovedValueVar =
            initialData.resultRemovedValueVar || ''
          break
        case 'tableSort':
           initialData.tableVariable =
            initialData.tableVariable || 'myTable'
          initialData.sortFunctionType = initialData.sortFunctionType || 'none'
          initialData.sortFunctionVariable =
            initialData.sortFunctionVariable || ''
          break

        // >>>>> Ludb Node Defaults START <<<<<
        case 'ludbSaveGlobal':
        case 'ludbSaveLocal':
          initialData.keyType = initialData.keyType || 'literal'
          initialData.keyValue =
            initialData.keyValue ||
            (initialData.id === 'ludbSaveGlobal'
              ? 'global/myKey'
              : 'local/myKey')
          initialData.valueType = initialData.valueType || 'literal'
          initialData.valueSource = initialData.valueSource ?? ''
          break
        case 'ludbRetrieveGlobal':
        case 'ludbRetrieveLocal':
          initialData.keyType = initialData.keyType || 'literal'
          initialData.keyValue =
            initialData.keyValue ||
            (initialData.id === 'ludbRetrieveGlobal'
              ? 'global/myKey'
              : 'local/myKey')
          initialData.resultVariable =
            initialData.resultVariable ||
            (initialData.id === 'ludbRetrieveGlobal'
              ? 'retrievedGlobalValue'
              : 'retrievedLocalValue')
          initialData.defaultValue = initialData.defaultValue ?? 'nil'
          break
        case 'ludbDeleteGlobal':
        case 'ludbDeleteLocal':
          initialData.keyType = initialData.keyType || 'literal'
          initialData.keyValue =
            initialData.keyValue ||
            (initialData.id === 'ludbDeleteGlobal'
              ? 'global/myKeyToDelete'
              : 'local/myKeyToDelete')
          break
        // >>>>> Ludb Node Defaults END <<<<<
      }
      setNodeData(initialData)
      setValidationErrors({}) // Reset errors on load
    } else {
      setNodeData(null)
      setValidationErrors({})
    }
  }, [nodeInfo, getGraph])

  // Validation Effect
  useEffect(() => {
    if (!nodeData) return
    const errors: Record<string, string> = {}
    // Validation helper functions (validateVar, checkRequired, validateNumberString) remain the same...
    const validateVar = (
      fieldName: string,
      varName: string | undefined,
      required = true
    ) => {
      if (required && (!varName || !String(varName).trim())) {
        errors[fieldName] = 'Required.'
      } else if (varName && !isValidLuaIdentifier(varName)) {
        errors[fieldName] = 'Invalid name format.'
      }
    }
    const checkRequired = (fieldName: string, value: any) => {
      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ''
      ) {
        errors[fieldName] = 'Required.'
      }
    }
    const validateNumberString = (
      fieldName: string,
      value: string | undefined | number,
      allowEmpty = false,
      allowNegative = true,
      isInteger = true
    ) => {
      const strValue = String(value ?? '').trim()
      if (!allowEmpty && strValue === '') {
        errors[fieldName] = 'Required.'
        return
      }
      if (strValue !== '') {
        const pattern = isInteger ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/
        if (!pattern.test(strValue)) {
          errors[fieldName] = isInteger
            ? 'Must be a whole number.'
            : 'Must be a valid number.'
          return
        }
        if (!allowNegative && parseFloat(strValue) < 0) {
          errors[fieldName] = 'Cannot be negative.'
        }
      }
    }

    switch (nodeData.id) {
      // --- EXISTING CASES ---
      // ... (all existing validation cases for print, math, variable, etc. remain unchanged) ...
      case 'registerCommand':
        checkRequired('commandName', nodeData.commandName)
        if (nodeData.commandName && /\s/.test(nodeData.commandName)) {
          errors['commandName'] = 'Command name cannot contain spaces.'
        }
        checkRequired('functionName', nodeData.functionName)
        break
      case 'variable':
        validateVar('name', nodeData.name)
        break
      case 'readVariable':
        validateVar('variableName', nodeData.variableName)
        break
      case 'math':
        if (nodeData.useVariableForValue1)
          validateVar('value1Variable', nodeData.value1Variable)
        else validateNumberString('value1', nodeData.value1, false, true, false)
        if (nodeData.useVariableForValue2)
          validateVar('value2Variable', nodeData.value2Variable)
        else validateNumberString('value2', nodeData.value2, false, true, false)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'concatStrings':
        if (nodeData.useVariableForString1)
          validateVar('string1Variable', nodeData.string1Variable)
        if (nodeData.useVariableForString2)
          validateVar('string2Variable', nodeData.string2Variable)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'print':
        if (nodeData.useVariableForMessage)
          validateVar('messageVariable', nodeData.messageVariable)
        break
      case 'wait':
        if (nodeData.useVariableForDuration)
          validateVar('durationVariable', nodeData.durationVariable)
        else
          validateNumberString(
            'duration',
            nodeData.duration,
            false,
            false,
            true
          )
        break
      case 'return':
        if (nodeData.useVariableForResult)
          validateVar('returnVariable', nodeData.returnVariable)
        break
      case 'callFunction':
        checkRequired('functionName', nodeData.functionName)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'triggerServerEvent':
        checkRequired('eventName', nodeData.eventName)
        break
      case 'triggerClientEvent':
        checkRequired('eventName', nodeData.eventName)
        if (nodeData.useVariableForTarget)
          validateVar('targetPlayer', nodeData.targetPlayer)
        else checkRequired('targetPlayer', nodeData.targetPlayer)
        break
      case 'forLoopNumeric':
        validateVar('controlVariable', nodeData.controlVariable)
        if (nodeData.startValueType === 'variable')
          validateVar('startValue', nodeData.startValue)
        else
          validateNumberString(
            'startValue',
            nodeData.startValue,
            false,
            true,
            false
          )
        if (nodeData.endValueType === 'variable')
          validateVar('endValue', nodeData.endValue)
        else
          validateNumberString(
            'endValue',
            nodeData.endValue,
            false,
            true,
            false
          )
        if (nodeData.stepValueType === 'variable')
          validateVar('stepValue', nodeData.stepValue)
        else {
          validateNumberString(
            'stepValue',
            nodeData.stepValue,
            false,
            true,
            false
          )
          if (parseFloat(String(nodeData.stepValue || '0')) === 0)
            errors['stepValue'] = 'Step cannot be zero.'
        }
        break
      case 'forLoopGeneric':
        validateVar('tableVariable', nodeData.tableVariable)
        validateVar('keyVariable', nodeData.keyVariable)
        validateVar('valueVariable', nodeData.valueVariable)
        break
      case 'createTable':
        validateVar('variableName', nodeData.variableName)
        break
      case 'setTableValue':
        validateVar('tableVariable', nodeData.tableVariable)
        if (nodeData.keyType === 'variable')
          validateVar('keyValue', nodeData.keyValue)
        else if (nodeData.keyType === 'number_literal')
          validateNumberString('keyValue', nodeData.keyValue, false, true, true)
        else checkRequired('keyValue', nodeData.keyValue)
        if (nodeData.valueType === 'variable')
          validateVar('valueSource', nodeData.valueSource)
        break
      case 'getTableValue':
        validateVar('tableVariable', nodeData.tableVariable)
        if (nodeData.keyType === 'variable')
          validateVar('keyValue', nodeData.keyValue)
        else if (nodeData.keyType === 'number_literal')
          validateNumberString('keyValue', nodeData.keyValue, false, true, true)
        else checkRequired('keyValue', nodeData.keyValue)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'callNative':
        checkRequired('nativeNameOrHash', nodeData.nativeNameOrHash)
        if (
          nodeData.nativeNameOrHash &&
          !isValidNativeHash(nodeData.nativeNameOrHash) &&
          !isValidNativeName(nodeData.nativeNameOrHash)
        ) {
          errors['nativeNameOrHash'] = 'Invalid native name or hash format.'
        }
        validateVar('resultVariable', nodeData.resultVariable, false)
        break
      case 'vector3':
        if (nodeData.useVariableForX) validateVar('xSource', nodeData.xSource)
        else
          validateNumberString('xSource', nodeData.xSource, false, true, false)
        if (nodeData.useVariableForY) validateVar('ySource', nodeData.ySource)
        else
          validateNumberString('ySource', nodeData.ySource, false, true, false)
        if (nodeData.useVariableForZ) validateVar('zSource', nodeData.zSource)
        else
          validateNumberString('zSource', nodeData.zSource, false, true, false)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'json':
        validateVar('inputVariable', nodeData.inputVariable)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'insertIntoTable':
        validateVar('tableVariable', nodeData.tableVariable)
        if (nodeData.valueType === 'variable')
          validateVar('valueSource', nodeData.valueSource)
        break
      case 'getTableLength':
        validateVar('tableVariable', nodeData.tableVariable)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'stringFormat':
        checkRequired('formatString', nodeData.formatString)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'stringSplit':
        if (nodeData.useVariableForInput)
          validateVar('inputStringVariable', nodeData.inputStringVariable)
        validateNumberString('limit', nodeData.limit, true, false, true)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'typeCheck':
      case 'toString':
      case 'toNumber':
        if (nodeData.useVariableForInput)
          validateVar('inputVariable', nodeData.inputVariable)
        validateVar('resultVariable', nodeData.resultVariable)
        if (nodeData.id === 'toNumber') {
          validateNumberString('base', nodeData.base, true, false, true)
          if (nodeData.base) {
            const baseNum = parseInt(String(nodeData.base).trim(), 10)
            if (isNaN(baseNum) || baseNum < 2 || baseNum > 36) {
              errors['base'] = 'Base must be between 2 and 36.'
            }
          }
        }
        break
      case 'stringSubstring':
        if (nodeData.useVariableForInput)
          validateVar('inputStringVariable', nodeData.inputStringVariable)
        if (nodeData.startIndexType === 'variable')
          validateVar('startIndex', nodeData.startIndex)
        else
          validateNumberString(
            'startIndex',
            nodeData.startIndex,
            false,
            false,
            true
          )
        if (nodeData.endIndexType === 'variable')
          validateVar('endIndex', nodeData.endIndex, false)
        else
          validateNumberString('endIndex', nodeData.endIndex, true, true, true)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'stringLength':
        if (nodeData.useVariableForInput)
          validateVar('inputStringVariable', nodeData.inputStringVariable)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'stringFind':
        if (nodeData.useVariableForHaystack)
          validateVar('haystackVariable', nodeData.haystackVariable)
        if (nodeData.useVariableForNeedle)
          validateVar('needleVariable', nodeData.needleVariable)
        else checkRequired('needleString', nodeData.needleString)
        if (nodeData.startIndexType === 'variable')
          validateVar('startIndex', nodeData.startIndex)
        else
          validateNumberString(
            'startIndex',
            nodeData.startIndex,
            false,
            false,
            true
          )
        validateVar('resultStartIndexVar', nodeData.resultStartIndexVar, false)
        validateVar('resultEndIndexVar', nodeData.resultEndIndexVar, false)
        break
      case 'stringReplace':
        if (nodeData.useVariableForInput)
          validateVar('inputStringVariable', nodeData.inputStringVariable)
        if (nodeData.useVariableForPattern)
          validateVar('patternVariable', nodeData.patternVariable)
        else checkRequired('patternString', nodeData.patternString)
        if (nodeData.useVariableForReplacement)
          validateVar('replacementVariable', nodeData.replacementVariable)
        if (nodeData.limitType === 'variable')
          validateVar('limit', nodeData.limit, false)
        else validateNumberString('limit', nodeData.limit, true, false, true)
        validateVar('resultStringVariable', nodeData.resultStringVariable)
        validateVar('resultCountVariable', nodeData.resultCountVariable, false)
        break
      case 'stringCase':
        if (nodeData.useVariableForInput)
          validateVar('inputStringVariable', nodeData.inputStringVariable)
        validateVar('resultVariable', nodeData.resultVariable)
        break
      case 'mathAdvanced':
        {
          const opType = nodeData.mathOperationType
          const needsTwoInputs = ['pow', 'min', 'max', 'random'].includes(
            opType || ''
          )
          const needsOneInput = !needsTwoInputs
          const isRandomNoArgs =
            opType === 'random' &&
            nodeData.value1Type === 'literal' &&
            nodeData.value1 === '' &&
            nodeData.value2Type === 'literal' &&
            nodeData.value2 === ''
          if (!isRandomNoArgs) {
            if (needsOneInput || needsTwoInputs) {
              if (nodeData.value1Type === 'variable')
                validateVar('value1Variable', nodeData.value1Variable)
              else
                validateNumberString(
                  'value1',
                  nodeData.value1,
                  false,
                  true,
                  false
                )
            }
            if (needsTwoInputs) {
              if (nodeData.value2Type === 'variable')
                validateVar('value2Variable', nodeData.value2Variable)
              else
                validateNumberString(
                  'value2',
                  nodeData.value2,
                  false,
                  true,
                  false
                )
            }
            if (opType === 'random' && !isRandomNoArgs) {
              const val1 = parseFloat(String(nodeData.value1 || '0'))
              const val2 = parseFloat(String(nodeData.value2 || '1'))
              if (val1 > val2) {
                errors['value1'] = 'Min <= Max'
                errors['value2'] = 'Max >= Min'
              }
              if (
                !(
                  nodeData.value1Type === 'literal' &&
                  nodeData.value2Type === 'literal' &&
                  Number.isInteger(val1) &&
                  Number.isInteger(val2)
                )
              ) {
                errors['value1'] = errors['value1'] || 'Int required'
                errors['value2'] = errors['value2'] || 'Int required'
              }
            }
          }
          validateVar('resultVariable', nodeData.resultVariable)
        }
        break
      case 'tableRemove':
        validateVar('tableVariable', nodeData.tableVariable)
        if (nodeData.indexType === 'variable')
          validateVar('index', nodeData.index, false)
        else validateNumberString('index', nodeData.index, true, false, true)
        validateVar(
          'resultRemovedValueVar',
          nodeData.resultRemovedValueVar,
          false
        )
        break
      case 'tableSort':
        validateVar('tableVariable', nodeData.tableVariable)
        if (nodeData.sortFunctionType === 'customVariable') {
          validateVar('sortFunctionVariable', nodeData.sortFunctionVariable)
        }
        break

      // >>>>> Ludb Node Validations START <<<<<
      case 'ludbSaveGlobal':
      case 'ludbSaveLocal':
        // Validate Key
        if (nodeData.keyType === 'variable') {
          validateVar('keyValue', nodeData.keyValue)
        } else {
          // Literal key (string or number - ludb keys are strings)
          checkRequired('keyValue', nodeData.keyValue)
        }
        // Validate Value
        if (nodeData.valueType === 'variable') {
          validateVar('valueSource', nodeData.valueSource)
        } // Literal value can be anything (string, number, boolean, nil), so just check if required? Ludb likely handles serialization.
        break
      case 'ludbRetrieveGlobal':
      case 'ludbRetrieveLocal':
        // Validate Key
        if (nodeData.keyType === 'variable') {
          validateVar('keyValue', nodeData.keyValue)
        } else {
          checkRequired('keyValue', nodeData.keyValue)
        }
        // Validate Result Variable
        validateVar('resultVariable', nodeData.resultVariable)
        // Default value is always literal, no validation needed unless we parse it
        break
      case 'ludbDeleteGlobal':
      case 'ludbDeleteLocal':
        // Validate Key
        if (nodeData.keyType === 'variable') {
          validateVar('keyValue', nodeData.keyValue)
        } else {
          checkRequired('keyValue', nodeData.keyValue)
        }
        break
      // >>>>> Ludb Node Validations END <<<<<
    }

    // Argument sources validation (common, remains the same)
    if (Array.isArray(nodeData.argumentSources)) {
      nodeData.argumentSources.forEach((arg, index) => {
        const fieldName = `argVar_${index}`
        if (arg.type === 'variable') {
          validateVar(fieldName, arg.value)
        }
      })
    }
    setValidationErrors(errors)
  }, [nodeData])

  // --- Handlers (handleChange, handleSwitchChange, handleArgChange, add/removeArgumentInput, handleSave) remain mostly the same

  const handleChange = useCallback(
    (field: keyof DraggableNode, value: any) => {
      setNodeData(prev => {
        if (!prev) return null
        let updatedValue = value
        if (prev.id === 'variable') {
          if (field === 'dataType') {
            let defaultValue: any = ''
            if (value === 'number') defaultValue = 0
            else if (value === 'boolean') defaultValue = false
            else if (value === 'nil') defaultValue = null
            else if (value === 'variable') defaultValue = '' //
            return { ...prev, dataType: value as VariableDataType, value: defaultValue }
          } else if (field === 'value') {
            updatedValue = parseLiteral(value, prev.dataType as VariableDataType)
            return { ...prev, value: updatedValue }
          }
          if (field === 'varType') {
            let defaultValue: any = ''
            return { ...prev, varType: value, value: defaultValue }
          }
        }
        if (prev.id === 'callFunction' && field === 'functionName') {
          const newFuncName = value
          const targetParams =
            getGraph(`${FUNC_PREFIX}${newFuncName}`)?.parameters || []
          const newArgs: ArgumentSource[] = targetParams.map(
            (_, idx) =>
              prev.argumentSources?.[idx] || { type: 'literal', value: '' }
          )
          newArgs.length = targetParams.length
          return { ...prev, functionName: value, argumentSources: newArgs }
        }
        if (prev.id === 'mathAdvanced' && field === 'mathOperationType') {
          const opType = value
          const needsTwoInputs = ['pow', 'min', 'max', 'random'].includes(
            opType || ''
          )
          const resetValue2 = !needsTwoInputs
          return {
            ...prev,
            [field]: value,
            ...(resetValue2 && {
              value2: '0',
              value2Variable: '',
              value2Type: 'literal'
            })
          }
        }
        return { ...prev, [field]: value }
      })
    },
    [getGraph]
  )
  const handleSwitchChange = useCallback(
    (field: keyof DraggableNode, checked: boolean) => {
      /* ... no changes ... */ const isVariable = checked
      handleChange(field, isVariable)
      let varField = ''
      let literalField = ''
      let defaultValue: any = ''
      if (typeof field === 'string') {
        const baseName = field.startsWith('useVariableFor')
          ? field.substring('useVariableFor'.length)
          : field
        const lcBaseName = baseName.charAt(0).toLowerCase() + baseName.slice(1)
        switch (nodeData?.id) {
          case 'math':
            varField =
              field === 'useVariableForValue1'
                ? 'value1Variable'
                : 'value2Variable'
            literalField =
              field === 'useVariableForValue1' ? 'value1' : 'value2'
            defaultValue = 0
            break
          case 'concatStrings':
            varField =
              field === 'useVariableForString1'
                ? 'string1Variable'
                : 'string2Variable'
            literalField =
              field === 'useVariableForString1' ? 'string1' : 'string2'
            defaultValue = ''
            break
          case 'print':
            varField = 'messageVariable'
            literalField = 'message'
            defaultValue = 'Hello'
            break
          case 'wait':
            varField = 'durationVariable'
            literalField = 'duration'
            defaultValue = 1000
            break
          case 'return':
            varField = 'returnVariable'
            literalField = 'returnValue'
            defaultValue = ''
            break
          case 'triggerClientEvent':
            if (field === 'useVariableForTarget') {
              varField = 'targetPlayer'
              literalField = 'targetPlayer'
              defaultValue = '-1'
            }
            break
          case 'vector3':
            varField = lcBaseName + 'Source'
            literalField = varField
            defaultValue = '0.0'
            break
          case 'stringSplit':
          case 'typeCheck':
          case 'toString':
          case 'toNumber':
            if (field === 'useVariableForInput') {
              varField = 'inputVariable'
              literalField =
                nodeData.id === 'stringSplit' ? 'inputString' : 'inputValue'
              defaultValue = ''
            }
            break
          case 'insertIntoTable':
          case 'setTableValue':
            if (field === 'valueType') {
              varField = 'valueSource'
              literalField = 'valueSource'
              defaultValue = ''
            }
            break
          case 'stringSubstring':
          case 'stringLength':
          case 'stringCase':
            if (field === 'useVariableForInput') {
              varField = 'inputStringVariable'
              literalField = 'inputString'
              defaultValue = ''
            }
            break
          case 'stringFind':
            if (field === 'useVariableForHaystack') {
              varField = 'haystackVariable'
              literalField = 'haystackString'
              defaultValue = ''
            }
            if (field === 'useVariableForNeedle') {
              varField = 'needleVariable'
              literalField = 'needleString'
              defaultValue = ''
            }
            break
          case 'stringReplace':
            if (field === 'useVariableForInput') {
              varField = 'inputStringVariable'
              literalField = 'inputString'
              defaultValue = ''
            }
            if (field === 'useVariableForPattern') {
              varField = 'patternVariable'
              literalField = 'patternString'
              defaultValue = ''
            }
            if (field === 'useVariableForReplacement') {
              varField = 'replacementVariable'
              literalField = 'replacementString'
              defaultValue = ''
            }
            break
          case 'mathAdvanced':
            if (field === 'value1Type') {
              varField = 'value1Variable'
              literalField = 'value1'
              defaultValue = '0'
            }
            if (field === 'value2Type') {
              varField = 'value2Variable'
              literalField = 'value2'
              defaultValue = '0'
            }
            break
        }
      }
      if (varField && literalField) {
        if (isVariable) {
          handleChange(literalField, '')
        } else {
          handleChange(varField, '')
          handleChange(literalField, defaultValue)
        }
      }
    },
    [handleChange, nodeData?.id]
  )
  const handleArgChange = useCallback(
    (
      index: number,
      field: keyof ArgumentSource,
      value: ArgumentSource['type'] | ArgumentSource['value']
    ) => {
      setNodeData(prev => {
        if (!prev || !Array.isArray(prev.argumentSources)) return prev
        const newArgs = [...prev.argumentSources]
        if (index >= 0 && index < newArgs.length) {
          const currentArg = { ...newArgs[index] }
          
          if (field === 'type') {
             // Ensure value is one of the allowed types for ArgumentSource['type']
            if (value === 'literal' || value === 'variable') {
              currentArg.type = value;
              currentArg.value = ''; // Reset value when type changes
            } else {
              // Handle unexpected value, perhaps log an error or default
              console.warn(`Invalid value for ArgumentSource type: ${value}`);
              // Optionally default to 'literal' or skip update
              currentArg.type = 'literal'; 
              currentArg.value = '';
            }
          } else {
             currentArg[field] = value as string; // Assuming value is always string for 'value' field
          }
          newArgs[index] = currentArg
          return { ...prev, argumentSources: newArgs }
        }
        return prev
      })
    },
    []
  )
  const addArgumentInput = useCallback(() => {
    /* ... no changes ... */ setNodeData(prev => {
      if (!prev) return prev
      const currentArgs = prev.argumentSources ? [...prev.argumentSources] : []
      const newArgs = [
        ...currentArgs,
        { type: 'literal' as 'literal', value: '' }
      ]
      return { ...prev, argumentSources: newArgs }
    })
  }, [])
  const removeArgumentInput = useCallback((index: number) => {
    /* ... no changes ... */ setNodeData(prev => {
      if (!prev?.argumentSources) return prev
      const newArgs = [...prev.argumentSources]
      if (index >= 0 && index < newArgs.length) {
        newArgs.splice(index, 1)
        return { ...prev, argumentSources: newArgs }
      }
      return prev
    })
  }, [])
  const handleSave = useCallback(() => {
    /* ... no changes ... */ if (!nodeData) return
    if (Object.keys(validationErrors).length > 0) {
      notifications.show({
        title: 'Validation Errors',
        message: 'Please fix errors before saving.',
        color: 'red',
        icon: <IconAlertCircle />
      })
      return
    }
    let finalNodeData = { ...nodeData }
    if (Array.isArray(finalNodeData.argumentSources)) {
      finalNodeData.argumentSources = finalNodeData.argumentSources.map(
        arg => ({ type: arg.type || 'literal', value: arg.value ?? '' })
      )
    }
    onSave(finalNodeData)
  }, [nodeData, onSave, validationErrors])

  // --- Render ---
  if (!opened || !nodeInfo || !nodeData) return null

  // --- Render Node Editor ---
  const renderNodeEditor = () => {
    switch (nodeData.id) {
      // --- EXISTING CASES ---
      // ... (all existing render cases for print, math, variable, etc. remain unchanged) ...
      case 'registerCommand':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              title='Command Registration'
              color='blue'
              variant='outline'
            >
              {' '}
              Defines a chat command. When typed by a player, the selected
              function graph will be executed. Place this node in a `client` or
              `server` file graph.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='commandName'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Command Name'
              placeholder='e.g., car, help, admin'
              required
              icon={<IconTerminal size='1rem' />}
            />{' '}
            <Select
              label='Function to Execute'
              placeholder='Select function graph'
              data={availableFunctionsFiltered}
              value={nodeData.functionName || null}
              onChange={value => handleChange('functionName', value)}
              searchable
              required
              nothingFoundMessage={
                getFunctionNames().length > 0
                  ? 'No compatible functions found'
                  : 'No functions created yet'
              }
              error={validationErrors['functionName']}
              leftSection={<IconSubtask size='1rem' stroke={1.5} />}
              description='Select the function to run when the command is entered.'
            />{' '}
            <Switch
              label="Restricted (Requires 'command.yourCommandName' ACE permission)"
              checked={nodeData.restricted ?? false}
              onChange={e =>
                handleChange('restricted', e.currentTarget.checked)
              }
            />{' '}
            <Alert
              icon={<IconAlertCircle size='1rem' />}
              color='orange'
              variant='light'
            >
              {' '}
              Ensure the selected function (`{nodeData.functionName || '...'}`)
              has parameters defined (e.g., `source`, `args`, `rawCommand`) in
              its settings to receive command arguments.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'elseCondition':
      case 'endIf':
      case 'endWhile':
      case 'endFor':
      case 'endForGeneric':
      case 'break':
        return (
          <Alert
            icon={<IconInfoCircle size='1rem' />}
            title='Control Flow Marker'
            color='gray'
          >
            {' '}
            {nodeData.description ||
              'This node marks a point in the control flow and has no configurable properties.'}{' '}
          </Alert>
        )
      case 'print':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForMessage'
              sourceField='message'
              varFieldName='messageVariable'
              switchLabel='Use Variable for Message'
              literalInputLabel='Message Text'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'Enter message to print/display',
                minRows: 2
              }}
            />{' '}
            <SegmentedControl
              fullWidth
              value={nodeData.printToConsole ? 'console' : 'chat'}
              onChange={value =>
                handleChange('printToConsole', value === 'console')
              }
              data={[
                {
                  label: (
                    <Group gap="xs" wrap="nowrap" justify="center">
                      <IconMessageCircle size="1rem" stroke={1.5} />
                      <span>F8 Console</span>
                    </Group>
                  ),
                  value: 'console',
                },
                {
                  label: (
                    <Group gap="xs" wrap="nowrap" justify="center">
                      <IconMessageChatbot size="1rem" stroke={1.5} />
                      <span>Chat (Simulated)</span>
                    </Group>
                  ),
                  value: 'chat',
                }
              ]}
            />{' '}
            {!nodeData.printToConsole && (
              <ColorInput
                label='Simulated Chat Color'
                value={nodeData.color ?? '#ffffff'}
                onChange={value => handleChange('color', value)}
                format='hex'
                leftSection={<IconPalette size='1rem' />}
              />
            )}{' '}
          </Stack>
        )
      case 'math':
        return (
          <Stack gap='lg'>
            {' '}
            <Select
              label='Operation'
              data={[
                { value: 'add', label: '+ Add' },
                { value: 'subtract', label: '- Subtract' },
                { value: 'multiply', label: '× Multiply' },
                { value: 'divide', label: '÷ Divide' }
              ]}
              value={nodeData.operation ?? 'add'}
              onChange={value => handleChange('operation', value)}
              allowDeselect={false}
              leftSection={<IconMath size='1rem' />}
              styles={{ label: { marginBottom: 'var(--mantine-spacing-xs)' } }}
            />{' '}
            <Group grow align='flex-start'>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForValue1'
                sourceField='value1'
                varFieldName='value1Variable'
                switchLabel='Value 1 from Variable'
                literalInputLabel='Value 1 (Literal)'
                literalInputType='number'
                required
                literalProps={{ allowDecimal: true }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForValue2'
                sourceField='value2'
                varFieldName='value2Variable'
                switchLabel='Value 2 from Variable'
                literalInputLabel='Value 2 (Literal)'
                literalInputType='number'
                required
                literalProps={{ allowDecimal: true }}
              />{' '}
            </Group>{' '}
            <Divider label='Output' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder='mathResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'variable':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='name'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Variable Name'
              placeholder='myVariable'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <SegmentedControl
              fullWidth
              data={[
                { value: 'global', label: 'Global' },
                { value: 'local', label: 'Local' }
              ]}
              value={nodeData.varType ?? 'local'}
              onChange={value => handleChange('varType', value)}
            />{' '}
            <Select
              label='Data Type'
              data={[
                { value: 'string', label: 'String' },
                { value: 'number', label: 'Number' },
                { value: 'boolean', label: 'Boolean' },
                { value: 'variable', label: 'Variable' },
                { value: 'nil', label: 'Nil' }
              ]}
              value={nodeData.dataType ?? 'string'}
              onChange={value => handleChange('dataType', value as VariableDataType)}
              allowDeselect={false}
            />{' '}
            {nodeData.dataType === 'string' && (
              <ValidatedTextarea
                field='value'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Value'
                placeholder='Enter text'
                autosize
                minRows={1}
                icon={<IconAbc size='1rem' stroke={1.5} />}
              />
            )}{' '}
            {nodeData.dataType === 'variable' && (
              <ValidatedTextInput
                field='value'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Source Variable Name'
                placeholder='sourceVariableName'
                icon={<IconVariable size='1rem' stroke={1.5} />}
              />
            )}{' '}
            {nodeData.dataType === 'number' && (
              <ValidatedNumberInput
                field='value'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Value'
                placeholder='Enter number'
                icon={<IconHash size='1rem' stroke={1.5} />}
                allowDecimal={true}
              />
            )}{' '}
            {nodeData.dataType === 'boolean' && (
              <SegmentedControl
                fullWidth
                value={String(nodeData.value ?? false)}
                onChange={value => handleChange('value', value === 'true')}
                data={[
                  { label: 'True', value: 'true' },
                  { label: 'False', value: 'false' }
                ]}
              />
            )}{' '}
            {nodeData.dataType === 'nil' && (
              <Alert icon={<IconInfoCircle size='1rem' />} color='gray'>
                {' '}
                Value will be set to nil (null).{' '}
              </Alert>
            )}{' '}
          </Stack>
        )
      case 'readVariable':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='variableName'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Variable Name to Read'
              placeholder='variableToRead'
              required
              icon={<IconDatabaseImport size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextarea
              field='defaultValue'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Default Value (if variable not found)'
              placeholder='e.g., 0, false, "", nil'
              autosize
              minRows={1}
              description="Literal value used if the variable doesn't exist."
              icon={<IconVariableOff size='1rem' stroke={1.5} />}
            />{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              This node reads the variable for the simulation; use its value in
              subsequent nodes via the same variable name. No new variable is
              created here.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'concatStrings':
        return (
          <Stack gap='lg'>
            {' '}
            <Text fw={500} size='sm' mb={-8}>
              {' '}
              String Inputs{' '}
            </Text>{' '}
            <Group grow align='flex-start'>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForString1'
                sourceField='string1'
                varFieldName='string1Variable'
                switchLabel='String 1 from Variable'
                literalInputLabel='String 1 (Literal)'
                literalInputType='textarea'
                required={false}
                literalProps={{ minRows: 1 }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForString2'
                sourceField='string2'
                varFieldName='string2Variable'
                switchLabel='String 2 from Variable'
                literalInputLabel='String 2 (Literal)'
                literalInputType='textarea'
                required={false}
                literalProps={{ minRows: 1 }}
              />{' '}
            </Group>{' '}
            <Divider label='Output' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder='concatResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'wait':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForDuration'
              sourceField='duration'
              varFieldName='durationVariable'
              switchLabel='Duration from Variable'
              literalInputLabel='Duration (Milliseconds)'
              literalInputType='number'
              required
              literalProps={{
                min: 0,
                step: 100,
                placeholder: 'e.g., 1000',
                icon: <IconClock size='1rem' />
              }}
            />{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              This simulates `Wait()` in Lua. The execution simulation does not
              actually pause.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'return':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert icon={<IconAlertCircle size='1rem' />} color='blue'>
              {' '}
              This node should typically be the last in a Function graph. It
              defines the value returned when the function is called.{' '}
            </Alert>{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForResult'
              sourceField='returnValue'
              varFieldName='returnVariable'
              switchLabel='Return Value from Variable'
              literalInputLabel='Return Literal Value'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., true, 10, "success", nil',
                description: 'Enter string, number, boolean, or nil.',
                minRows: 1,
                icon: <IconArrowBackUp size='1rem' />
              }}
            />{' '}
          </Stack>
        )
      case 'callFunction':
        return (
          <Stack gap='lg'>
            {' '}
            <Select
              label='Function to Call'
              placeholder='Select a function'
              data={availableFunctionsFiltered}
              value={nodeData.functionName || null}
              onChange={value => handleChange('functionName', value)}
              searchable
              required
              nothingFoundMessage={
                availableFunctionsFiltered.length === 0 &&
                getFunctionNames().length > 0
                  ? 'No compatible functions in scope'
                  : 'No functions found'
              }
              error={validationErrors['functionName']}
              leftSection={<IconSubtask size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder='functionResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
              description='The value returned by the function will be stored here.'
            />{' '}
            {nodeData.functionName &&
              renderArgumentEditor(
                `Arguments for ${nodeData.functionName}()`,
                nodeData,
                targetFunctionParams
              )}{' '}
            {!nodeData.functionName && (
              <Text c='dimmed' size='sm'>
                {' '}
                Select a function to configure arguments.{' '}
              </Text>
            )}{' '}
          </Stack>
        )
      case 'ifCondition':
        return renderConditionEditor('If Condition', IconGitBranch)
      case 'whileCondition':
        return renderConditionEditor('While Loop Condition', IconRepeat)
      case 'forLoopNumeric':
        return (
          <Stack gap='lg'>
            {' '}
            <Divider label='Loop Control' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='controlVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Control Variable Name'
              placeholder='i'
              required
              description='e.g., i, index, count (will be local to loop)'
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Divider label='Loop Range' labelPosition='center' />{' '}
            <Group grow align='flex-start'>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='startValueType'
                sourceField='startValue'
                switchLabel='Start from Variable'
                literalInputLabel='Start Value'
                literalInputType='number'
                required
                literalProps={{ placeholder: '1', allowDecimal: true }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='endValueType'
                sourceField='endValue'
                switchLabel='End at Variable'
                literalInputLabel='End Value'
                literalInputType='number'
                required
                literalProps={{ placeholder: '10', allowDecimal: true }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='stepValueType'
                sourceField='stepValue'
                switchLabel='Step by Variable'
                literalInputLabel='Step Value'
                literalInputType='number'
                required
                literalProps={{ placeholder: '1', allowDecimal: true }}
              />{' '}
            </Group>{' '}
          </Stack>
        )
      case 'triggerServerEvent':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconWorld size='1rem' />}
              title='Client -> Server'
              color='orange'
              variant='outline'
            >
              {' '}
              Sends an event from the client to be handled on the server.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='eventName'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Event Name'
              placeholder='myPrefix:myServerEvent'
              required
              icon={<IconServerBolt size='1rem' />}
            />{' '}
            {renderArgumentEditor('Arguments to Send', nodeData, [], true)}{' '}
          </Stack>
        )
      case 'triggerClientEvent':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconDeviceLaptop size='1rem' />}
              title='Server -> Client'
              color='blue'
              variant='outline'
            >
              {' '}
              Sends an event from the server to be handled by one or more
              clients.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='eventName'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Event Name'
              placeholder='myPrefix:myClientEvent'
              required
              icon={<IconMessageChatbot size='1rem' />}
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForTarget'
              sourceField='targetPlayer'
              varFieldName='targetPlayer'
              switchLabel='Target Player(s) from Variable'
              literalInputLabel='Target Player ID(s)'
              literalInputType='text'
              required={true}
              literalProps={{
                placeholder: '-1 (all), 0 (host), or specific ID(s)',
                icon: <IconHash size='1rem' />
              }}
            />{' '}
            {renderArgumentEditor('Arguments to Send', nodeData, [], true)}{' '}
          </Stack>
        )
      case 'forLoopGeneric':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Table Variable Name'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Select
              label='Iteration Type'
              data={[
                { value: 'pairs', label: 'pairs (key, value)' },
                { value: 'ipairs', label: 'ipairs (index, value)' }
              ]}
              value={nodeData.iterationType ?? 'pairs'}
              onChange={value => handleChange('iterationType', value)}
              allowDeselect={false}
              description='pairs iterates all, ipairs iterates numeric keys 1..n'
            />{' '}
            <Divider label='Loop Variables' labelPosition='center' />{' '}
            <Group grow>
              {' '}
              <ValidatedTextInput
                field='keyVariable'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label={
                  nodeData.iterationType === 'ipairs'
                    ? 'Index Variable Name'
                    : 'Key Variable Name'
                }
                placeholder={
                  nodeData.iterationType === 'ipairs' ? 'index' : 'key'
                }
                required
                icon={<IconHash size='1rem' stroke={1.5} />}
                description='Will be created/updated in loop scope.'
              />{' '}
              <ValidatedTextInput
                field='valueVariable'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Value Variable Name'
                placeholder='value'
                required
                icon={<IconVariable size='1rem' stroke={1.5} />}
                description='Will be created/updated in loop scope.'
              />{' '}
            </Group>{' '}
          </Stack>
        )
      case 'createTable':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='blue'
              variant='outline'
            >
              {' '}
              Initializes an empty Lua table `{}`. Use 'Set Table Value' or
              'Insert Into Table' nodes to add data.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='variableName'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store New Table In Variable'
              placeholder='myNewTable'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'setTableValue':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Target Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Paper p='sm' withBorder radius='sm'>
              {' '}
              <Stack gap='xs'>
                {' '}
                <Text fw={500} size='sm'>
                  {' '}
                  Key{' '}
                </Text>{' '}
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: 'String', value: 'literal' },
                    { label: 'Number', value: 'number_literal' },
                    { label: 'Variable', value: 'variable' }
                  ]}
                  value={nodeData.keyType ?? 'literal'}
                  onChange={v => handleChange('keyType', v)}
                />{' '}
                {nodeData.keyType === 'variable' ? (
                  <ValidatedTextInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key Variable Name'
                    placeholder='keyVar'
                    required
                    icon={<IconVariable size='1rem' stroke={1.5} />}
                  />
                ) : nodeData.keyType === 'number_literal' ? (
                  <ValidatedNumberInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key Number'
                    placeholder='1'
                    required
                    step={1}
                    icon={<IconHash size='1rem' stroke={1.5} />}
                    allowDecimal={false}
                  />
                ) : (
                  <ValidatedTextInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key String'
                    placeholder='myKey'
                    required
                    icon={<IconAbc size='1rem' stroke={1.5} />}
                  />
                )}{' '}
              </Stack>{' '}
            </Paper>{' '}
            <Paper p='sm' withBorder radius='sm'>
              {' '}
              <Stack gap='xs'>
                {' '}
                <Text fw={500} size='sm'>
                  {' '}
                  Value{' '}
                </Text>{' '}
                <VarLiteralPair
                  nodeData={nodeData}
                  onChange={handleChange}
                  onSwitchChange={handleSwitchChange}
                  errors={validationErrors}
                  typeField='valueType'
                  sourceField='valueSource'
                  varFieldName='valueSource'
                  literalFieldName='valueSource'
                  switchLabel='Value from Variable'
                  varInputLabel='Value Variable Name'
                  literalInputLabel='Value (Literal)'
                  literalInputType='textarea'
                  required={false}
                  literalProps={{
                    placeholder: 'e.g., true, 10, "text", nil',
                    description: 'Enter string, number, boolean, or nil.',
                    minRows: 1
                  }}
                />{' '}
              </Stack>{' '}
            </Paper>{' '}
          </Stack>
        )
      case 'getTableValue':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Source Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Paper p='sm' withBorder radius='sm'>
              {' '}
              <Stack gap='xs'>
                {' '}
                <Text fw={500} size='sm'>
                  {' '}
                  Key{' '}
                </Text>{' '}
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: 'String', value: 'literal' },
                    { label: 'Number', value: 'number_literal' },
                    { label: 'Variable', value: 'variable' }
                  ]}
                  value={nodeData.keyType ?? 'literal'}
                  onChange={v => handleChange('keyType', v)}
                />{' '}
                {nodeData.keyType === 'variable' ? (
                  <ValidatedTextInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key Variable Name'
                    placeholder='keyVar'
                    required
                    icon={<IconVariable size='1rem' />}
                  />
                ) : nodeData.keyType === 'number_literal' ? (
                  <ValidatedNumberInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key Number'
                    placeholder='1'
                    required
                    step={1}
                    icon={<IconHash size='1rem' />}
                    allowDecimal={false}
                  />
                ) : (
                  <ValidatedTextInput
                    field='keyValue'
                    nodeData={nodeData}
                    onChange={handleChange}
                    errors={validationErrors}
                    label='Key String'
                    placeholder='myKey'
                    required
                    icon={<IconAbc size='1rem' stroke={1.5} />}
                  />
                )}{' '}
              </Stack>{' '}
            </Paper>{' '}
            <Divider label='Output' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder='valueResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextarea
              field='defaultValue'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Default Value (if key not found)'
              placeholder='e.g., 0, false, "", nil'
              autosize
              minRows={1}
              description="Literal value used if the key doesn't exist in the table."
              icon={<IconAbc size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'callNative':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='nativeNameOrHash'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Native Name or Hash'
              placeholder='GetPlayerPed or 0x43A...'
              required
              icon={<IconTerminal2 size='1rem' stroke={1.5} />}
              description='Enter the exact native name or its hex hash.'
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable (Optional)'
              placeholder='nativeResult'
              required={false}
              icon={<IconVariable size='1rem' stroke={1.5} />}
              description="Leave blank if the native doesn't return a value you need."
            />{' '}
            {renderArgumentEditor('Arguments to Send', nodeData, [], true)}{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              Native calls are only simulated during execution in this tool. The
              actual call happens in the generated Lua code.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'vector3':
        return (
          <Stack gap='lg'>
            {' '}
            <Text fw={500} size='sm'>
              {' '}
              Components{' '}
            </Text>{' '}
            <Group grow align='flex-start'>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForX'
                sourceField='xSource'
                switchLabel='X from Variable'
                literalInputLabel='X (Literal)'
                literalInputType='number'
                required
                literalProps={{
                  placeholder: '0.0',
                  allowDecimal: true,
                  step: 0.1,
                  precision: 3
                }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForY'
                sourceField='ySource'
                switchLabel='Y from Variable'
                literalInputLabel='Y (Literal)'
                literalInputType='number'
                required
                literalProps={{
                  placeholder: '0.0',
                  allowDecimal: true,
                  step: 0.1,
                  precision: 3
                }}
              />{' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='useVariableForZ'
                sourceField='zSource'
                switchLabel='Z from Variable'
                literalInputLabel='Z (Literal)'
                literalInputType='number'
                required
                literalProps={{
                  placeholder: '0.0',
                  allowDecimal: true,
                  step: 0.1,
                  precision: 3
                }}
              />{' '}
            </Group>{' '}
            <Divider label='Output' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Vector In Variable'
              placeholder='vectorResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'json':
        return (
          <Stack gap='lg'>
            {' '}
            <SegmentedControl
              fullWidth
              data={[
                { label: 'Encode (Table -> JSON)', value: 'encode' },
                { label: 'Decode (JSON -> Table)', value: 'decode' }
              ]}
              value={nodeData.jsonOperation ?? 'encode'}
              onChange={value => handleChange('jsonOperation', value)}
            />{' '}
            <ValidatedTextInput
              field='inputVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label={
                nodeData.jsonOperation === 'encode'
                  ? 'Input Table Variable'
                  : 'Input JSON String Variable'
              }
              placeholder='inputVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label={
                nodeData.jsonOperation === 'encode'
                  ? 'Store JSON String In Variable'
                  : 'Store Result Table In Variable'
              }
              placeholder='outputVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              Requires a JSON library (like `json-lua` included in fxserver or
              `ox_lib`) available in the Lua environment.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'insertIntoTable':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='blue'
              variant='outline'
            >
              {' '}
              Appends a value to the end of a table (array). Simulates
              `table.insert(tbl, value)`.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Target Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='valueType'
              sourceField='valueSource'
              varFieldName='valueSource'
              literalFieldName='valueSource'
              switchLabel='Value from Variable'
              literalInputLabel='Value to Insert (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., true, 10, "text", nil',
                description: 'Enter string, number, boolean, or nil.',
                minRows: 1
              }}
            />{' '}
          </Stack>
        )
      case 'getTableLength':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='blue'
              variant='outline'
            >
              {' '}
              Gets the length of a table using the `#` operator. For non-array
              tables, the result might differ from counting keys manually.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Target Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Length In Variable'
              placeholder='tableLen'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'stringFormat':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextarea
              field='formatString'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Format String'
              placeholder='Hello, %s! Your score is %d.'
              required
              autosize
              minRows={2}
              icon={<IconQuote size='1rem' stroke={1.5} />}
              description='Use Lua format specifiers like %s (string), %d (integer), %f (float), etc.'
            />{' '}
            {renderArgumentEditor('Values to Format', nodeData, [], true)}{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Formatted String In Variable'
              placeholder='formattedResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              The execution simulation performs basic substitution. The
              generated Lua code will use `string.format` correctly.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'stringSplit':
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='blue'
              variant='outline'
            >
              {' '}
              Splits a string into a table of substrings based on the separator.{' '}
            </Alert>{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputString'
              varFieldName='inputStringVariable'
              literalFieldName='inputString'
              switchLabel='Input String from Variable'
              literalInputLabel='Input String (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., apple,banana,cherry',
                minRows: 1
              }}
            />{' '}
            <ValidatedTextInput
              field='separator'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Separator String'
              placeholder=','
              icon={<IconCut size='1rem' stroke={1.5} />}
              description='String to split by. Leave empty to split into characters.'
            />{' '}
            <ValidatedNumberInput
              field='limit'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Limit (Optional)'
              placeholder='e.g., 2'
              icon={<IconHash size='1rem' stroke={1.5} />}
              description='Maximum number of elements in the resulting table (integer > 0).'
              min={1}
              step={1}
              allowDecimal={false}
              required={false}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result Table In Variable'
              placeholder='splitTable'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'typeCheck':
      case 'toString':
      case 'toNumber': {
        const isToNumber = nodeData.id === 'toNumber'
        const actionLabel =
          nodeData.id === 'typeCheck'
            ? 'Check Type of'
            : nodeData.id === 'toString'
            ? 'Convert to String'
            : 'Convert to Number'
        const inputTypeLabel = 'Value'
        const resultTypeLabel =
          nodeData.id === 'typeCheck'
            ? 'Type String'
            : nodeData.id === 'toString'
            ? 'String Result'
            : 'Number Result'
        const resultPlaceholder =
          nodeData.id === 'typeCheck'
            ? 'valueType'
            : nodeData.id === 'toString'
            ? 'stringValue'
            : 'numberValue'
        const icon =
          nodeData.id === 'typeCheck' ? (
            <IconQuestionMark size='1rem' />
          ) : nodeData.id === 'toString' ? (
            <IconLetterCase size='1rem' />
          ) : (
            <IconNumber size='1rem' />
          )
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='blue'
              variant='outline'
            >
              {' '}
              {actionLabel} a value, similar to Lua's `
              {nodeData.id.toLowerCase()}()`.{' '}
            </Alert>{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputValue'
              varFieldName='inputVariable'
              literalFieldName='inputValue'
              switchLabel={`${inputTypeLabel} from Variable`}
              literalInputLabel={`${inputTypeLabel} (Literal)`}
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., true, 10, "text", nil',
                minRows: 1
              }}
            />{' '}
            {isToNumber && (
              <ValidatedNumberInput
                field='base'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Base (Optional)'
                placeholder='e.g., 10 or 16'
                icon={<IconHash size='1rem' stroke={1.5} />}
                description='Numeric base for conversion (2-36). Default depends on input format.'
                min={2}
                max={36}
                step={1}
                allowDecimal={false}
                required={false}
              />
            )}{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label={`Store ${resultTypeLabel} In Variable`}
              placeholder={resultPlaceholder}
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            {isToNumber && (
              <Alert
                icon={<IconAlertCircle size='1rem' />}
                color='orange'
                variant='light'
              >
                {' '}
                Conversion returns `nil` (null in simulation) if the input
                cannot be converted with the specified base.{' '}
              </Alert>
            )}{' '}
          </Stack>
        )
      }
      case 'stringSubstring':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputString'
              varFieldName='inputStringVariable'
              literalFieldName='inputString'
              switchLabel='Input String from Variable'
              literalInputLabel='Input String (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{ placeholder: 'e.g., Hello World', minRows: 1 }}
            />{' '}
            <Paper p='sm' withBorder radius='sm'>
              {' '}
              <Stack gap='xs'>
                {' '}
                <Text fw={500} size='sm'>
                  {' '}
                  Indices (1-based){' '}
                </Text>{' '}
                <Group grow align='flex-start'>
                  {' '}
                  <VarLiteralPair
                    nodeData={nodeData}
                    onChange={handleChange}
                    onSwitchChange={handleSwitchChange}
                    errors={validationErrors}
                    typeField='startIndexType'
                    sourceField='startIndex'
                    switchLabel='Start Index from Var'
                    literalInputLabel='Start Index'
                    literalInputType='number'
                    required
                    literalProps={{
                      placeholder: '1',
                      min: 1,
                      step: 1,
                      allowDecimal: false
                    }}
                  />{' '}
                  <VarLiteralPair
                    nodeData={nodeData}
                    onChange={handleChange}
                    onSwitchChange={handleSwitchChange}
                    errors={validationErrors}
                    typeField='endIndexType'
                    sourceField='endIndex'
                    switchLabel='End Index from Var'
                    literalInputLabel='End Index (Optional)'
                    literalInputType='number'
                    required={false}
                    literalProps={{
                      placeholder: 'e.g., 5',
                      min: 1,
                      step: 1,
                      allowDecimal: false,
                      description: 'Leave empty for end of string.'
                    }}
                  />{' '}
                </Group>{' '}
              </Stack>{' '}
            </Paper>{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Substring In Variable'
              placeholder='substringResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'stringLength':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputString'
              varFieldName='inputStringVariable'
              literalFieldName='inputString'
              switchLabel='Input String from Variable'
              literalInputLabel='Input String (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{ placeholder: 'e.g., Hello World', minRows: 1 }}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Length In Variable'
              placeholder='stringLengthResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'stringFind':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForHaystack'
              sourceField='haystackString'
              varFieldName='haystackVariable'
              literalFieldName='haystackString'
              switchLabel='Search In (Haystack) from Variable'
              literalInputLabel='Search In (Haystack) Literal'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., The quick brown fox',
                minRows: 1
              }}
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForNeedle'
              sourceField='needleString'
              varFieldName='needleVariable'
              literalFieldName='needleString'
              switchLabel='Find Substring (Needle) from Variable'
              literalInputLabel='Find Substring (Needle) Literal'
              literalInputType='text'
              required
              literalProps={{ placeholder: 'e.g., brown' }}
            />{' '}
            <Group grow align='flex-start'>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='startIndexType'
                sourceField='startIndex'
                switchLabel='Start Search Index from Var'
                literalInputLabel='Start Search Index (1-based)'
                literalInputType='number'
                required
                literalProps={{
                  placeholder: '1',
                  min: 1,
                  step: 1,
                  allowDecimal: false
                }}
              />{' '}
              <Switch
                label='Plain Find (Disable Patterns)'
                checked={nodeData.plainFind ?? false}
                onChange={e =>
                  handleChange('plainFind', e.currentTarget.checked)
                }
                mt='xl'
              />{' '}
            </Group>{' '}
            <Divider
              label='Output Variables (Optional)'
              labelPosition='center'
            />{' '}
            <Group grow>
              {' '}
              <ValidatedTextInput
                field='resultStartIndexVar'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Store Start Index In Variable'
                placeholder='foundStart'
                required={false}
                icon={<IconVariable size='1rem' stroke={1.5} />}
                description='Stores start position (1-based) if found, else nil.'
              />{' '}
              <ValidatedTextInput
                field='resultEndIndexVar'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Store End Index In Variable'
                placeholder='foundEnd'
                required={false}
                icon={<IconVariable size='1rem' stroke={1.5} />}
                description='Stores end position if found, else nil.'
              />{' '}
            </Group>{' '}
          </Stack>
        )
      case 'stringReplace':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputString'
              varFieldName='inputStringVariable'
              literalFieldName='inputString'
              switchLabel='Input String from Variable'
              literalInputLabel='Input String (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{
                placeholder: 'e.g., Hello world, world!',
                minRows: 1
              }}
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForPattern'
              sourceField='patternString'
              varFieldName='patternVariable'
              literalFieldName='patternString'
              switchLabel='Pattern to Find from Variable'
              literalInputLabel='Pattern to Find (Literal)'
              literalInputType='text'
              required
              literalProps={{ placeholder: 'world' }}
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForReplacement'
              sourceField='replacementString'
              varFieldName='replacementVariable'
              literalFieldName='replacementString'
              switchLabel='Replace With from Variable'
              literalInputLabel='Replace With (Literal)'
              literalInputType='text'
              required={false}
              literalProps={{ placeholder: 'planet' }}
            />{' '}
            <Group grow>
              {' '}
              <VarLiteralPair
                nodeData={nodeData}
                onChange={handleChange}
                onSwitchChange={handleSwitchChange}
                errors={validationErrors}
                typeField='limitType'
                sourceField='limit'
                switchLabel='Max Replacements from Var'
                literalInputLabel='Max Replacements (Optional)'
                literalInputType='number'
                required={false}
                literalProps={{
                  placeholder: 'e.g., 1',
                  min: 1,
                  step: 1,
                  allowDecimal: false
                }}
              />{' '}
            </Group>{' '}
            <Divider label='Output Variables' labelPosition='center' />{' '}
            <ValidatedTextInput
              field='resultStringVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result String In Variable'
              placeholder='replacedString'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <ValidatedTextInput
              field='resultCountVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Replacement Count In Variable (Optional)'
              placeholder='replaceCount'
              required={false}
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'stringCase':
        return (
          <Stack gap='lg'>
            {' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='useVariableForInput'
              sourceField='inputString'
              varFieldName='inputStringVariable'
              literalFieldName='inputString'
              switchLabel='Input String from Variable'
              literalInputLabel='Input String (Literal)'
              literalInputType='textarea'
              required={false}
              literalProps={{ placeholder: 'e.g., HeLLo WoRLd', minRows: 1 }}
            />{' '}
            <SegmentedControl
              fullWidth
              data={[
                { label: 'To Lowercase', value: 'lower' },
                { label: 'To Uppercase', value: 'upper' }
              ]}
              value={nodeData.caseType ?? 'lower'}
              onChange={value => handleChange('caseType', value)}
            />{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result String In Variable'
              placeholder='casedString'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      case 'mathAdvanced': {
        const opType = nodeData.mathOperationType || 'floor'
        const needsVal1 = [
          'floor',
          'ceil',
          'abs',
          'sqrt',
          'pow',
          'min',
          'max',
          'random'
        ].includes(opType)
        const needsVal2 = ['pow', 'min', 'max', 'random'].includes(opType)
        return (
          <Stack gap='lg'>
            {' '}
            <Select
              label='Math Function'
              data={[
                { value: 'floor', label: 'Floor (math.floor)' },
                { value: 'ceil', label: 'Ceiling (math.ceil)' },
                { value: 'abs', label: 'Absolute Value (math.abs)' },
                { value: 'sqrt', label: 'Square Root (math.sqrt)' },
                { value: 'pow', label: 'Power (math.pow)' },
                { value: 'min', label: 'Minimum (math.min)' },
                { value: 'max', label: 'Maximum (math.max)' },
                { value: 'random', label: 'Random (math.random)' }
              ]}
              value={opType}
              onChange={value => handleChange('mathOperationType', value)}
              allowDeselect={false}
              leftSection={<IconCalculator size='1rem' />}
            />{' '}
            <Group grow align='flex-start'>
              {' '}
              {needsVal1 && (
                <VarLiteralPair
                  nodeData={nodeData}
                  onChange={handleChange}
                  onSwitchChange={handleSwitchChange}
                  errors={validationErrors}
                  typeField='value1Type'
                  sourceField='value1'
                  varFieldName='value1Variable'
                  switchLabel={
                    opType === 'random'
                      ? 'Min from Var'
                      : opType === 'pow'
                      ? 'Base from Var'
                      : 'Value 1 from Var'
                  }
                  literalInputLabel={
                    opType === 'random'
                      ? 'Min (Int)'
                      : opType === 'pow'
                      ? 'Base'
                      : 'Value 1'
                  }
                  literalInputType='number'
                  required
                  literalProps={{
                    allowDecimal: opType !== 'random',
                    placeholder: opType === 'random' ? '1' : '0'
                  }}
                />
              )}{' '}
              {needsVal2 && (
                <VarLiteralPair
                  nodeData={nodeData}
                  onChange={handleChange}
                  onSwitchChange={handleSwitchChange}
                  errors={validationErrors}
                  typeField='value2Type'
                  sourceField='value2'
                  varFieldName='value2Variable'
                  switchLabel={
                    opType === 'random'
                      ? 'Max from Var'
                      : opType === 'pow'
                      ? 'Exponent from Var'
                      : 'Value 2 from Var'
                  }
                  literalInputLabel={
                    opType === 'random'
                      ? 'Max (Int)'
                      : opType === 'pow'
                      ? 'Exponent'
                      : 'Value 2'
                  }
                  literalInputType='number'
                  required
                  literalProps={{
                    allowDecimal: opType !== 'random',
                    placeholder: opType === 'random' ? '100' : '0'
                  }}
                />
              )}{' '}
              {needsVal1 && !needsVal2 && <Box style={{ flex: 1 }} />}{' '}
            </Group>{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
              mt={needsVal1 || needsVal2 ? 0 : 'md'}
            >
              {' '}
              {opType === 'random'
                ? 'With no args, returns float 0-1. With Min/Max, returns integer in range [Min, Max].'
                : opType === 'pow'
                ? 'Calculates Base to the power of Exponent.'
                : opType === 'min' || opType === 'max'
                ? 'Returns the minimum/maximum of the two values.'
                : 'Applies the selected math function.'}{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder='mathAdvResult'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
          </Stack>
        )
      }
      case 'tableRemove':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Target Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
              description='Must be an array (list) for predictable behavior.'
            />{' '}
            <VarLiteralPair
              nodeData={nodeData}
              onChange={handleChange}
              onSwitchChange={handleSwitchChange}
              errors={validationErrors}
              typeField='indexType'
              sourceField='index'
              switchLabel='Index from Var'
              literalInputLabel='Index (1-based, Optional)'
              literalInputType='number'
              required={false}
              literalProps={{
                placeholder: 'e.g., 2',
                min: 1,
                step: 1,
                allowDecimal: false,
                description: 'Leave empty to remove the last element.'
              }}
            />{' '}
            <ValidatedTextInput
              field='resultRemovedValueVar'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Removed Value In Variable (Optional)'
              placeholder='removedValue'
              required={false}
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              Simulates `table.remove`. Modifies the table directly in the
              simulation.{' '}
            </Alert>{' '}
          </Stack>
        )
      case 'tableSort':
        return (
          <Stack gap='lg'>
            {' '}
            <ValidatedTextInput
              field='tableVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Target Table Variable'
              placeholder='tableVar'
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
              description='The table will be sorted in-place.'
            />{' '}
            <SegmentedControl
              fullWidth
              data={[
                { label: 'Default Sort', value: 'none' },
                { label: 'Custom Sort Func (Var)', value: 'customVariable' }
              ]}
              value={nodeData.sortFunctionType ?? 'none'}
              onChange={value => handleChange('sortFunctionType', value)}
            />{' '}
            {nodeData.sortFunctionType === 'customVariable' && (
              <ValidatedTextInput
                field='sortFunctionVariable'
                nodeData={nodeData}
                onChange={handleChange}
                errors={validationErrors}
                label='Sort Function Variable Name'
                placeholder='mySortFunction'
                required
                icon={<IconVariable size='1rem' stroke={1.5} />}
                description='The variable must hold a function `function(a, b) return a < b end`.'
              />
            )}{' '}
            <Alert
              icon={<IconInfoCircle size='1rem' />}
              color='gray'
              variant='outline'
            >
              {' '}
              Simulates `table.sort`. Modifies the table directly in the
              simulation. Custom sort functions are not executed in simulation.{' '}
            </Alert>{' '}
          </Stack>
        )

      // >>>>> Ludb Node Editors START <<<<<
      case 'ludbSaveGlobal':
      case 'ludbSaveLocal': {
        const isGlobal = nodeData.id === 'ludbSaveGlobal'
        return (
          <Stack gap='lg'>
            <Alert
              icon={isGlobal ? <IconWorld /> : <IconLock />}
              title={`Ludb: Save ${isGlobal ? 'Global' : 'Local'}`}
              color={isGlobal ? 'green' : 'lime'}
              variant='outline'
            >
              Saves data to the database using `ludb:
              {isGlobal ? 'saveGlobal' : 'save'}`.
              {isGlobal
                ? ' Global data is accessible across resources.'
                : ' Local data is restricted to this resource.'}
              Database operations are not simulated.
            </Alert>
            <Paper p='sm' withBorder radius='sm'>
              <Stack gap='xs'>
                <Text fw={500} size='sm'>
                  Key
                </Text>
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: 'Literal', value: 'literal' },
                    { label: 'Variable', value: 'variable' }
                  ]}
                  value={nodeData.keyType ?? 'literal'}
                  onChange={v => handleChange('keyType', v)}
                />
                <ValidatedTextInput
                  field='keyValue'
                  nodeData={nodeData}
                  onChange={handleChange}
                  errors={validationErrors}
                  label={
                    nodeData.keyType === 'variable'
                      ? 'Key Variable Name'
                      : 'Key String'
                  }
                  placeholder={
                    nodeData.keyType === 'variable'
                      ? 'keyVar'
                      : isGlobal
                      ? 'global/path/key'
                      : 'local/path/key'
                  }
                  required
                  icon={
                    nodeData.keyType === 'variable' ? (
                      <IconVariable size='1rem' />
                    ) : (
                      <IconAbc size='1rem' />
                    )
                  }
                />
              </Stack>
            </Paper>
            <Paper p='sm' withBorder radius='sm'>
              <Stack gap='xs'>
                <Text fw={500} size='sm'>
                  Value
                </Text>
                <VarLiteralPair
                  nodeData={nodeData}
                  onChange={handleChange}
                  onSwitchChange={handleSwitchChange} // Assuming this works correctly for valueType/valueSource
                  errors={validationErrors}
                  typeField='valueType'
                  sourceField='valueSource'
                  switchLabel='Value from Variable'
                  literalInputLabel='Value (Literal)'
                  literalInputType='textarea'
                  required={false} // Allow saving nil etc.
                  literalProps={{
                    placeholder: 'e.g., true, 10, "text", nil, {x=1}',
                    description:
                      'Enter string, number, boolean, nil, or simple table.',
                    minRows: 1
                  }}
                />
              </Stack>
            </Paper>
          </Stack>
        )
      }
      case 'ludbRetrieveGlobal':
      case 'ludbRetrieveLocal': {
        const isGlobal = nodeData.id === 'ludbRetrieveGlobal'
        return (
          <Stack gap='lg'>
            <Alert
              icon={isGlobal ? <IconWorld /> : <IconLock />}
              title={`Ludb: Retrieve ${isGlobal ? 'Global' : 'Local'}`}
              color='blue'
              variant='outline'
            >
              Retrieves data from the database using `ludb:
              {isGlobal ? 'retrieveGlobal' : 'retrieve'}`. Database operations
              are not simulated; default value will be used.
            </Alert>
            <Paper p='sm' withBorder radius='sm'>
              <Stack gap='xs'>
                <Text fw={500} size='sm'>
                  Key
                </Text>
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: 'Literal', value: 'literal' },
                    { label: 'Variable', value: 'variable' }
                  ]}
                  value={nodeData.keyType ?? 'literal'}
                  onChange={v => handleChange('keyType', v)}
                />
                <ValidatedTextInput
                  field='keyValue'
                  nodeData={nodeData}
                  onChange={handleChange}
                  errors={validationErrors}
                  label={
                    nodeData.keyType === 'variable'
                      ? 'Key Variable Name'
                      : 'Key String'
                  }
                  placeholder={
                    nodeData.keyType === 'variable'
                      ? 'keyVar'
                      : isGlobal
                      ? 'global/path/key'
                      : 'local/path/key'
                  }
                  required
                  icon={
                    nodeData.keyType === 'variable' ? (
                      <IconVariable size='1rem' />
                    ) : (
                      <IconAbc size='1rem' />
                    )
                  }
                />
              </Stack>
            </Paper>
            <ValidatedTextarea
              field='defaultValue'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Default Value (if key not found)'
              placeholder='e.g., 0, false, "", nil'
              autosize
              minRows={1}
              description="Literal value used if the key doesn't exist."
              icon={<IconVariableOff size='1rem' stroke={1.5} />}
            />
            <ValidatedTextInput
              field='resultVariable'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Store Result In Variable'
              placeholder={nodeData.resultVariable || 'retrievedValue'}
              required
              icon={<IconVariable size='1rem' stroke={1.5} />}
            />
          </Stack>
        )
      }
      case 'ludbDeleteGlobal':
      case 'ludbDeleteLocal': {
        const isGlobal = nodeData.id === 'ludbDeleteGlobal'
        return (
          <Stack gap='lg'>
            <Alert
              icon={isGlobal ? <IconWorld /> : <IconLock />}
              title={`Ludb: Delete ${isGlobal ? 'Global' : 'Local'}`}
              color='red'
              variant='outline'
            >
              Deletes data from the database using `ludb:
              {isGlobal ? 'deleteGlobal' : 'delete'}`. Database operations are
              not simulated.
            </Alert>
            <Paper p='sm' withBorder radius='sm'>
              <Stack gap='xs'>
                <Text fw={500} size='sm'>
                  Key
                </Text>
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: 'Literal', value: 'literal' },
                    { label: 'Variable', value: 'variable' }
                  ]}
                  value={nodeData.keyType ?? 'literal'}
                  onChange={v => handleChange('keyType', v)}
                />
                <ValidatedTextInput
                  field='keyValue'
                  nodeData={nodeData}
                  onChange={handleChange}
                  errors={validationErrors}
                  label={
                    nodeData.keyType === 'variable'
                      ? 'Key Variable Name'
                      : 'Key String'
                  }
                  placeholder={
                    nodeData.keyType === 'variable'
                      ? 'keyVar'
                      : isGlobal
                      ? 'global/path/key'
                      : 'local/path/key'
                  }
                  required
                  icon={
                    nodeData.keyType === 'variable' ? (
                      <IconVariable size='1rem' />
                    ) : (
                      <IconAbc size='1rem' />
                    )
                  }
                />
              </Stack>
            </Paper>
          </Stack>
        )
      }

      default:
        return (
          <Stack gap='lg'>
            {' '}
            <Alert
              icon={<IconSettings size='1rem' />}
              title='Generic Editor'
              color='gray'
            >
              {' '}
              This node type (`{nodeData.id}`) doesn't have a specific editor
              configured yet. You can edit the basic label and description.{' '}
            </Alert>{' '}
            <ValidatedTextInput
              field='label'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Node Label (Optional)'
              placeholder={nodeInfo.node.label}
            />{' '}
            <ValidatedTextarea
              field='description'
              nodeData={nodeData}
              onChange={handleChange}
              errors={validationErrors}
              label='Node Description (Optional)'
              placeholder={
                nodeInfo.node.description || 'No description provided'
              }
              autosize
              minRows={1}
              maxRows={3}
            />{' '}
          </Stack>
        )
    }
  }

  // Helper: Render Condition Editor
  const renderConditionEditor = (
    title: string,
    TitleIconComponent: React.ElementType
  ) => {
    const operators = [
      { value: '==', label: '== (Equals)' },
      { value: '~=', label: '~= (Not Equals)' },
      { value: '>', label: '> (Greater Than)' },
      { value: '<', label: '< (Less Than)' },
      { value: '>=', label: '>= (Greater or Equal)' },
      { value: '<=', label: '<= (Less or Equal)' },
      { value: 'is true', label: 'Is True (Truthy)' },
      { value: 'is false', label: 'Is False (Falsy)' },
      { value: 'is nil', label: 'Is Nil' },
      { value: 'is not nil', label: 'Is Not Nil' }
    ]
    const isUnary = ['is true', 'is false', 'is nil', 'is not nil'].includes(
      nodeData?.conditionOperator || ''
    )

    return (
      <Stack gap='md'>
        <Group gap='xs' mb='xs'>
          <TitleIconComponent size='1.2rem' stroke={1.5} />
          <Text fw={500} size='sm'>
            {title}
          </Text>
        </Group>

        <Grid gutter='md' align='flex-start'>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper p='sm' withBorder radius='sm' style={{ height: '100%' }}>
              <Stack gap='xs'>
                <Text size='xs' fw={500}>
                  Operand A (Left Side)
                </Text>
                <SegmentedControl
                  fullWidth
                  size='xs'
                  data={[
                    { label: 'Variable', value: 'variable' },
                    { label: 'Literal', value: 'literal' }
                  ]}
                  value={nodeData?.conditionLhsType ?? 'variable'}
                  onChange={value => handleChange('conditionLhsType', value)}
                />
                <TextInput
                  placeholder={
                    nodeData?.conditionLhsType === 'variable'
                      ? 'variableName'
                      : 'e.g., true, 10, "text"'
                  }
                  required
                  value={nodeData?.conditionLhsValue ?? ''}
                  onChange={e =>
                    handleChange('conditionLhsValue', e.currentTarget.value)
                  }
                  leftSection={
                    nodeData?.conditionLhsType === 'variable' ? (
                      <IconVariable size='1rem' />
                    ) : (
                      <IconAbc size='1rem' />
                    )
                  }
                />
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label='Operator'
              data={operators}
              required
              value={nodeData?.conditionOperator ?? '=='}
              onChange={value => handleChange('conditionOperator', value)}
              allowDeselect={false}
              style={{ minWidth: 150 }} // Ensure select has enough width
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            {!isUnary ? (
              <Paper p='sm' withBorder radius='sm' style={{ height: '100%' }}>
                <Stack gap='xs'>
                  <Text size='xs' fw={500}>
                    Operand B (Right Side)
                  </Text>
                  <SegmentedControl
                    fullWidth
                    size='xs'
                    data={[
                      { label: 'Variable', value: 'variable' },
                      { label: 'Literal', value: 'literal' }
                    ]}
                    value={nodeData?.conditionRhsType ?? 'literal'}
                    onChange={value => handleChange('conditionRhsType', value)}
                  />
                  <TextInput
                    placeholder={
                      nodeData?.conditionRhsType === 'variable'
                        ? 'variableName'
                        : 'e.g., true, 10, "text"'
                    }
                    required
                    value={nodeData?.conditionRhsValue ?? ''}
                    onChange={e =>
                      handleChange('conditionRhsValue', e.currentTarget.value)
                    }
                    leftSection={
                      nodeData?.conditionRhsType === 'variable' ? (
                        <IconVariable size='1rem' />
                      ) : (
                        <IconAbc size='1rem' />
                      )
                    }
                  />
                </Stack>
              </Paper>
            ) : (
              <Paper
                p='sm'
                withBorder
                radius='sm'
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--mantine-color-dark-6)',
                  minHeight: 100
                }}
              >
                <Text size='xs' c='dimmed' ta='center'>
                  (Unary operator: Operand B is not applicable)
                </Text>
              </Paper>
            )}
          </Grid.Col>
        </Grid>
      </Stack>
    )
  }

  // Helper: Render Argument Editor
  const renderArgumentEditor = (
    title = 'Arguments',
    currentNodeData: typeof nodeData,
    functionParams: string[] = [],
    allowAddRemove = false
  ) => {
    const args = currentNodeData?.argumentSources || []
    const isCallFunction = currentNodeData?.id === 'callFunction'

    return (
      <Stack gap='sm' mt='md'>
        <Divider label={title} labelPosition='center' />
        {allowAddRemove && (
          <Group justify='flex-end'>
            <Button
              size='xs'
              variant='light'
              color='green'
              onClick={addArgumentInput}
              leftSection={<IconPlus size='0.9rem' />}
              radius='sm'
            >
              Add Argument
            </Button>
          </Group>
        )}
        <Paper 
          p='xs'
          style={{
            border:
              args.length > 0
                ? '1px solid var(--mantine-color-dark-4)'
                : 'none',
            borderRadius: 'var(--mantine-radius-sm)'
          }}
        >
          <ScrollArea mah={200} type='auto' style={{ overflowY: 'auto', maxHeight: '200px' }}>
            <Stack gap='xs'>
              {args.length === 0 && !isCallFunction && (
                <Text size='xs' c='dimmed' ta='center' p='xs'>
                  No arguments defined.
                </Text>
              )}
              {args.length === 0 &&
                isCallFunction &&
                functionParams.length === 0 && (
                  <Text size='xs' c='dimmed' ta='center' p='xs'>
                    Function takes no arguments.
                  </Text>
                )}
              {args.map((arg: ArgumentSource, index: number) => {
                const fieldName = `argVar_${index}`
                const error = validationErrors[fieldName]
                const paramName = isCallFunction ? functionParams[index] : null
                const argLabel = isCallFunction
                  ? `Param: ${paramName || `Arg ${index + 1}`}`
                  : `Argument ${index + 1}`

                return (
                  <Paper key={index} withBorder p='xs' radius='sm' shadow='xs'>
                    <Group wrap='nowrap' gap='sm' align='flex-end'>
                      <Stack gap={2} style={{ flexGrow: 1 }}>
                        <Text size='xs' fw={500} mb={2}>
                          {argLabel}
                          {error ? (
                            <Text span c='red' inherit>
                              {' '}
                              *{' '}
                            </Text>
                          ) : (
                            ''
                          )}
                        </Text>
                        <Group grow>
                          <Select
                            data={[
                              { value: 'literal', label: 'Literal' },
                              { value: 'variable', label: 'Variable' }
                            ]}
                            value={arg.type}
                            onChange={(newValue: string | null, _option: ComboboxItem) => {
                              if (newValue === 'literal' || newValue === 'variable') {
                                handleArgChange(index, 'type', newValue);
                              }
                            }}
                            size='xs'
                            allowDeselect={false}
                          />
                          <TextInput
                            placeholder={
                              arg.type === 'literal'
                                ? 'Literal Value'
                                : 'Variable Name'
                            }
                            value={arg.value}
                            onChange={e =>
                              handleArgChange(
                                index,
                                'value',
                                e.currentTarget.value
                              )
                            }
                            size='xs'
                            required
                            error={error}
                            leftSection={
                              arg.type === 'variable' ? (
                                <IconVariable size='1rem' />
                              ) : (
                                <IconAbc size='1rem' />
                              )
                            }
                          />
                        </Group>
                      </Stack>
                      {allowAddRemove && (
                        <Tooltip label='Remove Argument' withArrow>
                          {/* Ensure ActionIcon is wrapped for Tooltip */}
                          <span>
                            <ActionIcon
                              color='red'
                              variant='light'
                              size='sm'
                              onClick={() => removeArgumentInput(index)}
                              radius='sm'
                              style={{ marginTop: 'auto' }} // Align with bottom of text input group
                            >
                              <IconTrash size='0.9rem' />
                            </ActionIcon>
                          </span>
                        </Tooltip>
                      )}
                    </Group>
                  </Paper>
                  
                )
              })}
            </Stack>
          </ScrollArea>
        </Paper>
      </Stack>
    )
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap='xs'>
          {' '}
          {nodeData.leftSection &&
          React.isValidElement(nodeData.leftSection) ? (
            React.cloneElement(
              nodeData.leftSection as React.ReactElement<any>,
              { size: 20 }
            )
          ) : (
            <IconSettings size={20} />
          )}{' '}
          <Text fw={600}>
            {' '}
            Edit Node:{' '}
            <Text span c='blue' inherit>
              {' '}
              {nodeData.label || nodeData.id}{' '}
            </Text>{' '}
          </Text>{' '}
        </Group>
      }
      size='xl'
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: 'pop', duration: 200 }}
    >
      <Box
        mah='75vh'
        style={{
          overflowY: 'auto',
          paddingRight: 'var(--mantine-spacing-md)',
          marginRight: '-var(--mantine-spacing-md)'
        }}
      >
        <Stack gap='lg' p='xs'>
          <ValidatedTextInput
            field='label'
            nodeData={nodeData}
            onChange={handleChange}
            errors={validationErrors}
            label='Node Label (Optional)'
            placeholder={nodeInfo.node.label}
          />
          <ValidatedTextarea
            field='description'
            nodeData={nodeData}
            onChange={handleChange}
            errors={validationErrors}
            label='Node Description (Optional)'
            placeholder={nodeInfo.node.description || 'No description provided'}
            autosize
            minRows={1}
            maxRows={3}
          />
          <Divider label='Node Specific Properties' labelPosition='center' />
          {nodeData && renderNodeEditor()}
        </Stack>
      </Box>
      <Group
        justify='flex-end'
        mt='lg'
        pt='md'
        style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Button variant='default' onClick={onClose}>
          {' '}
          Cancel{' '}
        </Button>
        <Button
          onClick={handleSave}
          disabled={Object.keys(validationErrors).length > 0}
          leftSection={<IconSettings size='1rem' />}
        >
          {' '}
          Save Changes{' '}
        </Button>
      </Group>
    </Modal>
  )
}