

import { IconNavigationX } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const EndIfNode: NodeDefinition = {
  id: 'endIf',
  label: 'End If',
  description: 'Marks the end of an If/Else block',
  leftSection: <IconNavigationX size={40} color="#fca311" />,
  category: 'Control Flow',

  
  execute: function(context: ExecutionContext) {
    
    return undefined; 
  }
};

