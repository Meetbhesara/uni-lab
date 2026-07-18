const PARENT_PERMISSIONS = {
    // Dashboard
    'dashboard_admins': 'dashboard',
    'dashboard_users': 'dashboard',

    // Products
    'showStock': 'products',
    'showSellingPrice': 'products',
    'showDealerPrice': 'products',
    'showVendors': 'products',

    // Enquiries
    'incomingEnquiries': 'enquiries',
    'outboundQuotations': 'enquiries',
    'processedHistory': 'enquiries',

    // Vehicle Master
    'vehicleMaster_form': 'vehicleMaster',
    'vehicleMaster_view': 'vehicleMaster',

    // Employee Master
    'employeeMaster_form': 'employeeMaster',
    'employeeMaster_view': 'employeeMaster',
    'employeeMaster_payment': 'employeeMaster',
    'employeeMaster_adminReport': 'employeeMaster',

    // Client Master
    'clientMaster_form': 'clientMaster',
    'clientMaster_view': 'clientMaster',

    // Site Master
    'siteMaster_form': 'siteMaster',
    'siteMaster_view': 'siteMaster',

    // Schedule Master
    'scheduleMaster_form': 'scheduleMaster',
    'scheduleMaster_view': 'scheduleMaster',
    'scheduleMaster_report': 'scheduleMaster',

    // Instrument Master
    'instrumentMaster_form': 'instrumentMaster',
    'instrumentMaster_view': 'instrumentMaster',
    'instrumentMaster_groups': 'instrumentMaster',

    // Employee Expense
    'employeeExpense_transfer': 'employeeExpense',
    'employeeExpense_daily': 'employeeExpense',
    'employeeExpense_report': 'employeeExpense',
    
    'employeeExpense_transfer_create': 'employeeExpense_transfer',
    'employeeExpense_transfer_view': 'employeeExpense_transfer',
    'employeeExpense_transfer_attendance': 'employeeExpense_transfer',
    'employeeExpense_transfer_customAccount': 'employeeExpense_transfer',

    // Daily Report Sub-modules
    'employeeExpense_report_last5days': 'employeeExpense_report',
    'employeeExpense_report_advanced': 'employeeExpense_report',

    // Other Services Sub-modules
    'draftingWork': 'otherServices',
    'invoiceReport': 'otherServices'
};

export const hasPermission = (user, moduleName, action = 'read') => {
    if (!user) return false;
    // Super Admin gets unrestricted access
    if (user.isSuperAdmin) return true; 
    
    // Non-admin users don't have these permissions
    if (!user.isAdmin) return false;

    // Check parent permission first if there is one defined
    const parentKey = PARENT_PERMISSIONS[moduleName];
    if (parentKey) {
        // If parent has no read access, then child is automatically denied
        if (!hasPermission(user, parentKey, 'read')) {
            return false;
        }
    }

    // If permissions object exists on admin, check it
    if (user.permissions) {
        const modulePerms = user.permissions[moduleName];
        if (!modulePerms) return false; // Default to false if not specified
        return modulePerms[action] === true;
    }

    // Legacy admins without a permissions object default to true so we don't break existing setups
    return true; 
};
