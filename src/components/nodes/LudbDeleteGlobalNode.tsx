
import React from 'react';
import { IconDatabaseMinus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbDeleteGlobalNode: NodeDefinition = {
  id: 'ludbDeleteGlobal',
  label: 'Ludb: Delete Global',
  description: 'Deletes data globally using 0xludb-fivem (ludb:deleteGlobal).',
  category: 'Database',
  leftSection: <IconDatabaseMinus size={30} color="#a9e34b" />, 
  allowedGraphTypes: ['file', 'function', 'event'], 
  
  keyType: 'literal',
  keyValue: 'global/myKeyToDelete',
  
};
