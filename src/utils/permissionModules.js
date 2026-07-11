export const PERMISSION_MODULES = [
    {
        key: 'dashboardGroup',
        label: 'Dashboard Module',
        mainTabKey: 'dashboard',
        subTabs: [
            { key: 'dashboard', label: 'Main Tab Access (Dashboard Overview & Stats)' },
            { key: 'dashboard_admins', label: 'Admin Accounts View/Manage', parentKey: 'dashboard' },
            { key: 'dashboard_users', label: 'Registered Users View/Manage', parentKey: 'dashboard' }
        ]
    },
    {
        key: 'productsGroup',
        label: 'Products Module',
        mainTabKey: 'products',
        subTabs: [
            { key: 'products', label: 'Main Tab Access' },
            { key: 'showStock', label: 'Show/Manage Stock', parentKey: 'products' },
            { key: 'showSellingPrice', label: 'Show/Manage Selling Price', parentKey: 'products' },
            { key: 'showDealerPrice', label: 'Show/Manage Dealer Price', parentKey: 'products' },
            { key: 'showVendors', label: 'Show/Manage Vendors & Purchase Prices', parentKey: 'products' }
        ]
    },
    {
        key: 'enquiriesGroup',
        label: 'Enquiries Module',
        mainTabKey: 'enquiries',
        subTabs: [
            { key: 'enquiries', label: 'Main Tab Access' },
            { key: 'incomingEnquiries', label: 'Incoming Enquiries', parentKey: 'enquiries' },
            { key: 'outboundQuotations', label: 'Outbound Quotations', parentKey: 'enquiries' },
            { key: 'processedHistory', label: 'Processed (History)', parentKey: 'enquiries' }
        ]
    },
    {
        key: 'vehicleMasterGroup',
        label: 'Vehicle Master Module',
        mainTabKey: 'vehicleMaster',
        subTabs: [
            { key: 'vehicleMaster', label: 'Main Tab Access' },
            { key: 'vehicleMaster_form', label: 'Register Vehicle Form', parentKey: 'vehicleMaster' },
            { key: 'vehicleMaster_view', label: 'View Registered Vehicles', parentKey: 'vehicleMaster' }
        ]
    },
    {
        key: 'employeeMasterGroup',
        label: 'Employee Master Module',
        mainTabKey: 'employeeMaster',
        subTabs: [
            { key: 'employeeMaster', label: 'Main Tab Access' },
            { key: 'employeeMaster_form', label: 'Register Employee Form', parentKey: 'employeeMaster' },
            { key: 'employeeMaster_view', label: 'View Registered Employees', parentKey: 'employeeMaster' },
            { key: 'employeeMaster_payment', label: 'Payment Report', parentKey: 'employeeMaster' },
            { key: 'employeeMaster_adminReport', label: 'Admin Login Report', parentKey: 'employeeMaster' }
        ]
    },
    {
        key: 'clientMasterGroup',
        label: 'Client Master Module',
        mainTabKey: 'clientMaster',
        subTabs: [
            { key: 'clientMaster', label: 'Main Tab Access' },
            { key: 'clientMaster_form', label: 'Register Client Form', parentKey: 'clientMaster' },
            { key: 'clientMaster_view', label: 'View Registered Clients', parentKey: 'clientMaster' }
        ]
    },
    {
        key: 'siteMasterGroup',
        label: 'Site Master Module',
        mainTabKey: 'siteMaster',
        subTabs: [
            { key: 'siteMaster', label: 'Main Tab Access' },
            { key: 'siteMaster_form', label: 'Register Site Form', parentKey: 'siteMaster' },
            { key: 'siteMaster_view', label: 'View Registered Sites', parentKey: 'siteMaster' }
        ]
    },
    {
        key: 'scheduleMasterGroup',
        label: 'Schedule Master Module',
        mainTabKey: 'scheduleMaster',
        subTabs: [
            { key: 'scheduleMaster', label: 'Main Tab Access' },
            { key: 'scheduleMaster_form', label: 'Schedule Visit Form', parentKey: 'scheduleMaster' },
            { key: 'scheduleMaster_view', label: 'Scheduler View', parentKey: 'scheduleMaster' },
            { key: 'scheduleMaster_report', label: 'Site Allocation Report', parentKey: 'scheduleMaster' }
        ]
    },
    {
        key: 'instrumentMasterGroup',
        label: 'Instrument Master Module',
        mainTabKey: 'instrumentMaster',
        subTabs: [
            { key: 'instrumentMaster', label: 'Main Tab Access' },
            { key: 'instrumentMaster_form', label: 'Register Instrument Form', parentKey: 'instrumentMaster' },
            { key: 'instrumentMaster_view', label: 'View Registered Instruments', parentKey: 'instrumentMaster' },
            { key: 'instrumentMaster_groups', label: 'Manage Instrument Groups', parentKey: 'instrumentMaster' }
        ]
    },
    {
        key: 'employeeExpenseGroup',
        label: 'Employee Expenses Module',
        mainTabKey: 'employeeExpense',
        subTabs: [
            { key: 'employeeExpense', label: 'Main Tab Access' },
            { key: 'employeeExpense_transfer', label: 'Money Transfer Access', parentKey: 'employeeExpense' },
            { key: 'employeeExpense_transfer_create', label: 'Create Transfer', parentKey: 'employeeExpense_transfer' },
            { key: 'employeeExpense_transfer_view', label: 'View Committed Transfers', parentKey: 'employeeExpense_transfer' },
            { key: 'employeeExpense_transfer_attendance', label: 'Unscheduled Attendance', parentKey: 'employeeExpense_transfer' },
            { key: 'employeeExpense_daily', label: 'Daily Expenses Access', parentKey: 'employeeExpense' },
            { key: 'employeeExpense_report', label: 'Daily Report & Ledger', parentKey: 'employeeExpense' },
            { key: 'employeeExpense_report_last5days', label: 'Last 5 Days Report', parentKey: 'employeeExpense_report' },
            { key: 'employeeExpense_report_advanced', label: 'Advanced Report', parentKey: 'employeeExpense_report' }
        ]
    },
    {
        key: 'otherServicesGroup',
        label: 'Other Services & Reports',
        mainTabKey: 'otherServices',
        subTabs: [
            { key: 'otherServices', label: 'Main Tab Access' },
            { key: 'draftingWork', label: 'Drafting Work', parentKey: 'otherServices' },
            { key: 'invoiceReport', label: 'Invoice Report', parentKey: 'otherServices' }
        ]
    }
];
