
import { IconServerBolt } from '@tabler/icons-react';
import { NodeDefinition, ArgumentSource } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { parseLiteral } from './utils/parsingUtils'; 

export const TriggerServerEventNode: NodeDefinition = {
  id: 'triggerServerEvent',
  label: 'Trigger Server Event',
  description: 'Sends a network event to the server',
  leftSection: <IconServerBolt size={40} color="#fcc419" />, 
  category: 'Network',
  allowedGraphTypes: ['file', 'function', 'event'], 
  
  eventName: 'myServerEvent',
  argumentSources: [],

  
  execute: function(context: ExecutionContext): { action: string, eventName: string, args: any[] } | undefined {
    if (!this.eventName) {
        console.error("TriggerServerEventNode: Event name is missing.");
        context.addResult({ node: this.label, status: 'error', message: 'Event name is missing' });
        return undefined;
    }

    const argsToSend: any[] = (this.argumentSources || []).map((argSource: ArgumentSource) => {

        if (argSource.type === 'variable') { 
             if (typeof argSource.value !== 'string') {
                 console.warn(`TriggerServerEventNode: Expected string variable name for argument, but got ${typeof argSource.value}. Using 'undefined'.`);
                 return undefined;
             }
             return context.getVariable(argSource.value);
        }
        return parseLiteral(argSource.value); 
     });
 
     console.log(`TriggerServerEventNode: Simulating trigger '${this.eventName}' with args:`, argsToSend);

    console.log(`TriggerServerEventNode: Simulating trigger '${this.eventName}' with args:`, argsToSend);
    context.addResult({ node: this.label, action: 'triggerServerEvent', eventName: this.eventName, args: argsToSend });

    return { 
        action: 'triggerServerEvent',
        eventName: this.eventName,
        args: argsToSend
    };
  }
};
