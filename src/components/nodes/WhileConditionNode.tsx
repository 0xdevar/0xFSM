import { IconRepeat } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { parseIfLiteral } from './utils/parsingUtils';

export const WhileConditionNode: NodeDefinition = {
  id: 'whileCondition',
  label: 'While Loop',
  description: 'Repeats the following block as long as the condition is true',
  leftSection: <IconRepeat size={40} color="#ff922b" />,
  category: 'Control Flow',
  conditionLhsType: 'variable',
  conditionLhsValue: '',
  conditionOperator: '==',
  conditionRhsType: 'literal',
  conditionRhsValue: 'true',
  allowedGraphTypes: ['file', 'function', 'event'],

  
  execute: function(context: ExecutionContext): boolean {
    let lhs: any;
    let rhs: any;

    if (this.conditionLhsType === 'variable') lhs = context.getVariable(this.conditionLhsValue || '');
    else lhs = parseIfLiteral(this.conditionLhsValue || '');

    const operator = this.conditionOperator || '==';

    
    switch (operator) {
        case 'is true': return !!lhs;
        case 'is false': return lhs === false || lhs === 0 || lhs === '' || lhs == null;
        case 'is nil': return lhs == null;
        case 'is not nil': return lhs != null;
    }

    
    if (this.conditionRhsType === 'variable') rhs = context.getVariable(this.conditionRhsValue || '');
    else rhs = parseIfLiteral(this.conditionRhsValue || '');

    
    
    try {
        switch (operator) {
            case '==': return lhs === rhs;
            case '~=': return lhs !== rhs;
            case '>': return Number(lhs) > Number(rhs);
            case '<': return Number(lhs) < Number(rhs);
            case '>=': return Number(lhs) >= Number(rhs);
            case '<=': return Number(lhs) <= Number(rhs);
            default: return false;
        }
    } catch (e) {
        console.error("WhileConditionNode: Error during comparison:", e);
        return false;
    }
  }
};