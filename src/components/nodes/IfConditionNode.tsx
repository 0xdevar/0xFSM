

import { IconGitBranch } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';


function parseIfLiteral(literalString: string): any {
    const trimmed = literalString.trim();
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    if (trimmed.toLowerCase() === 'nil' || trimmed.toLowerCase() === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        try { return JSON.parse(trimmed); } catch (e) { return trimmed.slice(1, -1); }
    }
    return literalString; 
}

export const IfConditionNode: NodeDefinition = {
  id: 'ifCondition',
  label: 'If Condition',
  description: 'Executes next block only if condition is true',
  leftSection: <IconGitBranch size={40} color="#fca311" />,
  category: 'Control Flow',
  
  conditionLhsType: 'variable',
  conditionLhsValue: '',
  conditionOperator: '==',
  conditionRhsType: 'literal',
  conditionRhsValue: 'true',

  execute: function(context: ExecutionContext): boolean { 
    let lhs: any;
    let rhs: any;

    
    if (this.conditionLhsType === 'variable') {
      lhs = context.getVariable(this.conditionLhsValue || '');
    } else {
      lhs = parseIfLiteral(this.conditionLhsValue || '');
    }

    const operator = this.conditionOperator || '==';

    
    switch (operator) {
        case 'is true':
            return !!lhs; 
        case 'is false':
            
            return lhs === false || lhs === 0 || lhs === '' || lhs == null;
        case 'is nil':
            return lhs == null; 
        case 'is not nil':
            return lhs != null;
    }

    
    if (this.conditionRhsType === 'variable') {
      rhs = context.getVariable(this.conditionRhsValue || '');
    } else {
      rhs = parseIfLiteral(this.conditionRhsValue || '');
    }

    
    console.log(`IfCondition: Comparing LHS (${typeof lhs})`, lhs, ` ${operator} RHS (${typeof rhs})`, rhs);
    try {
        switch (operator) {
        case '==': 
            return lhs === rhs;
        case '~=': 
            return lhs !== rhs;
        
        case '>':
            return Number(lhs) > Number(rhs);
        case '<':
            return Number(lhs) < Number(rhs);
        case '>=':
            return Number(lhs) >= Number(rhs);
        case '<=':
            return Number(lhs) <= Number(rhs);
        default:
            console.warn(`IfConditionNode: Unknown operator "${operator}". Returning false.`);
            return false;
        }
    } catch (e) {
        console.error("IfConditionNode: Error during comparison:", e);
        return false;
    }
  }
};

