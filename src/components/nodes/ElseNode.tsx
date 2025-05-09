

import { IconAB2 } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const ElseNode: NodeDefinition = {
  id: 'elseCondition', 
  label: 'Else',
  description: 'Marks the start of the block if the preceding "If" was false',
  leftSection: <IconAB2 size={40} color="#fca311" />,
  category: 'Control Flow',

  
  execute: function(context: ExecutionContext) {
    
    return undefined; 
  }
};

