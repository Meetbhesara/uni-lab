export const hasPermission = (user, moduleName, action = 'read') => {
    if (!user) return false;
    // Super Admin gets unrestricted access
    if (user.isSuperAdmin) return true; 
    
    // Non-admin users don't have these permissions
    if (!user.isAdmin) return false;

    // If permissions object exists on admin, check it
    if (user.permissions) {
        const modulePerms = user.permissions[moduleName];
        if (!modulePerms) return false; // Default to false if not specified
        return modulePerms[action] === true;
    }

    // Legacy admins without a permissions object default to true so we don't break existing setups
    return true; 
};
