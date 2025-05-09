
import React from 'react';
import { IconDatabaseSearch } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbRetrieveLocalNode: NodeDefinition = {
  id: 'ludbRetrieveLocal',
  label: 'Ludb: Retrieve Local',
  description: 'Retrieves data locally using 0xludb-fivem (ludb:retrieve).',
  category: 'Database',
  leftSection: <IconDatabaseSearch size={30} color="#4dabf7" />,
  allowedGraphTypes: ['file', 'function', 'event'],
  
  keyType: 'literal',
  keyValue: 'local/myKey',
  resultVariable: 'retrievedLocalValue',
  defaultValue: 'nil',
  
};
