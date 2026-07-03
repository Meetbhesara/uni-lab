import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Heading, VStack, HStack, Select, Spinner, useToast, Checkbox, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge, Avatar } from '@chakra-ui/react';
import { FiSave, FiUser, FiLock } from 'react-icons/fi';
import api from '../../api/axios';

import { PERMISSION_MODULES } from '../../utils/permissionModules';

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

            // Helper: build flat parentKey map across all modules
            const getParentKey = (k) => {
                for (const mod of PERMISSION_MODULES) {
                    if (mod.subTabs) {
                        const found = mod.subTabs.find(s => s.key === k);
                        if (found && found.parentKey) return found.parentKey;
                    }
                }
                return null;
            };

            // Helper: get all direct children of a key
            const getChildren = (parentK) => {
                const children = [];
                PERMISSION_MODULES.forEach(mod => {
                    if (mod.subTabs) {
                        mod.subTabs.forEach(s => { if (s.parentKey === parentK) children.push(s.key); });
                    }
                });
                return children;
            };

            // 1. Update the target key itself
            next[key] = {
                ...next[key],
                [type]: value,
                // Disabling read also removes write at same level
                ...(type === 'read' && !value ? { write: false } : {}),
                // Enabling write also ensures read is on at same level
                ...(type === 'write' && value ? { read: true } : {})
            };

            // 2. Propagate DOWN from parent to all descendants
            const propagateDown = (parentK, propType, isEnabled) => {
                getChildren(parentK).forEach(childKey => {
                    if (propType === 'read') {
                        if (!isEnabled) {
                            // Disabling parent read → disable read + write on all descendants
                            next[childKey] = { read: false, write: false };
                            propagateDown(childKey, 'read', false);
                        } else {
                            // Enabling parent read → enable read on all descendants
                            next[childKey] = { ...next[childKey], read: true };
                            propagateDown(childKey, 'read', true);
                        }
                    } else if (propType === 'write') {
                        if (!isEnabled) {
                            // Disabling parent write → disable write on all descendants
                            next[childKey] = { ...next[childKey], write: false };
                            propagateDown(childKey, 'write', false);
                        } else {
                            // Enabling parent write → enable write only on descendants that already have read
                            if (next[childKey]?.read) {
                                next[childKey] = { ...next[childKey], write: true };
                                propagateDown(childKey, 'write', true);
                            }
                        }
                    }
                });
            };
            propagateDown(key, type, value);

            // 3. Propagate UP from child to all ancestors
            const propagateUp = (childKey, propType, isEnabled) => {
                const parentKey = getParentKey(childKey);
                if (!parentKey) return;

                if (isEnabled) {
                    // Enabling anything → ensure all ancestors have read
                    next[parentKey] = { ...next[parentKey], read: true };
                    // Enabling write on child → also enable write on all ancestors
                    if (propType === 'write') {
                        next[parentKey] = { ...next[parentKey], write: true };
                    }
                    propagateUp(parentKey, propType, true);
                } else if (propType === 'write') {
                    // Disabling write on child → check if any sibling still has write
                    const siblings = getChildren(parentKey).filter(k => k !== childKey);
                    const anyWrite = siblings.some(sk => next[sk]?.write === true);
                    // Also check if parent itself has explicit write we should preserve
                    if (!anyWrite) {
                        next[parentKey] = { ...next[parentKey], write: false };
                        propagateUp(parentKey, 'write', false);
                    }
                }
            };
            propagateUp(key, type, value);

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

    const renderPermissionTree = (items, parentKey = null, depth = 0, moduleConfig = null) => {
        const levelItems = items.filter(s => {
            if (parentKey === null) {
                return !s.parentKey;
            }
            return s.parentKey === parentKey;
        });

        if (levelItems.length === 0) return null;

        return (
            <VStack align="stretch" spacing={2} w="full" pl={depth > 0 ? 8 : 0} position="relative" py={1}>
                {depth > 0 && (
                    <Box 
                        position="absolute" 
                        left="18px"
                        top="0" 
                        bottom="20px" 
                        width="2px" 
                        borderLeft="2px dashed" 
                        borderColor="gray.300"
                    />
                )}
                {levelItems.map(item => {
                    const hasChildren = items.some(s => s.parentKey === item.key);
                    const isParentRead = item.parentKey ? (permissions[item.parentKey]?.read || false) : true;
                    const isItemRead = (permissions[item.key]?.read && isParentRead) || false;

                    return (
                        <VStack key={item.key} align="stretch" spacing={2} w="full">
                            <Flex 
                                justify="space-between" 
                                align="center" 
                                p={depth === 0 ? 3 : 2.5} 
                                bg={depth === 0 ? "white" : "gray.50"} 
                                borderRadius="md" 
                                borderLeft={depth === 0 ? "4px solid" : "none"} 
                                borderLeftColor="brand.400"
                                border="1px solid"
                                borderColor="gray.100"
                                position="relative"
                                opacity={isParentRead ? 1 : 0.6}
                            >
                                {depth > 0 && (
                                    <Box 
                                        position="absolute" 
                                        left="-20px" 
                                        top="50%" 
                                        width="20px" 
                                        height="2px" 
                                        borderBottom="2px dashed" 
                                        borderColor="gray.300"
                                    />
                                )}
                                <HStack spacing={2}>
                                    {depth > 0 && <Text color="gray.400" fontFamily="monospace">└─</Text>}
                                    <Text 
                                        fontWeight={depth === 0 ? "medium" : "normal"} 
                                        fontSize={depth === 0 ? "md" : "sm"} 
                                        color="gray.700"
                                    >
                                        {item.label}
                                    </Text>
                                </HStack>
                                <HStack spacing={6}>
                                    <Checkbox 
                                        colorScheme="brand" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={isItemRead}
                                        isDisabled={!isParentRead}
                                        onChange={(e) => handlePermissionChange(item.key, 'read', e.target.checked)}
                                    >
                                        Read Access
                                    </Checkbox>
                                    <Checkbox 
                                        colorScheme="red" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={(permissions[item.key]?.write && isItemRead) || false}
                                        isDisabled={!isItemRead}
                                        onChange={(e) => handlePermissionChange(item.key, 'write', e.target.checked)}
                                    >
                                        Write / Modify
                                    </Checkbox>
                                </HStack>
                            </Flex>
                            {hasChildren && renderPermissionTree(items, item.key, depth + 1, moduleConfig)}
                        </VStack>
                    );
                })}
            </VStack>
        );
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
                                                renderPermissionTree(module.subTabs, null, 0, module)
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
