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

    const subTabsToRender = subModuleFilterKey
        ? moduleConfig.subTabs.filter(s => s.key === subModuleFilterKey)
        : moduleConfig.subTabs;

    useEffect(() => {
        if (isOpen && user?.isSuperAdmin) {
            fetchAdmins();
        }
    }, [isOpen]);

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
            next[key] = {
                ...next[key],
                [type]: value,
                ...(type === 'read' && !value ? { write: false } : {})
            };

            // 1. Propagate parent-to-child permissions recursively
            const propagateParentToChild = (parentKey, isEnabled) => {
                PERMISSION_MODULES.forEach(mod => {
                    if (mod.subTabs && mod.subTabs.length > 0) {
                        const children = mod.subTabs.filter(s => s.parentKey === parentKey);
                        children.forEach(child => {
                            if (type === 'read') {
                                if (!isEnabled) {
                                    next[child.key] = { read: false, write: false };
                                    propagateParentToChild(child.key, false);
                                } else {
                                    next[child.key] = { ...next[child.key], read: true };
                                    propagateParentToChild(child.key, true);
                                }
                            } else if (type === 'write') {
                                if (!isEnabled) {
                                    next[child.key] = { ...next[child.key], write: false };
                                    propagateParentToChild(child.key, false);
                                }
                            }
                        });
                    }
                });
            };
            propagateParentToChild(key, value);

            // 2. Propagate child-to-parent permissions recursively (force enabling parent read if child read is enabled)
            const propagateChildToParent = (childKey) => {
                PERMISSION_MODULES.forEach(mod => {
                    if (mod.subTabs && mod.subTabs.length > 0) {
                        const targetSub = mod.subTabs.find(s => s.key === childKey);
                        if (targetSub && targetSub.parentKey) {
                            const parentKey = targetSub.parentKey;
                            if (type === 'read' && value) {
                                next[parentKey] = { ...next[parentKey], read: true };
                                propagateChildToParent(parentKey);
                            }
                        }
                    }
                });
            };
            propagateChildToParent(key);

            // 3. Sync main tab if applicable
            PERMISSION_MODULES.forEach(mod => {
                if (mod.mainTabKey && mod.subTabs && mod.subTabs.length > 0) {
                    const mainTabKey = mod.mainTabKey;
                    if (key !== mainTabKey && mod.subTabs.some(s => s.key === key)) {
                        const anySubTabTrue = mod.subTabs.filter(s => s.key !== mainTabKey).some(sub => {
                            if (sub.key === key) return type === 'read' ? value : next[key]?.read;
                            return next[sub.key]?.read === true;
                        });
                        if (anySubTabTrue) {
                            next[mainTabKey] = { ...next[mainTabKey], read: true };
                        } else if (key !== 'showStock') {
                            next[mainTabKey] = { ...next[mainTabKey], read: false, write: false };
                        }
                    }
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

    const renderPermissionTree = (items, parentKey = null, depth = 0) => {
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
                                p={depth === 0 ? 3.5 : 2.5} 
                                bg={depth === 0 ? "white" : "gray.50"} 
                                borderRadius="xl" 
                                border="1px solid"
                                borderColor="gray.200"
                                position="relative"
                                opacity={isParentRead ? 1 : 0.6}
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
                                    {depth > 0 && <Text color="gray.400" fontFamily="monospace">└─</Text>}
                                    <Text 
                                        fontWeight="bold" 
                                        fontSize={depth === 0 ? "sm" : "xs"} 
                                        color={depth === 0 ? "gray.700" : "gray.600"}
                                    >
                                        {item.label}
                                    </Text>
                                </HStack>
                                <HStack spacing={5}>
                                    <Checkbox 
                                        colorScheme="purple" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={isItemRead}
                                        isDisabled={!isParentRead}
                                        onChange={(e) => handlePermissionChange(item.key, 'read', e.target.checked)}
                                    >
                                        <Text fontSize={depth === 0 ? "xs" : "10px"} fontWeight="semibold">Read</Text>
                                    </Checkbox>
                                    <Checkbox 
                                        colorScheme="red" 
                                        size={depth === 0 ? "md" : "sm"}
                                        isChecked={(permissions[item.key]?.write && isParentRead && permissions[item.key]?.read) || false}
                                        isDisabled={!permissions[item.key]?.read || !isParentRead}
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
                description: `Access rights for ${selectedAdmin.name} updated on ${moduleConfig.label}.`,
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
        <Box mb={5}>
            <Box
                p={{ base: 3, md: 4 }}
                bgGradient="linear(to-r, purple.800, indigo.800)"
                color="white"
                borderRadius="xl"
                boxShadow="md"
                border="1px solid"
                borderColor="purple.600"
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                    <HStack spacing={3}>
                        <Flex
                            w={10} h={10} bg="whiteAlpha.200" borderRadius="lg"
                            align="center" justify="center"
                        >
                            <Icon as={FiLock} fontSize="xl" color="yellow.300" />
                        </Flex>
                        <VStack align="start" spacing={0}>
                            <HStack>
                                <Badge colorScheme="yellow" fontSize="10px" px={2} py={0.5} borderRadius="md">Super Admin Control</Badge>
                                <Text fontWeight="bold" fontSize="sm" letterSpacing="wide">
                                    {moduleConfig.label} Access Gating
                                </Text>
                            </HStack>
                            <Text fontSize="xs" color="purple.200" mt={0.5}>
                                Directly configure read/write access for administrative staff without leaving this module.
                            </Text>
                        </VStack>
                    </HStack>
                    <Button
                        size="sm"
                        leftIcon={<FiSliders />}
                        colorScheme="yellow"
                        color="gray.900"
                        fontWeight="bold"
                        onClick={onOpen}
                        _hover={{ bg: 'yellow.300', transform: 'translateY(-1px)' }}
                        transition="all 0.2s"
                        shadow="sm"
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
                            <Text fontSize="md">Module Permission Settings: {moduleConfig.label}</Text>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton color="white" mt={1} />

                    <ModalBody p={6}>
                        {loading ? (
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
    );
};

export default ModulePermissionBar;
