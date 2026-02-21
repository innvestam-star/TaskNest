import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    hasPermission,
    PROJECT_ROLES,
    PROJECT_ROLE_LABELS,
    ROLE_COLORS,
    getAssignableRoles,
    canEditProject,
    canDeleteProject,
    canManageMembers,
    canCreateTask,
    canEditTask,
    canDeleteTask,
    canAssignTask,
    canCreateMeeting,
    canRecordMeeting,
    canEditTranscript,
    canExportPDF
} from '../utils/permissions';

const RBACContext = createContext(null);

/**
 * RBAC Provider Component
 * Wraps the app to provide role-based access control
 */
export function RBACProvider({ children }) {
    // Current user ID (in a real app, this would come from auth)
    const [currentUserId] = useState('u1'); // 'You' user

    /**
     * Get the user's role in a specific project
     * @param {Object} project - The project object with members array
     * @returns {string|null} The user's role or null if not a member
     */
    const getUserRole = useCallback((project) => {
        if (!project || !project.members) return null;
        const member = project.members.find(m => m.id === currentUserId);
        return member ? member.role : null;
    }, [currentUserId]);

    /**
     * Check if user can perform an action in a project
     * @param {Object} project - The project context
     * @param {string} action - The action to check
     * @returns {boolean} Whether the user can perform the action
     */
    const can = useCallback((project, action) => {
        const role = getUserRole(project);
        return hasPermission(role, action);
    }, [getUserRole]);

    /**
     * Check if user is the owner of a project
     * @param {Object} project - The project object
     * @returns {boolean} Whether the user is the owner
     */
    const isOwner = useCallback((project) => {
        const role = getUserRole(project);
        return role === PROJECT_ROLES.OWNER;
    }, [getUserRole]);

    /**
     * Check if user is at least a manager
     * @param {Object} project - The project object
     * @returns {boolean} Whether the user is owner or manager
     */
    const isManagerOrHigher = useCallback((project) => {
        const role = getUserRole(project);
        return role === PROJECT_ROLES.OWNER || role === PROJECT_ROLES.MANAGER;
    }, [getUserRole]);

    /**
     * Get roles that the current user can assign in a project
     * @param {Object} project - The project context
     * @returns {string[]} Array of assignable role keys
     */
    const getAssignableRolesForProject = useCallback((project) => {
        const role = getUserRole(project);
        return getAssignableRoles(role);
    }, [getUserRole]);

    const value = {
        currentUserId,
        getUserRole,
        can,
        isOwner,
        isManagerOrHigher,
        getAssignableRolesForProject,
        // Re-export utilities for convenience
        PROJECT_ROLES,
        PROJECT_ROLE_LABELS,
        ROLE_COLORS,
        // Re-export convenience functions
        canEditProject,
        canDeleteProject,
        canManageMembers,
        canCreateTask,
        canEditTask,
        canDeleteTask,
        canAssignTask,
        canCreateMeeting,
        canRecordMeeting,
        canEditTranscript,
        canExportPDF
    };

    return (
        <RBACContext.Provider value={value}>
            {children}
        </RBACContext.Provider>
    );
}

/**
 * Hook to access RBAC context
 * @returns {Object} RBAC context value
 */
export function useRBAC() {
    const context = useContext(RBACContext);
    if (!context) {
        throw new Error('useRBAC must be used within an RBACProvider');
    }
    return context;
}

/**
 * Hook to check a specific permission in a project context
 * @param {Object} project - The project to check permissions for
 * @param {string} action - The action to check
 * @returns {boolean} Whether the user has permission
 */
export function usePermission(project, action) {
    const { can } = useRBAC();
    return can(project, action);
}

/**
 * Hook to get the current user's role in a project
 * @param {Object} project - The project to get role for
 * @returns {string|null} The user's role or null
 */
export function useProjectRole(project) {
    const { getUserRole } = useRBAC();
    return getUserRole(project);
}

export default RBACContext;
