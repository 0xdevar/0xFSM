
import { IconDeviceLaptop } from '@tabler/icons-react';
import { NodeDefinition, ArgumentSource } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { parseLiteral } from './utils/parsingUtils'; 

export const TriggerClientEventNode: NodeDefinition = {
  id: 'triggerClientEvent',
  label: 'Trigger Client Event',
  description: 'Sends a network event to one or more clients',
  leftSection: <IconDeviceLaptop size={40} color="#fcc419" />,
  category: 'Network',
  allowedGraphTypes: ['file', 'function', 'event'], 
  
  eventName: 'myClientEvent',
  targetPlayer: '-1', 
  useVariableForTarget: false,
  argumentSources: [],

  
  execute: function(context: ExecutionContext): { action: string, eventName: string, target: any, args: any[] } | undefined {
     if (!this.eventName) {
        console.error("TriggerClientEventNode: Event name is missing.");
        context.addResult({ node: this.label, status: 'error', message: 'Event name is missing' });
        return undefined;
    }

    let target: number | string;
     if (this.useVariableForTarget && this.targetPlayer) {
        target = context.getVariable(this.targetPlayer, -1); 
        
        if (typeof target === 'string') target = parseInt(target, 10) || -1;
     } else {
        target = parseInt(this.targetPlayer || '-1', 10); 
         if (isNaN(target)) target = -1; 
     }


      const argsToSend: any[] = (this.argumentSources || []).map((argSource: ArgumentSource) => {
        if (argSource.type === 'variable') {
             if (typeof argSource.value !== 'string') {
                 console.warn(`TriggerClientEventNode: Expected string variable name for argument, but got ${typeof argSource.value}. Using 'undefined'.`);
                 return undefined;
             }
             return context.getVariable(argSource.value);
        }
        return parseLiteral(argSource.value);
     });

    console.log(`TriggerClientEventNode: Simulating trigger '${this.eventName}' for target ${target} with args:`, argsToSend);
    context.addResult({ node: this.label, action: 'triggerClientEvent', eventName: this.eventName, target, args: argsToSend });

    return {
        action: 'triggerClientEvent',
        eventName: this.eventName,
        target: target,
        args: argsToSend
    };
  }
};
