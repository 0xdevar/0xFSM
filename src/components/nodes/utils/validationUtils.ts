export const isValidLuaIdentifier = (name: string | undefined | null): boolean => {
    if (!name || typeof name !== 'string') return false;
    
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name.trim());
};

export const isValidNativeHash = (hash: string | undefined | null): boolean => {
     if (!hash || typeof hash !== 'string') return false;
     return /^0x[a-fA-F0-9]+$/.test(hash.trim());
}

export const isValidNativeName = (name: string | undefined | null): boolean => {
    if (!name || typeof name !== 'string') return false;
     
     return /^[a-zA-Z0-9_]+$/.test(name.trim());
}


