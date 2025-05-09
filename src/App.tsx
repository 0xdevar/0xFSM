import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react'
import { MantineProvider, Flex, Box } from '@mantine/core'
import { Notifications, notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { theme } from './theme'
import {
  GraphProvider,
  useGraphContext,
  ProjectSaveData,
} from './pages/UI/GraphContext' 
import { HeaderMenu } from './pages/UI/HeaderMenu'
import { LeftSidebar } from './pages/UI/LeftSidebar'
import RightSidebar from './pages/UI/RightSidebar'
import GraphEditor from './pages/UI/GraphEditor'
import CodeGenerationModal from './pages/UI/components/CodeGenerationModal'
import { saveAs } from 'file-saver'
import {
  DraggableNode,
  NodeExecutionProps
} from './components/types/NodeDefinition'

// Interfaces
export interface AppFile {
  name: string
  type: 'client' | 'server'
}

// Helper function to extract save data
function getNodeSaveData (
  node: DraggableNode
): ProjectSaveData['graphs'][string]['nodes'][number] {
  const saveData: any = { id: node.id } 
  
  // Add NEW node properties to this list
  const savableProps: Array<
    keyof (NodeExecutionProps & { label?: string; description?: string; [key: string]: any }) // More generic for unknown props
  > = [
    'label', 'description', 'message', 'color', 'printToConsole', 'useVariableForMessage', 'messageVariable',
    'name', 'value', 'varType', 'dataType', 'operation', 'value1', 'value2', 'useVariableForValue1', 'value1Variable',
    'useVariableForValue2', 'value2Variable', 'resultVariable', 'variableName', 'defaultValue',
    'string1', 'useVariableForString1', 'string1Variable', 'string2', 'useVariableForString2', 'string2Variable',
    'duration', 'useVariableForDuration', 'durationVariable', 'functionName', 'argumentSources',
    'useVariableForResult', 'returnValue', 'returnVariable', 'conditionLhsType', 'conditionLhsValue',
    'conditionOperator', 'conditionRhsType', 'conditionRhsValue', 'controlVariable', 'startValueType',
    'startValue', 'endValueType', 'endValue', 'stepValueType', 'stepValue', 'tableVariable',
    'iterationType', 'keyVariable', 'valueVariable', 'eventName', 'targetPlayer', 'useVariableForTarget',
    'keyType', 'keyValue', 'valueType', 'valueSource', 'nativeNameOrHash', 'useVariableForX', 'xSource',
    'useVariableForY', 'ySource', 'useVariableForZ', 'zSource', 'jsonOperation', 'inputVariable',
    'formatString', 'useVariableForInput', 'inputStringVariable', 'inputString', 'separator', 'limit',
    'inputValue', 'base', 'commandName', 'restricted',
    'startIndexType', 'startIndex', 'endIndexType', 'endIndex', 
    'useVariableForHaystack', 'haystackVariable', 'haystackString', 
    'useVariableForNeedle', 'needleVariable', 'needleString', 
    'plainFind', 'resultStartIndexVar', 'resultEndIndexVar', 
    'useVariableForPattern', 'patternVariable', 'patternString', 
    'useVariableForReplacement', 'replacementVariable', 'replacementString', 
    'limitType', 'resultStringVariable', 'resultCountVariable', 
    'caseType', 
    'mathOperationType', 'value1Type', 'value2Type', 
    'indexType', 'index', 'resultRemovedValueVar', 
    'sortFunctionType', 'sortFunctionVariable',
  ];

  savableProps.forEach(prop => {
    if (
      Object.prototype.hasOwnProperty.call(node, prop) &&
      node[prop] !== undefined // Only save if it has a value (not undefined)
    ) {
      // Deep copy objects to prevent issues, especially with nested structures like argumentSources
      if (typeof node[prop] === 'object' && node[prop] !== null) {
        try {
          saveData[prop] = JSON.parse(JSON.stringify(node[prop]));
        } catch (e) {
          console.warn(`Could not serialize property '${String(prop)}' for node ${node.id}. Skipping. Error: ${e}`);
          // Fallback or skip: saveData[prop] = { ...node[prop] }; // shallow copy as fallback if deep fails
        }
      } else {
        saveData[prop] = node[prop];
      }
    }
  });
  return saveData;
}

function AppContent () {
  const [selectedGraphKey, setSelectedGraphKey] = useState<string | null>(null);
  const [files, setFiles] = useState<AppFile[]>([]); // This represents the list of AppFile (client/server script files)
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveLoadWrapperRef = useRef<{ save: () => void; load: (projectData: ProjectSaveData) => void; }>(null);
  
  const { 
    addFileGraph, 
    deleteGraph, 
    loadGraphs,
    isDirty,         // <<< FROM GraphContext
    clearDirtyFlag   // <<< FROM GraphContext
  } = useGraphContext();

  // Effect to handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        console.log("beforeunload: Dirty state detected, prompting user.");
        event.preventDefault(); // Necessary for modern browsers
        event.returnValue = ''; // Required for older browsers, triggers generic browser prompt
        return ''; // Explicitly returning a string for good measure
      }
      // If not dirty, allow unload without prompt
      console.log("beforeunload: Clean state, allowing unload.");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]); // Re-run effect if isDirty status changes

  const handleAddFile = useCallback( (fileToAdd: AppFile) => {
    const alreadyExists = files.some( f => f.name.toLowerCase() === fileToAdd.name.toLowerCase() && f.type === fileToAdd.type );
    if (alreadyExists) {
      notifications.show({ title: 'File Exists', message: `File "${fileToAdd.name}.lua" (${fileToAdd.type}) already exists.`, color: 'yellow', autoClose: 3500 });
      return;
    }
    
    const fileKey = `${fileToAdd.type}/${fileToAdd.name}`;
    const success = addFileGraph(fileKey, fileToAdd.type); // This should set isDirty in GraphContext
    
    if (success) {
      const newFiles = [...files, fileToAdd];
      setFiles(newFiles); // Update App's local list of files
      setSelectedGraphKey(fileKey);
      notifications.show({ title: 'File Created', message: `Created ${fileToAdd.type}/${fileToAdd.name}.lua`, color: 'green', autoClose: 2500 });
    } else {
      // This case should ideally be caught by `alreadyExists` or GraphContext returning false
      notifications.show({ title: 'Error', message: `Could not create file "${fileToAdd.name}.lua". It might already exist in the graph data.`, color: 'red', autoClose: 3500 });
    }
  }, [files, addFileGraph] );

  const handleDeleteFile = useCallback( (fileToDelete: AppFile) => {
    const fileKey = `${fileToDelete.type}/${fileToDelete.name}`;
    try {
      deleteGraph(fileKey); // This should set isDirty in GraphContext
      setFiles(prev => prev.filter( f => !(f.name === fileToDelete.name && f.type === fileToDelete.type) ));
      if (selectedGraphKey === fileKey) {
        setSelectedGraphKey(null);
      }
      // Notification for successful deletion is handled in RightSidebar after modals.confirm
    } catch (error) {
      console.error( `App: Error during handleDeleteFile for key ${fileKey}:`, error );
      notifications.show({ title: 'Deletion Error', message: `An error occurred while deleting "${fileToDelete.name}.lua".`, color: 'red' });
    }
  }, [selectedGraphKey, deleteGraph] );

  const handleSelectGraph = useCallback((key: string | null) => {
    setSelectedGraphKey(key);
  }, []);

  const openGenerationModal = useCallback( () => setIsGenerationModalOpen(true), [] );
  const closeGenerationModal = useCallback( () => setIsGenerationModalOpen(false), [] );
  
  const triggerSaveProject = useCallback( () => {
    saveLoadWrapperRef.current?.save();
    // onSaveSuccess (which calls clearDirtyFlag) is handled by SaveLoadWrapper
  }, [] );

  const handleLoadProjectClick = useCallback( () => {
    if (isDirty) {
        if (!window.confirm("You have unsaved changes. Are you sure you want to load a new project? Your current changes will be lost.")) {
            return; 
        }
    }
    fileInputRef.current?.click()
  }, [isDirty] ); 

  const handleFileSelectedForLoad = useCallback( (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Failed to read file.');
        const loadedProjectData: ProjectSaveData = JSON.parse(text);
        if ( !loadedProjectData?.projectMetadata || !Array.isArray(loadedProjectData.files) || typeof loadedProjectData.graphs !== 'object' ) {
          throw new Error('Invalid project file structure.');
        }
        
        // loadGraphs in GraphContext should clear the dirty flag
        const loadResult = loadGraphs(loadedProjectData); 
        
        if (loadResult.success && loadResult.loadedFiles) {
          setFiles(loadResult.loadedFiles); // Update App's file list
          setSelectedGraphKey(null);
          notifications.show({ title: 'Project Loaded', message: `Successfully loaded project "${file.name}".`, color: 'green', autoClose: 3500 });
        } else {
          console.error( 'App: Failed to load graphs from project file.', loadResult.message );
          notifications.show({ title: 'Load Error', message: loadResult.message || 'Failed to load project graphs.', color: 'red', autoClose: 5000 });
        }
      } catch (error: any) {
        console.error('App: Error loading or parsing project file:', error);
        notifications.show({ title: 'Load Error', message: `Failed to load project: ${error.message}`, color: 'red', autoClose: 5000 });
      } finally {
        if (event.target) event.target.value = '' 
      }
    };
    reader.onerror = () => {
      notifications.show({ title: 'File Read Error', message: 'Could not read the selected file.', color: 'red', autoClose: 5000 });
    };
    reader.readAsText(file);
  }, [loadGraphs] ); 

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <HeaderMenu onGenerateClick={openGenerationModal} onSaveClick={triggerSaveProject} onLoadClick={handleLoadProjectClick} />
      <input type='file' ref={fileInputRef} style={{ display: 'none' }} accept='.json,.fsm,application/json' onChange={handleFileSelectedForLoad} />
      <Flex style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box style={{ width: 250, flexShrink: 0, borderRight: '1px solid var(--mantine-color-dark-4)' }}>
          <LeftSidebar selectedGraphKey={selectedGraphKey} onSelectGraph={handleSelectGraph} />
        </Box>
        <Box style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <GraphEditor selectedGraphKey={selectedGraphKey} />
        </Box>
        <Box style={{ width: 300, flexShrink: 0, borderLeft: '1px solid var(--mantine-color-dark-4)' }}>
          <RightSidebar files={files} selectedGraphKey={selectedGraphKey} onSelectGraph={handleSelectGraph} onAddFile={handleAddFile} onDeleteFile={handleDeleteFile} />
        </Box>
      </Flex>
      <GenerationModalWrapper opened={isGenerationModalOpen} onClose={closeGenerationModal} appFiles={files} />
      <SaveLoadWrapper ref={saveLoadWrapperRef} appFiles={files} onSaveSuccess={clearDirtyFlag} />
    </Box>
  );
}

export default function App () {
  return (
    <MantineProvider theme={theme} defaultColorScheme='dark'>
      <Notifications position='bottom-right' zIndex={1000} />
      <ModalsProvider>
        <GraphProvider>
          <AppContent />
        </GraphProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}

function GenerationModalWrapper ({ opened, onClose, appFiles }: { opened: boolean; onClose: () => void; appFiles: AppFile[] }) {
  const { graphs } = useGraphContext();
  if (!opened) return null;
  return ( <CodeGenerationModal opened={opened} onClose={onClose} graphsData={graphs || {}} filesData={appFiles} /> );
}

const SaveLoadWrapper = forwardRef<
  { save: () => void; load: (projectData: ProjectSaveData) => void },
  { appFiles: AppFile[]; onSaveSuccess: () => void }
>(({ appFiles, onSaveSuccess }, ref) => {
  const { graphs, loadGraphs: contextLoadGraphs } = useGraphContext(); 

  useImperativeHandle( ref, () => ({
    save: () => {
      if (!graphs || !appFiles) {
        notifications.show({ title: 'Save Error', message: 'Missing graph or file data.', color: 'red' });
        return;
      }
      try {
        const graphsToSave: ProjectSaveData['graphs'] = {};
        for (const graphKey in graphs) {
          if (Object.prototype.hasOwnProperty.call(graphs, graphKey)) {
            const gd = graphs[graphKey];
            if (gd) { 
              graphsToSave[graphKey] = {
                nodes: gd.nodes ? gd.nodes.map(n => getNodeSaveData(n)) : [], 
                ...(gd.parameters !== undefined && { parameters: gd.parameters }),
                ...(gd.argumentNames !== undefined && { argumentNames: gd.argumentNames }),
                ...(gd.scope !== undefined && { scope: gd.scope })
              };
            }
          }
        }
        const saveData: ProjectSaveData = {
          projectMetadata: { savedAt: new Date().toISOString(), appName: '0xFSM', appVersion: '1.0.0' },
          files: [...appFiles],
          graphs: graphsToSave
        };
        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        saveAs(blob, `0xfsm-project-${timestamp}.fsm.json`);
        notifications.show({ title: 'Project Saved', message: 'Project saved successfully.', color: 'blue', autoClose: 3000 });
        onSaveSuccess();
      } catch (error: any) {
        notifications.show({ title: 'Save Error', message: `Failed to save: ${error.message}`, color: 'red', autoClose: 5000 });
      }
    },
    load: (loadedProjectData: ProjectSaveData) => {
      if (typeof contextLoadGraphs === 'function') {
        const result = contextLoadGraphs(loadedProjectData);
        if (result.success) {
            notifications.show({ title: 'Project Data Processed', message: `Project data processed by SaveLoadWrapper.`, color: 'green', autoClose: 3000 });
        } else {
            notifications.show({ title: 'Load Error', message: result.message || 'Failed to process project data via SaveLoadWrapper.', color: 'red', autoClose: 5000 });
        }
      } else {
        console.error( 'SaveLoadWrapper: contextLoadGraphs function unavailable.' );
      }
    }
  }), [graphs, appFiles, contextLoadGraphs, onSaveSuccess] ); 
  return null;
});