
import React from 'react';
import { IconTerminal } from '@tabler/icons-react'; 
import { NodeDefinition } from '../types/NodeDefinition';

export const RegisterCommandNode: NodeDefinition = {
  id: 'registerCommand',
  label: 'Register Command',
  description: 'Registers a chat command that executes a function graph.',
  category: 'Command', 
  leftSection: <IconTerminal size={40} color="#5c940d" />, 
  allowedGraphTypes: ['file'], 
  
  commandName: 'mycommand',
  functionName: '', 
  restricted: false,

  
  
};
