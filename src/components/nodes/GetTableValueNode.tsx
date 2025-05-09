
import React from 'react';
import { IconTableImport } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const GetTableValueNode: NodeDefinition = {
  id: 'getTableValue',
  label: 'Get Table Value',
  description: 'Retrieves a value from a specific key in a table.',
  category: 'Data',
  leftSection: <IconTableImport size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  keyType: 'literal', 
  keyValue: 'myKey', 
  resultVariable: 'tableValue',
  defaultValue: '', 

  execute: function(context: ExecutionContext) {
    const tableVarName = this.tableVariable;
    const keyType = this.keyType || 'literal';
    const keyValue = this.keyValue;
    const resultVarName = this.resultVariable;
    const defaultValueLiteral = this.defaultValue;

    if (!isValidLuaIdentifier(tableVarName)) {
       return { action: 'getTableValue', status: 'error', message: `Invalid table variable name: ${tableVarName}` };
    }
    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'getTableValue', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    const table = context.getVariable(tableVarName || '');
    const defaultValueParsed = parseLiteral(defaultValueLiteral); 

    let valueFound: any = defaultValueParsed; 
    let keyUsed: string | number | undefined = undefined;
    let status = 'success';
    let message = '';

    if (typeof table !== 'object' || table === null) {
        console.warn(`GetTableValueNode: Variable "${tableVarName}" is not an object/table. Returning default.`);
        status = 'warning';
        message = `Variable "${tableVarName}" is not a table. Used default value.`;
    } else {
        
        try {
            if (keyType === 'variable') {
                if (!isValidLuaIdentifier(keyValue)) { throw new Error(`Invalid key variable name: ${keyValue}`); }
                keyUsed = context.getVariable(keyValue || '');
                if (typeof keyUsed !== 'string' && typeof keyUsed !== 'number') keyUsed = String(keyUsed);
            } else if (keyType === 'number_literal') {
                keyUsed = Number(keyValue);
                if (isNaN(keyUsed)) throw new Error(`Invalid number literal key: "${keyValue}"`);
            } else { 
                keyUsed = String(keyValue || '');
            }

            
            if (Object.prototype.hasOwnProperty.call(table, keyUsed)) {
                valueFound = table[keyUsed];
                console.log(`GetTableValueNode: Found value for key "${keyUsed}" in "${tableVarName}":`, valueFound);
            } else {
                console.log(`GetTableValueNode: Key "${keyUsed}" not found in "${tableVarName}". Using default.`);
                 message = `Key "${keyUsed}" not found. Used default value.`;
                status = 'warning_not_found'; 
            }
        } catch (e: any) {
            console.error(`GetTableValueNode: Error processing key or accessing table: `, e);
            status = 'error';
            message = `Error getting value: ${e.message}`;
            valueFound = defaultValueParsed; 
        }
    }

    context.setVariable(resultVarName!, valueFound); 

    return {
      action: 'getTableValue',
      status: status,
      message: message,
      table: tableVarName,
      keyUsed: keyUsed,
      valueFound: valueFound,
      resultVariable: resultVarName,
    };
  }
};