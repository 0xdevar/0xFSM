
import React from 'react';
import { IconDimensions } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { isValidLuaIdentifier } from './utils/validationUtils';
import { parseLiteral } from './utils/parsingUtils';

export const Vector3Node: NodeDefinition = {
  id: 'vector3',
  label: 'Create Vector3',
  description: 'Creates a vector3 object.',
  category: 'Vector',
  leftSection: <IconDimensions size={40} />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  useVariableForX: false, xSource: '0.0',
  useVariableForY: false, ySource: '0.0',
  useVariableForZ: false, zSource: '0.0',
  resultVariable: 'myVector',

  execute: function(context: ExecutionContext) {
    const resultVarName = this.resultVariable;

    if (!isValidLuaIdentifier(resultVarName)) {
       return { action: 'vector3', status: 'error', message: `Invalid result variable name: ${resultVarName}` };
    }

    const getCoord = (useVar: boolean | undefined, source: string | undefined, coordName: string): number => {
      let val: any;
      if (useVar) {
          if (!isValidLuaIdentifier(source)) throw new Error(`Invalid variable name for ${coordName}: ${source}`);
          val = context.getVariable(source || '');
      } else {
          val = parseLiteral(source);
      }
      const num = Number(val);
      if (isNaN(num)) {
          console.warn(`Vector3Node: Invalid ${coordName} value, defaulting to 0.`);
          return 0;
      }
      return num;
    };

    try {
        const x = getCoord(this.useVariableForX, this.xSource, 'X');
        const y = getCoord(this.useVariableForY, this.ySource, 'Y');
        const z = getCoord(this.useVariableForZ, this.zSource, 'Z');

        
        const vector = { x, y, z };

        console.log(`Vector3Node: Creating vector { x: ${x}, y: ${y}, z: ${z} } in variable "${resultVarName}"`);
        context.setVariable(resultVarName!, vector);

        return {
          action: 'vector3',
          status: 'success',
          vector: vector,
          resultVariable: resultVarName,
        };
    } catch (e: any) {
         console.error(`Vector3Node: Error creating vector: `, e);
         return { action: 'vector3', status: 'error', message: `Error creating vector: ${e.message}` };
    }
  }
};