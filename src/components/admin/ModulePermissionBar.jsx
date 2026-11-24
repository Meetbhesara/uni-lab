import React, { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Select, VStack,
    HStack, Checkbox, Spinner, useToast, Icon, Badge, Avatar
} from '@chakra-ui/react';
import { FiLock, FiSliders, FiSave } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { PERMISSION_MODULES } from '../../utils/permissionModules';

const ModulePermissionBar = ({ moduleGroupKey, subModuleFilterKey }) => {
    const { user, refreshUser } = useAuth();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const moduleConfig = PERMISSION_MODULES.find(m => m.key === moduleGroupKey) || {
        key: moduleGroupKey || 'custom',
        label: moduleGroupKey ? moduleGroupKey.replace(/Group$/, '') : 'Module Permissions',
        subTabs: []
    };

    const activeSubModule = subModuleFilterKey
        ? moduleConfig.subTabs.find(s => s.key === subModuleFilterKey)
        : null;
    const titleLabel = activeSubModule ? activeSubModule.label : moduleConfig.label;

    // Modules where parent & child are fully independent — no linking at all
    const INDEPENDENT_GROUPS = ['dashboardGroup', 'productsGroup'];
    const isIndependentModule = INDEPENDENT_GROUPS.includes(moduleGroupKey);

    const targetParentKey = subModuleFilterKey
        ? moduleConfig.subTabs.find(s => s.key === subModuleFilterKey)?.parentKey
        : null;

    const subTabsToRender = subModuleFilterKey
        ? moduleConfig.subTabs.filter(s => {
            if (s.key === subModuleFilterKey) return true;
            if (targetParentKey && s.key === targetParentKey) return true;
            if (moduleConfig.mainTabKey && s.key === moduleConfig.mainTabKey) return true;
            return false;
        })
        : moduleConfig.subTabs;

    // Prefetch admins for instant ("fast") response when opening configuration
    useEffect(() => {
        if (user?.isSuperAdmin) {
            fetchAdmins();
        }
    }, [user?.isSuperAdmin]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/auth/admins');
            const adminList = res.data || [];
            setAdmins(adminList);
            if (adminList.length > 0) {
                // Default select the first non-super admin, or first admin
                const firstTarget = adminList.find(a => !a.isSuperAdmin) || adminList[0];
                selectAdminHandler(firstTarget._id, adminList);
            }
        } catch (err) {
            console.error('Failed to load admins:', err);
            toast({ title: 'Failed to fetch administrative users', status: 'error', isClosable: true });
        } finally {
            setLoading(false);
        }
    };

    const selectAdminHandler = (adminId, list = admins) => {
        if (!adminId) {
            setSelectedAdmin(null);
            setPermissions({});
            return;
        }
        const admin = list.find(a => a._id === adminId);
        setSelectedAdmin(admin);
        const existingPerms = admin?.permissions || {};
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
                ...(type === 'read' && !value ? { write: false } : {}),
                ...(type === 'write' && value ? { read: true } : {})
            };

            // 2. Cascade down to children if toggling parent
            const children = getChildren(key);
            children.forEach(childKey => {
                if (!next[childKey]) next[childKey] = { read: false, write: false };

                if (isIndependentModule) {
                    if (type === 'read' && !value) {
                        next[childKey] = { read: false, write: false };
                    }
                    if (type === 'write' && !value) {
                        next[childKey] = { ...next[childKey], write: false };
                    }
                } else {
                    if (type === 'read' && !value) {
                        next[childKey] = { read: false, write: false };
                    }
                }
            });

            // 3. Independent module cascading upwards
            PERMISSION_MODULES.forEach(mod => {
                if (mod.subTabs) {
                    const currentSub = mod.subTabs.find(s => s.key === key);
                    if (currentSub && currentSub.parentKey) {
                        const parentK = currentSub.parentKey;
                        if (!next[parentK]) next[parentK] = { read: false, write: false };

                        if (type === 'read' && value) {
                            next[parentK] = { ...next[parentK], read: true };
                        }
                        if (type === 'write' && value) {
                            next[parentK] = { ...next[parentK], read: true, write: true };
                        }
                    }
                }
            });

            return next;
        });
    };

    const renderPermissionTree = (items, parentKey = null, depth = 0) => {
        const levelItems = items.filter(s => {
            if (parentKey === null) {
                return !s.parentKey || !items.some(other => other.key === s.parentKey);
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
                    const parentIsInList = item.parentKey && items.some(other => other.key === item.parentKey);
                    const parentPerms = parentIsInList ? (permissions[item.parentKey] || {}) : null;

                    const effectiveParentRead = parentIsInList
                        ? (isIndependentModule
                            ? (parentPerms ? (parentPerms.read || false) : true)
                            : (permissions[item.parentKey]?.read || false))
                        : true;

                    const effectiveParentWrite = parentIsInList && isIndependentModule
                        ? (parentPerms ? (parentPerms.write || false) : true)
                        : true;

                    const isItemRead = permissions[item.key]?.read || false;

                    const isWriteChecked = (permissions[item.key]?.write && isItemRead) || false;

                    const isReadDisabled  = !effectiveParentRead;

                    const isWriteDisabled = isIndependentModule
                        ? (!isItemRead || !effectiveParentWrite)
                        : (!permissions[item.key]?.read || !effectiveParentRead);

                    return (
                        <VStack key={item.key} align="stretch" spacing={2} w="full">
                            <Flex 
                                justify="space-between" 
                                align="center" 
                                p={depth === 0 ? 3.5 : 2.5} 
                                bg={depth === 0 ? "white" : "gray.50"} 
                                borderRadius="xl" 
                                border="1px solid"
                                borderColor="gray.200"
                                position="relative"
                                opacity={effectiveParentRead ? 1 : 0.6}
                                _hover={depth === 0 ? { borderColor: 'purple.300', shadow: 'sm' } : {}}
                                transition="all 0.2s"
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
                                    {depth > 0 && <Text color="gray.400" fontFamily="monospace">└──</Text>}
                                    <Text 
                                        fontWeight={depth === 0 ? "bold" : "medium"} 
                                        fontSize={depth === 0 ? "sm" : "xs"} 
                                        color="gray.800"
                                    >
                                        {item.label}
                                    </Text>
                                </HStack>
                                <HStack spacing={4}>
                                    <Checkbox 
                                        colorScheme="purple" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={isItemRead}
                                        isDisabled={isReadDisabled}
                                        onChange={(e) => handlePermissionChange(item.key, 'read', e.target.checked)}
                                    >
                                        <Text fontSize={depth === 0 ? "xs" : "10px"} fontWeight="semibold">Read Access</Text>
                                    </Checkbox>
                                    <Checkbox 
                                        colorScheme="red" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={isWriteChecked}
                                        isDisabled={isWriteDisabled}
                                        onChange={(e) => handlePermissionChange(item.key, 'write', e.target.checked)}
                                    >
                                        <Text fontSize={depth === 0 ? "xs" : "10px"} fontWeight="semibold">Write/Modify</Text>
                                    </Checkbox>
                                </HStack>
                            </Flex>
                            {hasChildren && renderPermissionTree(items, item.key, depth + 1)}
                        </VStack>
                    );
                })}
            </VStack>
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedAdmin) return;
        setSaving(true);
        try {
            await api.patch(`/auth/admins/${selectedAdmin._id}/permissions`, { permissions });
            toast({
                title: 'Permissions Synchronized!',
                description: `Access rights for ${selectedAdmin.name} updated on ${titleLabel}.`,
                status: 'success',
                duration: 3000,
                isClosable: true
            });
            setAdmins(prev => prev.map(a => a._id === selectedAdmin._id ? { ...a, permissions } : a));
            if (refreshUser) refreshUser();
            onClose();
        } catch (err) {
            console.error(err);
            toast({ title: 'Failed to update module permissions', status: 'error', isClosable: true });
        } finally {
            setSaving(false);
        }
    };

    if (!user?.isSuperAdmin) return null;

    return (
        <>
            <Box
                position="relative"
                w="full"
                mb={{ base: 2.5, md: 3 }}
            >
                <Box
                    py={{ base: 2.5, md: 3 }}
                    px={{ base: 3, md: 4 }}
                    bg="linear-gradient(135deg, rgba(88, 28, 135, 0.98), rgba(67, 56, 202, 0.98))"
                    color="white"
                    borderRadius="2xl"
                    boxShadow="0 4px 16px -2px rgba(88, 28, 135, 0.3)"
                    border="1.5px solid"
                    borderColor="purple.500"
                >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                        <HStack spacing={3}>
                            <Flex
                                w={9}
                                h={9}
                                bg="whiteAlpha.200"
                                borderRadius="lg"
                                align="center"
                                justify="center"
                                flexShrink={0}
                            >
                                <Icon as={FiLock} fontSize="lg" color="yellow.300" />
                            </Flex>
                            <VStack align="start" spacing={0}>
                                <HStack spacing={2}>
                                    <Badge colorScheme="yellow" fontSize="10px" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                        Super Admin Control
                                    </Badge>
                                    <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">
                                        {titleLabel} Access Gating
                                    </Text>
                                </HStack>
                                <Text fontSize="xs" color="purple.200" mt={0.5} noOfLines={{ base: 1, md: 2 }}>
                                    Directly configure read/write access for administrative staff without leaving this module.
                                </Text>
                            </VStack>
                        </HStack>

                        <Button
                            size="sm"
                            h="36px"
                            leftIcon={<FiSliders />}
                            colorScheme="yellow"
                            color="gray.900"
                            fontWeight="bold"
                            onClick={onOpen}
                            _hover={{ bg: 'yellow.300', transform: 'translateY(-1px)' }}
                            _active={{ bg: 'yellow.400' }}
                            transition="all 0.2s"
                            shadow="md"
                            fontSize="xs"
                            px={3.5}
                        >
                            Configure Module Permissions
                        </Button>
                    </Flex>
                </Box>

                <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
                    <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
                    <ModalContent borderRadius="2xl" overflow="hidden">
                        <ModalHeader bgGradient="linear(to-r, purple.700, indigo.800)" color="white" py={4}>
                            <HStack>
                                <Icon as={FiSliders} />
                                <Text fontSize="md">Module Permission Settings: {titleLabel}</Text>
                            </HStack>
                        </ModalHeader>
                        <ModalCloseButton color="white" mt={1} />

                        <ModalBody p={6}>
                            {loading && admins.length === 0 ? (
                                <Flex justify="center" align="center" py={10}>
                                    <Spinner size="xl" color="purple.500" />
                                </Flex>
                            ) : (
                                <VStack spacing={5} align="stretch">
                                    <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
                                        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>
                                            Select Administrative Staff Member
                                        </Text>
                                        <Select
                                            value={selectedAdmin?._id || ''}
                                            onChange={(e) => selectAdminHandler(e.target.value)}
                                            bg="white"
                                            size="md"
                                            borderRadius="lg"
                                            fontWeight="semibold"
                                        >
                                            {admins.map(admin => (
                                                <option key={admin._id} value={admin._id}>
                                                    {admin.name} ({admin.email}) {admin.isSuperAdmin ? ' [SUPER ADMIN]' : ''}
                                                </option>
                                            ))}
                                        </Select>
                                    </Box>

                                    {selectedAdmin && (
                                        <Box>
                                            <HStack justify="space-between" mb={3} p={2} bg="purple.50" borderRadius="lg">
                                                <HStack>
                                                    <Avatar size="sm" name={selectedAdmin.name} bg="purple.600" />
                                                    <Text fontWeight="bold" fontSize="sm" color="purple.900">{selectedAdmin.name}</Text>
                                                </HStack>
                                                {selectedAdmin.isSuperAdmin && (
                                                    <Badge colorScheme="purple">SUPER ADMIN</Badge>
                                                )}
                                            </HStack>

                                            {selectedAdmin.isSuperAdmin && (
                                                <Text fontSize="xs" color="purple.600" mb={3}>
                                                    Note: Super Admins automatically bypass permission checks. Modifying checkboxes below applies to their profile if Super Admin privileges are revoked later.
                                                </Text>
                                            )}

                                            <VStack align="stretch" spacing={3}>
                                                {renderPermissionTree(subTabsToRender.length === 0 ? [{ key: moduleConfig.key, label: 'Full Access' }] : subTabsToRender)}
                                            </VStack>
                                        </Box>
                                    )}
                                </VStack>
                            )}
                        </ModalBody>

                        <ModalFooter bg="gray.50" py={3.5} borderTop="1px solid" borderColor="gray.100">
                            <Button variant="ghost" size="sm" mr={3} onClick={onClose} borderRadius="lg">Cancel</Button>
                            <Button
                                colorScheme="purple"
                                size="sm"
                                leftIcon={<FiSave />}
                                onClick={handleSavePermissions}
                                isLoading={saving}
                                loadingText="Applying..."
                                borderRadius="lg"
                                px={6}
                            >
                                Apply Permissions
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Box>
        </>
    );
};

export default ModulePermissionBar;
