
import React from 'react';
import { IconTablePlus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils'; 

export const CreateTableNode: NodeDefinition = {
  id: 'createTable',
  label: 'Create Table',
  description: 'Initializes an empty Lua table (like {}).',
  category: 'Data',
  leftSection: <IconTablePlus size={40} />,
  
  allowedGraphTypes: ['file', 'function', 'event'],
  varType: 'local', 
  variableName: 'newTable',

  execute: function(context: ExecutionContext) {
    const varName = this.variableName;

    if (!isValidLuaIdentifier(varName)) {
       console.error(`CreateTableNode: Invalid variable name "${varName}".`);
       
       return { action: 'createTable', status: 'error', variableName: varName, message: 'Invalid variable name' };
    }

    console.log(`CreateTableNode: Creating empty table in variable "${varName}"`);
    context.setVariable(varName!, {}); 

    return {
      action: 'createTable',
      status: 'success',
      variableName: varName,
    };
  }
};