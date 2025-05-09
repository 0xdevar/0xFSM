
import React from 'react';
import { IconDatabasePlus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbSaveGlobalNode: NodeDefinition = {
  id: 'ludbSaveGlobal',
  label: 'Ludb: Save Global',
  description: 'Saves data globally using 0xludb-fivem (ludb:saveGlobal).',
  category: 'Database',
  leftSection: <IconDatabasePlus size={30} color="#a9e34b" />, 
  allowedGraphTypes: ['file', 'function', 'event'], 
  
  keyType: 'literal', 
  keyValue: 'global/myKey',
  valueType: 'literal', 
  valueSource: '',
  
};
