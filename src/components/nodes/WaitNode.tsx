import { IconClockHour4 } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor'; 

export const WaitNode: NodeDefinition = {
  id: 'wait',
  label: 'Wait (ms)',
  description: 'Simulates Wait() - Pauses execution (in Lua)',
  leftSection: <IconClockHour4 size={40} />,
  category: 'Timing', 
  
  duration: 1000, 
  useVariableForDuration: false,
  durationVariable: '',
  onAdd: () => {
    console.log('Wait node added');
  },
  execute: function(context: ExecutionContext) {
    
    let waitDuration: number;
    if (this.useVariableForDuration && this.durationVariable) {
      waitDuration = Number(context.getVariable(this.durationVariable, 0));
      console.log(`WaitNode: Using variable "${this.durationVariable}" for duration.`);
    } else {
      waitDuration = Number(this.duration);
       console.log(`WaitNode: Using literal duration.`);
    }

    
     if (isNaN(waitDuration) || waitDuration < 0) {
        console.warn(`WaitNode: Invalid duration "${this.useVariableForDuration ? this.durationVariable : this.duration}". Using 0ms.`);
        waitDuration = 0;
    }

    
    
    
    console.log(`WaitNode: Simulating Citizen.Wait(${waitDuration})`);

    
    return {
      action: 'wait',
      duration: waitDuration,
      source: this.useVariableForDuration ? `variable(${this.durationVariable})` : 'literal'
    };
    
    
  }
};
