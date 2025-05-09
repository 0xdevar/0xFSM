
import { IconRepeatOff } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const EndWhileNode: NodeDefinition = {
  id: 'endWhile',
  label: 'End While',
  description: 'Marks the end of a While loop block',
  leftSection: <IconRepeatOff size={40} color="#ff922b" />,
  category: 'Control Flow',
  allowedGraphTypes: ['file', 'function', 'event'],
  
  execute: function(context: ExecutionContext) {
    return undefined;
  }
};
