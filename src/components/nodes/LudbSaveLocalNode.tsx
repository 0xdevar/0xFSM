
import React from 'react';
import { IconDatabasePlus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbSaveLocalNode: NodeDefinition = {
  id: 'ludbSaveLocal',
  label: 'Ludb: Save Local',
  description: 'Saves data locally using 0xludb-fivem (ludb:save).',
  category: 'Database',
  leftSection: <IconDatabasePlus size={30} color="#4dabf7" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  keyType: 'literal',
  keyValue: 'local/myKey',
  valueType: 'literal',
  valueSource: '',
  
};
