
import React from 'react';
import { IconDatabaseSearch } from '@tabler/icons-react';
import { NodeDefinition } from '../types/NodeDefinition';

export const LudbRetrieveGlobalNode: NodeDefinition = {
  id: 'ludbRetrieveGlobal',
  label: 'Ludb: Retrieve Global',
  description: 'Retrieves data globally using 0xludb-fivem (ludb:retrieveGlobal).',
  category: 'Database',
  leftSection: <IconDatabaseSearch size={30} color="#a9e34b" />, 
  allowedGraphTypes: ['file', 'function', 'event'],
  
  keyType: 'literal',
  keyValue: 'global/myKey',
  resultVariable: 'retrievedGlobalValue',
  defaultValue: 'nil', 
  
};
