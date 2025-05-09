import React from 'react';
import { ExecutionContext } from '../WorkflowExecutor';

// Base node definition (visual properties)
export interface BaseNodeDefinition {
  id: string;
  label: string;
  description: string;
  category: string;
  leftSection?: React.ReactNode;
  allowedGraphTypes?: Array<'file' | 'function' | 'event'>; 
}

export interface ArgumentSource {
  type: 'variable' | 'literal';
  value: string; 
}

export interface NodeExecutionProps {
  resultVariable?: string;
  variableName?: string;
  value?: any;

  message?: string; color?: string; printToConsole?: boolean; useVariableForMessage?: boolean; messageVariable?: string;
  name?: string; dataType?: 'string' | 'number' | 'boolean' | 'nil' | 'variable'; varType?: 'local' | 'global';
  operation?: 'add' | 'subtract' | 'multiply' | 'divide'; value1?: number | string; value2?: number | string; useVariableForValue1?: boolean; value1Variable?: string; useVariableForValue2?: boolean; value2Variable?: string;
  string1?: string; useVariableForString1?: boolean; string1Variable?: string; string2?: string; useVariableForString2?: boolean; string2Variable?: string;
  duration?: number; useVariableForDuration?: boolean; durationVariable?: string;
  commandName?: string; functionName?: string; restricted?: boolean;
  argumentSources?: ArgumentSource[];
  useVariableForResult?: boolean; returnValue?: any; returnVariable?: string;
  conditionLhsType?: 'variable' | 'literal'; conditionLhsValue?: string; conditionOperator?: string; conditionRhsType?: 'variable' | 'literal'; conditionRhsValue?: string;
  controlVariable?: string; startValueType?: 'literal' | 'variable'; startValue?: string; endValueType?: 'literal' | 'variable'; endValue?: string; stepValueType?: 'literal' | 'variable'; stepValue?: string;
  tableVariable?: string; iterationType?: 'pairs' | 'ipairs'; keyVariable?: string; valueVariable?: string;
  eventName?: string; targetPlayer?: string; useVariableForTarget?: boolean;

  // --- Table Node Properties ---
  keyType?: 'literal' | 'variable' | 'number_literal'; keyValue?: string; valueType?: 'literal' | 'variable'; valueSource?: string;

  // --- Call Native Properties ---
  nativeNameOrHash?: string;

  // --- Vector3 Properties ---
  useVariableForX?: boolean; xSource?: string; useVariableForY?: boolean; ySource?: string; useVariableForZ?: boolean; zSource?: string;

  // --- JSON Properties ---
  jsonOperation?: 'encode' | 'decode'; inputVariable?: string;


  formatString?: string;

  useVariableForInput?: boolean; inputStringVariable?: string; inputString?: string; separator?: string; limit?: string;

  inputValue?: string;

  base?: string;

  startIndexType?: 'literal' | 'variable'; startIndex?: string;
  endIndexType?: 'literal' | 'variable'; endIndex?: string;

  useVariableForHaystack?: boolean; haystackVariable?: string; haystackString?: string;
  useVariableForNeedle?: boolean; needleVariable?: string; needleString?: string;
  plainFind?: boolean;
  resultStartIndexVar?: string;
  resultEndIndexVar?: string;
  useVariableForPattern?: boolean; patternVariable?: string; patternString?: string;
  useVariableForReplacement?: boolean; replacementVariable?: string; replacementString?: string;
  limitType?: 'literal' | 'variable';
  resultCountVariable?: string; 
  caseType?: 'lower' | 'upper';

  mathOperationType?: 'random' | 'floor' | 'ceil' | 'abs' | 'pow' | 'sqrt' | 'min' | 'max';

  indexType?: 'literal' | 'variable';
  index?: string;
  resultRemovedValueVar?: string;
  
  sortFunctionType?: 'none' | 'customVariable';
  sortFunctionVariable?: string;

  // Executor function
  execute?: (context: ExecutionContext) => any;
  // Allow any other properties potentially added by specific nodes (use with caution)
  [key: string]: any;
}

// Combine Base and Execution properties
export type NodeDefinition = BaseNodeDefinition & NodeExecutionProps;

// Represents a node instance in the graph editor list
export interface DraggableNode extends NodeDefinition {
  runtimeId: string; // Unique ID for this specific instance in the list
}