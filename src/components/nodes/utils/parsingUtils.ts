export function parseLiteral(literalString: any): any { 
    
    if (literalString === null || literalString === undefined) return null;
    if (typeof literalString === 'boolean') return literalString;
    if (typeof literalString === 'number' && !isNaN(literalString)) return literalString;

    
    const trimmed = String(literalString).trim();

    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    if (trimmed.toLowerCase() === 'nil' || trimmed.toLowerCase() === 'null') return null;
    if (trimmed === '') return ''; 

    
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
         
         return Number(trimmed);
    }

    
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        const inner = trimmed.slice(1, -1);
        
        try {
             
             if ((inner.startsWith('{') && inner.endsWith('}')) || (inner.startsWith('[') && inner.endsWith(']'))) {
                 return JSON.parse(inner);
             }
         } catch (e) {  }
        return inner; 
    }

    
    return trimmed;
}

export const parseIfLiteral = parseLiteral;