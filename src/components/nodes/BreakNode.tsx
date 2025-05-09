
import { IconArrowForwardUp } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';

export const BreakNode: NodeDefinition = {
  id: 'break',
  label: 'Break Loop',
  description: 'Exits the current innermost loop (While or For)',
  leftSection: <IconArrowForwardUp size={40} color="#f03e3e" />, 
  category: 'Control Flow',
  allowedGraphTypes: ['file', 'function', 'event'],
  
  execute: function(context: ExecutionContext) {
    console.log("BreakNode: Signaling break.");
    
    context._internal.breakLoop = true; 
    return { action: 'break' };
  }
};
