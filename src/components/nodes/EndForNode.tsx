
import { IconArrowUpSquare } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const EndForNode: NodeDefinition = {
  id: 'endFor',
  label: 'End For',
  description: 'Marks the end of a For loop block',
  leftSection: <IconArrowUpSquare size={40} color="#ff922b" />,
  category: 'Control Flow',
  allowedGraphTypes: ['file', 'function', 'event'],
  
  execute: function(context: ExecutionContext) {
    return undefined;
  }
};
