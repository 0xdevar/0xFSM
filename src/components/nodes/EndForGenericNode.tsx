
import { IconCodeCircle } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const EndForGenericNode: NodeDefinition = {
  id: 'endForGeneric',
  label: 'End For (Generic)',
  description: 'Marks the end of a Generic For loop (pairs/ipairs)',
  leftSection: <IconCodeCircle size={40} color="#ff922b" />,
  category: 'Control Flow',
  allowedGraphTypes: ['file', 'function', 'event'],
  
  execute: function(context: ExecutionContext) {
    return undefined;
  }
};
