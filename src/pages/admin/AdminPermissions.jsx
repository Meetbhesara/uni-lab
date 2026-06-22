import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Heading, VStack, HStack, Select, Spinner, useToast, Checkbox, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, Avatar } from '@chakra-ui/react';
import { FiSave, FiUser, FiLock } from 'react-icons/fi';
import api from '../../api/axios';

const PERMISSION_MODULES = [
    {
        key: 'productsGroup',
        label: 'Products Module',
        mainTabKey: 'products',
        subTabs: [
            { key: 'products', label: 'Main Tab Access' },
            { key: 'showStock', label: 'Show/Manage Stock' }
        ]
    },
    {
        key: 'enquiriesGroup',
        label: 'Enquiries Module',
        mainTabKey: 'enquiries',
        subTabs: [
            { key: 'enquiries', label: 'Main Tab Access' },
            { key: 'incomingEnquiries', label: 'Incoming Enquiries' },
            { key: 'outboundQuotations', label: 'Outbound Quotations' },
            { key: 'processedHistory', label: 'Processed (History)' }
        ]
    },
    {
        key: 'vehicleMasterGroup',
        label: 'Vehicle Master Module',
        mainTabKey: 'vehicleMaster',
        subTabs: [
            { key: 'vehicleMaster', label: 'Main Tab Access' },
            { key: 'vehicleMaster_form', label: 'Register Vehicle Form' },
            { key: 'vehicleMaster_view', label: 'View Registered Vehicles' }
        ]
    },
    {
        key: 'employeeMasterGroup',
        label: 'Employee Master Module',
        mainTabKey: 'employeeMaster',
        subTabs: [
            { key: 'employeeMaster', label: 'Main Tab Access' },
            { key: 'employeeMaster_form', label: 'Register Employee Form' },
            { key: 'employeeMaster_view', label: 'View Registered Employees' }
        ]
    },
    {
        key: 'clientMasterGroup',
        label: 'Client Master Module',
        mainTabKey: 'clientMaster',
        subTabs: [
            { key: 'clientMaster', label: 'Main Tab Access' },
            { key: 'clientMaster_form', label: 'Register Client Form' },
            { key: 'clientMaster_view', label: 'View Registered Clients' }
        ]
    },
    {
        key: 'siteMasterGroup',
        label: 'Site Master Module',
        mainTabKey: 'siteMaster',
        subTabs: [
            { key: 'siteMaster', label: 'Main Tab Access' },
            { key: 'siteMaster_form', label: 'Register Site Form' },
            { key: 'siteMaster_view', label: 'View Registered Sites' }
        ]
    },
    {
        key: 'scheduleMasterGroup',
        label: 'Schedule Master Module',
        mainTabKey: 'scheduleMaster',
        subTabs: [
            { key: 'scheduleMaster', label: 'Main Tab Access' },
            { key: 'scheduleMaster_form', label: 'Schedule Visit Form' },
            { key: 'scheduleMaster_view', label: 'Scheduler View' },
            { key: 'scheduleMaster_report', label: 'Site Allocation Report' }
        ]
    },
    {
        key: 'instrumentMasterGroup',
        label: 'Instrument Master Module',
        mainTabKey: 'instrumentMaster',
        subTabs: [
            { key: 'instrumentMaster', label: 'Main Tab Access' },
            { key: 'instrumentMaster_form', label: 'Register Instrument Form' },
            { key: 'instrumentMaster_view', label: 'View Registered Instruments' }
        ]
    },
    {
        key: 'otherServicesGroup',
        label: 'Other Services & Reports',
        subTabs: [
            { key: 'employeeExpense', label: 'Employee Ledger' },
            { key: 'draftingWork', label: 'Drafting Work' },
            { key: 'invoiceReport', label: 'Invoice Report' }
        ]
    }
];

const AdminPermissions = () => {
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/auth/admins');
            setAdmins(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast({ title: 'Failed to fetch admin users', status: 'error', isClosable: true });
            setLoading(false);
        }
    };

    const handleSelectAdmin = (e) => {
        const adminId = e.target.value;
        if (!adminId) {
            setSelectedAdmin(null);
            setPermissions({});
            return;
        }
        const admin = admins.find(a => a._id === adminId);
        setSelectedAdmin(admin);
        // Initialize permissions with existing or defaults
        const existingPerms = admin.permissions || {};
        
        // Ensure all keys exist in the working state to avoid undefined errors
        const workingPerms = { ...existingPerms };
        PERMISSION_MODULES.forEach(mod => {
            if (mod.subTabs.length === 0) {
                if (!workingPerms[mod.key]) workingPerms[mod.key] = { read: false, write: false };
            } else {
                mod.subTabs.forEach(sub => {
                    if (!workingPerms[sub.key]) workingPerms[sub.key] = { read: false, write: false };
                });
            }
        });
        
        setPermissions(workingPerms);
    };

    const handlePermissionChange = (key, type, value) => {
        setPermissions(prev => {
            const next = { ...prev };
            
            // 1. Update the target key
            next[key] = {
                ...next[key],
                [type]: value,
                // If read is disabled, force write to be disabled as well
                ...(type === 'read' && !value ? { write: false } : {})
            };

            // 2. Smart Toggle Logic for "Main Tab" based on SubTabs
            PERMISSION_MODULES.forEach(mod => {
                if (mod.mainTabKey && mod.subTabs && mod.subTabs.length > 0) {
                    const mainTabKey = mod.mainTabKey;
                    
                    // If the changed key is a sub-tab of this module (and NOT the main tab itself)
                    if (key !== mainTabKey && mod.subTabs.some(s => s.key === key)) {
                        
                        // Check if ANY subtab (excluding the main tab) is TRUE for 'read'
                        const anySubTabTrue = mod.subTabs.filter(s => s.key !== mainTabKey).some(sub => {
                            if (sub.key === key) return type === 'read' ? value : next[key]?.read;
                            return next[sub.key]?.read === true;
                        });

                        // Automatically update the Main Tab!
                        if (anySubTabTrue) {
                            next[mainTabKey] = { ...next[mainTabKey], read: true };
                        } else {
                            if (key !== 'showStock') {
                                next[mainTabKey] = { ...next[mainTabKey], read: false, write: false };
                            }
                        }
                    }
                    
                    // If they toggle the main tab directly, sync all sub-tabs
                    if (key === mainTabKey && type === 'read') {
                        mod.subTabs.forEach(sub => {
                            if (value) {
                                next[sub.key] = { ...next[sub.key], read: true };
                            } else {
                                next[sub.key] = { read: false, write: false };
                            }
                        });
                    }
                }
            });

            return next;
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedAdmin) return;
        setSaving(true);
        try {
            await api.patch(`/auth/admins/${selectedAdmin._id}/permissions`, { permissions });
            toast({ title: 'Permissions updated successfully!', status: 'success', isClosable: true });
            
            // Update local admin state so it doesn't revert if re-selected
            setAdmins(prev => prev.map(a => a._id === selectedAdmin._id ? { ...a, permissions } : a));
        } catch (err) {
            console.error(err);
            toast({ title: 'Failed to update permissions', status: 'error', isClosable: true });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Flex justify="center" p={10}><Spinner size="xl" color="brand.500" /></Flex>;

    return (
        <Box bg="white" p={{ base: 4, md: 6 }} borderRadius="2xl" boxShadow="sm" border="1px" borderColor="gray.100" minH="80vh">
            <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
                <VStack align="start" spacing={1}>
                    <Heading size="lg" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
                        Admin Role Management
                    </Heading>
                    <Text color="gray.500">Configure highly granular access controls for individual administrative staff.</Text>
                </VStack>
            </Flex>

            <Box maxW="800px" mx="auto">
                <Box mb={8} p={6} bg="gray.50" borderRadius="xl" border="1px" borderColor="gray.200">
                    <Text fontWeight="bold" mb={2} color="gray.700">Select Administrative User</Text>
                    <Select 
                        placeholder="-- Choose an Admin --" 
                        bg="white" 
                        size="lg" 
                        onChange={handleSelectAdmin}
                        boxShadow="sm"
                    >
                        {admins.map(admin => (
                            <option key={admin._id} value={admin._id}>
                                {admin.name} ({admin.email}) {admin.isSuperAdmin ? ' - SUPER ADMIN' : ''}
                            </option>
                        ))}
                    </Select>
                </Box>

                {selectedAdmin && (
                    <Box>
                        <Flex justify="space-between" align="center" mb={6}>
                            <HStack>
                                <Avatar size="md" name={selectedAdmin.name} bg="brand.500" />
                                <VStack align="start" spacing={0}>
                                    <Heading size="md">{selectedAdmin.name}</Heading>
                                    <Text fontSize="sm" color="gray.500">{selectedAdmin.email}</Text>
                                </VStack>
                                {selectedAdmin.isSuperAdmin && <Badge colorScheme="purple" ml={2}>SUPER ADMIN</Badge>}
                            </HStack>
                            <Button 
                                leftIcon={<FiSave />} 
                                colorScheme="brand" 
                                size="md" 
                                onClick={handleSavePermissions}
                                isLoading={saving}
                                loadingText="Saving..."
                            >
                                Save Permissions
                            </Button>
                        </Flex>

                        {selectedAdmin.isSuperAdmin && (
                            <Box p={4} bg="purple.50" color="purple.700" borderRadius="lg" mb={6} border="1px" borderColor="purple.200">
                                <HStack>
                                    <FiLock />
                                    <Text fontWeight="bold">Note:</Text>
                                </HStack>
                                <Text fontSize="sm" mt={1}>
                                    This user is a Super Admin. They inherently bypass most permission checks in the system. Modifying these checkboxes may have limited effect unless Super Admin privileges are explicitly revoked.
                                </Text>
                            </Box>
                        )}

                        <Accordion allowMultiple defaultIndex={[0, 1]}>
                            {PERMISSION_MODULES.map((module, idx) => (
                                <AccordionItem key={idx} border="1px" borderColor="gray.200" borderRadius="lg" mb={3} bg="white" overflow="hidden">
                                    <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.700' }} p={4}>
                                        <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                            {module.label}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    
                                    <AccordionPanel pb={4} bg="white">
                                        <VStack align="stretch" spacing={4} mt={2}>
                                            {module.subTabs.length === 0 ? (
                                                // Module without subtabs
                                                <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                                                    <Text fontWeight="medium" color="gray.700">Full Module Access</Text>
                                                    <HStack spacing={6}>
                                                        <Checkbox 
                                                            colorScheme="brand" 
                                                            isChecked={permissions[module.key]?.read || false}
                                                            onChange={(e) => handlePermissionChange(module.key, 'read', e.target.checked)}
                                                        >
                                                            Read
                                                        </Checkbox>
                                                        <Checkbox 
                                                            colorScheme="red" 
                                                            isChecked={permissions[module.key]?.write || false}
                                                            isDisabled={!permissions[module.key]?.read}
                                                            onChange={(e) => handlePermissionChange(module.key, 'write', e.target.checked)}
                                                        >
                                                            Write / Delete
                                                        </Checkbox>
                                                    </HStack>
                                                </Flex>
                                            ) : (
                                                // Module with subtabs
                                                module.subTabs.map(sub => (
                                                    <Flex key={sub.key} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md" borderLeft="4px" borderLeftColor="brand.400">
                                                        <Text fontWeight="medium" color="gray.700">{sub.label}</Text>
                                                        <HStack spacing={6}>
                                                            <Checkbox 
                                                                colorScheme="brand" 
                                                                isChecked={permissions[sub.key]?.read || false}
                                                                onChange={(e) => handlePermissionChange(sub.key, 'read', e.target.checked)}
                                                            >
                                                                Read Access
                                                            </Checkbox>
                                                            <Checkbox 
                                                                colorScheme="red" 
                                                                isChecked={permissions[sub.key]?.write || false}
                                                                isDisabled={!permissions[sub.key]?.read}
                                                                onChange={(e) => handlePermissionChange(sub.key, 'write', e.target.checked)}
                                                                visibility={(module.mainTabKey && sub.key === module.mainTabKey) ? 'hidden' : 'visible'}
                                                            >
                                                                Write / Modify
                                                            </Checkbox>
                                                        </HStack>
                                                    </Flex>
                                                ))
                                            )}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AdminPermissions;
