

import React from 'react';
import { IconRulerMeasure } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';

export const GetTableLengthNode: NodeDefinition = {
  id: 'getTableLength',
  label: 'Get Table Length',
  description: 'Gets the length of a table/array (like #table).',
  category: 'Data',
  leftSection: <IconRulerMeasure size={40} color="#a5d8ff" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  tableVariable: 'myTable',
  resultVariable: 'tableLength',

  execute: function(context: ExecutionContext) {
    const tableVarName = this.tableVariable;
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(tableVarName)) {
       return { action: 'getTableLength', status: 'error', message: `Invalid table variable name: ${tableVarName}` };
    }
    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'getTableLength', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    const table = context.getVariable(tableVarName || '');
    let length = 0; 
    let status = 'success';
    let message = '';

    if (Array.isArray(table)) {
        
        length = table.length;
        console.log(`GetTableLengthNode: Length of array "${tableVarName}" is ${length}`);
    } else if (typeof table === 'object' && table !== null) {
        
        
        
        length = Object.keys(table).length;
        status = 'warning_simulation';
        message = `Variable "${tableVarName}" is an object, not an array. Simulated length (${length}) by counting keys. This differs from Lua's '#' operator for non-sequential tables.`;
        console.warn(`GetTableLengthNode: ${message}`);
    } else {
         status = 'warning_type';
         message = `Variable "${tableVarName}" is not an array or object. Length is 0.`;
         console.warn(`GetTableLengthNode: Variable "${tableVarName}" is not an array/object. Returning length 0.`);
    }

    context.setVariable(resultVarName!, length); 

    return {
      action: 'getTableLength',
      status: status,
      message: message,
      table: tableVarName,
      length: length,
      resultVariable: resultVarName,
    };
  }
};
