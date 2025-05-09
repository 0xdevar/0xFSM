
import { IconHash } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';
import { ExecutionContext } from '../WorkflowExecutor';
import { parseIfLiteral } from './utils/parsingUtils'; 

export const ForLoopNumericNode: NodeDefinition = {
  id: 'forLoopNumeric',
  label: 'For Loop (Numeric)',
  description: 'Repeats block with a numeric counter (e.g., for i = 1, 10, 1 do)',
  leftSection: <IconHash size={40} color="#ff922b" />,
  category: 'Control Flow',
  
  controlVariable: 'i',
  startValueType: 'literal',
  startValue: '1',
  endValueType: 'literal',
  endValue: '10',
  stepValueType: 'literal',
  stepValue: '1', 
  allowedGraphTypes: ['file', 'function', 'event'],

  
  
  execute: function(context: ExecutionContext): { shouldEnterLoop: boolean, loopParams?: any } {
    const controlVar = this.controlVariable || 'i'; 

    
    let startVal: number;
    let endVal: number;
    let stepVal: number;

    try {
        startVal = Number( this.startValueType === 'variable'
            ? context.getVariable(this.startValue || '', 0)
            : parseIfLiteral(this.startValue || '0') );

        endVal = Number( this.endValueType === 'variable'
            ? context.getVariable(this.endValue || '', 0)
            : parseIfLiteral(this.endValue || '0') );

        stepVal = Number( this.stepValueType === 'variable'
            ? context.getVariable(this.stepValue || '', 1) 
            : parseIfLiteral(this.stepValue || '1') ); 

        
        if (isNaN(startVal)) throw new Error(`Invalid start value`);
        if (isNaN(endVal)) throw new Error(`Invalid end value`);
        if (isNaN(stepVal)) throw new Error(`Invalid step value`);
        if (stepVal === 0) throw new Error(`Step value cannot be zero`);

    } catch (e: any) {
        console.error(`ForLoopNumericNode Error: ${e.message}`);
        context.addResult({ node: this.label, status: 'error', message: `Failed to evaluate loop parameters: ${e.message}` });
        return { shouldEnterLoop: false }; 
    }

    
    
    const shouldEnterLoop = (stepVal > 0) ? (startVal <= endVal) : (startVal >= endVal);

    
    if (shouldEnterLoop) {
        context.setVariable(controlVar, startVal); 
        
        return {
             shouldEnterLoop: true,
             loopParams: { controlVar, current: startVal, end: endVal, step: stepVal }
        };
    } else {
        
        return { shouldEnterLoop: false }; 
    }
  }
};
