import { PrintNode } from './nodes/PrintNode';
import { MathNode } from './nodes/MathNode';
import { VariableNode } from './nodes/VariableNode';
import { ReadVariableNode } from './nodes/ReadVariableNode';
import { ConcatenateStringsNode } from './nodes/ConcatenateStringsNode';
import { WaitNode } from './nodes/WaitNode';
import { ReturnNode } from './nodes/ReturnNode';
import { CallFunctionNode } from './nodes/CallFunctionNode';
import { IfConditionNode } from './nodes/IfConditionNode';
import { ElseNode } from './nodes/ElseNode';
import { EndIfNode } from './nodes/EndIfNode';
import { WhileConditionNode } from './nodes/WhileConditionNode';
import { EndWhileNode } from './nodes/EndWhileNode';
import { ForLoopNumericNode } from './nodes/ForLoopNumericNode';
import { EndForNode } from './nodes/EndForNode';
import { BreakNode } from './nodes/BreakNode';
import { TriggerServerEventNode } from './nodes/TriggerServerEventNode';
import { TriggerClientEventNode } from './nodes/TriggerClientEventNode';
import { ForLoopGenericNode } from './nodes/ForLoopGenericNode';
import { EndForGenericNode } from './nodes/EndForGenericNode';
import { CreateTableNode } from './nodes/CreateTableNode';
import { SetTableValueNode } from './nodes/SetTableValueNode';
import { GetTableValueNode } from './nodes/GetTableValueNode';
import { CallNativeNode } from './nodes/CallNativeNode';
import { Vector3Node } from './nodes/Vector3Node';
import { JsonNode } from './nodes/JsonNode';
import { InsertIntoTableNode } from './nodes/InsertIntoTableNode';
import { GetTableLengthNode } from './nodes/GetTableLengthNode';
import { StringFormatNode } from './nodes/StringFormatNode';
import { StringSplitNode } from './nodes/StringSplitNode';
import { TypeCheckNode } from './nodes/TypeCheckNode';
import { ToStringNode } from './nodes/ToStringNode';
import { ToNumberNode } from './nodes/ToNumberNode';
import { RegisterCommandNode } from './nodes/RegisterCommandNode';
import { StringSubstringNode } from './nodes/StringSubstringNode';
import { StringLengthNode } from './nodes/StringLengthNode';
import { StringFindNode } from './nodes/StringFindNode';
import { StringReplaceNode } from './nodes/StringReplaceNode';
import { StringCaseNode } from './nodes/StringCaseNode';
import { MathAdvancedNode } from './nodes/MathAdvancedNode';
import { TableRemoveNode } from './nodes/TableRemoveNode';
import { TableSortNode } from './nodes/TableSortNode';

// --- NEW Database Node Imports ---
import { LudbSaveGlobalNode } from './nodes/LudbSaveGlobalNode';
import { LudbRetrieveGlobalNode } from './nodes/LudbRetrieveGlobalNode';
import { LudbDeleteGlobalNode } from './nodes/LudbDeleteGlobalNode';
import { LudbSaveLocalNode } from './nodes/LudbSaveLocalNode';
import { LudbRetrieveLocalNode } from './nodes/LudbRetrieveLocalNode';
import { LudbDeleteLocalNode } from './nodes/LudbDeleteLocalNode';


export const nodeActions = [
    // Data Manipulation & Variables
    VariableNode,
    ReadVariableNode,
    CreateTableNode,
    SetTableValueNode,
    GetTableValueNode,
    InsertIntoTableNode,
    GetTableLengthNode,
    TableRemoveNode,
    TableSortNode,
    JsonNode,
    Vector3Node,

    // String Manipulation
    ConcatenateStringsNode,
    StringFormatNode,
    StringSplitNode,
    StringSubstringNode,
    StringLengthNode,
    StringFindNode,
    StringReplaceNode,
    StringCaseNode,
    ToStringNode,

    // Type & Conversion
    TypeCheckNode,
    ToNumberNode,

    // Utility & Math
    PrintNode,
    MathNode,
    MathAdvancedNode,

    // Timing / Flow Control
    WaitNode,
    IfConditionNode,
    ElseNode,
    EndIfNode,
    WhileConditionNode,
    EndWhileNode,
    ForLoopNumericNode,
    EndForNode,
    ForLoopGenericNode,
    EndForGenericNode,
    BreakNode,
    ReturnNode,

    // Function & Native Calls
    CallFunctionNode,
    CallNativeNode,        // Call FiveM Native

    // Network Events & Commands
    TriggerServerEventNode, // Client -> Server
    TriggerClientEventNode, // Server -> Client
    RegisterCommandNode,

    // --- Database (0xludb-fivem)
    LudbSaveGlobalNode,
    LudbRetrieveGlobalNode,
    LudbDeleteGlobalNode,
    LudbSaveLocalNode,
    LudbRetrieveLocalNode,
    LudbDeleteLocalNode,
];