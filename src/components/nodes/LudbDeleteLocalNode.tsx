
import React from 'react';
import { IconDatabaseMinus } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbDeleteLocalNode: NodeDefinition = {
  id: 'ludbDeleteLocal',
  label: 'Ludb: Delete Local',
  description: 'Deletes data locally using 0xludb-fivem (ludb:delete).',
  category: 'Database',
  leftSection: <IconDatabaseMinus size={30} color="#4dabf7" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  keyType: 'literal',
  keyValue: 'local/myKeyToDelete',
  
};
