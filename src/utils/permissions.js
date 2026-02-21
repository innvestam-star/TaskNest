/**
 * Role-Based Access Control (RBAC) for TaskNest
 * Defines roles, permissions, and utility functions for access control
 */

// ============ PROJECT ROLES ============
export const PROJECT_ROLES = {
    OWNER: 'owner',
    MANAGER: 'manager',
    CONTRIBUTOR: 'contributor',
    VIEWER: 'viewer'
};

export const PROJECT_ROLE_LABELS = {
    [PROJECT_ROLES.OWNER]: 'Owner',
    [PROJECT_ROLES.MANAGER]: 'Manager',
    [PROJECT_ROLES.CONTRIBUTOR]: 'Contributor',
    [PROJECT_ROLES.VIEWER]: 'Viewer'
};

export const PROJECT_ROLE_DESCRIPTIONS = {
    [PROJECT_ROLES.OWNER]: 'Full control over project and all settings',
    [PROJECT_ROLES.MANAGER]: 'Can manage tasks, members, and meetings',
    [PROJECT_ROLES.CONTRIBUTOR]: 'Can work on tasks and add notes',
    [PROJECT_ROLES.VIEWER]: 'Read-only access to project'
};

// Role hierarchy (higher index = less permissions)
const PROJECT_ROLE_HIERARCHY = [
    PROJECT_ROLES.OWNER,
    PROJECT_ROLES.MANAGER,
    PROJECT_ROLES.CONTRIBUTOR,
    PROJECT_ROLES.VIEWER
];

// ============ TASK ROLES ============
export const TASK_ROLES = {
    RESPONSIBLE: 'responsible',
    REVIEWER: 'reviewer',
    OBSERVER: 'observer'
};

export const TASK_ROLE_LABELS = {
    [TASK_ROLES.RESPONSIBLE]: 'Responsible',
    [TASK_ROLES.REVIEWER]: 'Reviewer',
    [TASK_ROLES.OBSERVER]: 'Observer'
};

export const TASK_ROLE_DESCRIPTIONS = {
    [TASK_ROLES.RESPONSIBLE]: 'Executes and completes the task',
    [TASK_ROLES.REVIEWER]: 'Approves task completion',
    [TASK_ROLES.OBSERVER]: 'Visibility only, no actions'
};

// ============ PERMISSION ACTIONS ============
export const ACTIONS = {
    // Project actions
    PROJECT_VIEW: 'project:view',
    PROJECT_EDIT: 'project:edit',
    PROJECT_DELETE: 'project:delete',
    PROJECT_MANAGE_MEMBERS: 'project:manage_members',
    PROJECT_MANAGE_SETTINGS: 'project:manage_settings',

    // Task actions
    TASK_CREATE: 'task:create',
    TASK_EDIT: 'task:edit',
    TASK_DELETE: 'task:delete',
    TASK_ASSIGN: 'task:assign',
    TASK_COMPLETE: 'task:complete',
    TASK_VIEW: 'task:view',

    // Meeting actions
    MEETING_CREATE: 'meeting:create',
    MEETING_EDIT: 'meeting:edit',
    MEETING_DELETE: 'meeting:delete',
    MEETING_RECORD: 'meeting:record',
    MEETING_EDIT_TRANSCRIPT: 'meeting:edit_transcript',
    MEETING_EXPORT_PDF: 'meeting:export_pdf',
    MEETING_VIEW: 'meeting:view',

    // File actions
    FILE_UPLOAD: 'file:upload',
    FILE_DELETE: 'file:delete',
    FILE_VIEW: 'file:view'
};

// ============ PERMISSION MATRIX ============
// Maps project roles to allowed actions
const PERMISSION_MATRIX = {
    [PROJECT_ROLES.OWNER]: [
        // All actions
        ...Object.values(ACTIONS)
    ],

    [PROJECT_ROLES.MANAGER]: [
        ACTIONS.PROJECT_VIEW,
        ACTIONS.PROJECT_EDIT,
        ACTIONS.PROJECT_MANAGE_MEMBERS,
        ACTIONS.TASK_CREATE,
        ACTIONS.TASK_EDIT,
        ACTIONS.TASK_DELETE,
        ACTIONS.TASK_ASSIGN,
        ACTIONS.TASK_COMPLETE,
        ACTIONS.TASK_VIEW,
        ACTIONS.MEETING_CREATE,
        ACTIONS.MEETING_EDIT,
        ACTIONS.MEETING_DELETE,
        ACTIONS.MEETING_RECORD,
        ACTIONS.MEETING_EDIT_TRANSCRIPT,
        ACTIONS.MEETING_EXPORT_PDF,
        ACTIONS.MEETING_VIEW,
        ACTIONS.FILE_UPLOAD,
        ACTIONS.FILE_DELETE,
        ACTIONS.FILE_VIEW
    ],

    [PROJECT_ROLES.CONTRIBUTOR]: [
        ACTIONS.PROJECT_VIEW,
        ACTIONS.TASK_CREATE,
        ACTIONS.TASK_EDIT, // Only own tasks in practice
        ACTIONS.TASK_COMPLETE,
        ACTIONS.TASK_VIEW,
        ACTIONS.MEETING_VIEW,
        ACTIONS.MEETING_RECORD,
        ACTIONS.MEETING_EDIT_TRANSCRIPT,
        ACTIONS.MEETING_EXPORT_PDF,
        ACTIONS.FILE_UPLOAD,
        ACTIONS.FILE_VIEW
    ],

    [PROJECT_ROLES.VIEWER]: [
        ACTIONS.PROJECT_VIEW,
        ACTIONS.TASK_VIEW,
        ACTIONS.MEETING_VIEW,
        ACTIONS.FILE_VIEW
    ]
};

// ============ PERMISSION CHECKING FUNCTIONS ============

/**
 * Check if a role has permission to perform an action
 * @param {string} role - The user's project role
 * @param {string} action - The action to check
 * @returns {boolean} Whether the role has permission
 */
export function hasPermission(role, action) {
    if (!role || !action) return false;
    const permissions = PERMISSION_MATRIX[role] || [];
    return permissions.includes(action);
}

/**
 * Get all permissions for a role
 * @param {string} role - The project role
 * @returns {string[]} Array of allowed actions
 */
export function getRolePermissions(role) {
    return PERMISSION_MATRIX[role] || [];
}

/**
 * Check if role A has higher or equal permissions than role B
 * @param {string} roleA - First role
 * @param {string} roleB - Second role
 * @returns {boolean} True if roleA >= roleB in hierarchy
 */
export function isRoleHigherOrEqual(roleA, roleB) {
    const indexA = PROJECT_ROLE_HIERARCHY.indexOf(roleA);
    const indexB = PROJECT_ROLE_HIERARCHY.indexOf(roleB);
    if (indexA === -1 || indexB === -1) return false;
    return indexA <= indexB;
}

/**
 * Get roles that a user can assign (only roles lower than their own)
 * @param {string} currentRole - The user's current role
 * @returns {string[]} Array of assignable roles
 */
export function getAssignableRoles(currentRole) {
    const currentIndex = PROJECT_ROLE_HIERARCHY.indexOf(currentRole);
    if (currentIndex === -1) return [];

    // Can only assign roles below their level (higher index)
    return PROJECT_ROLE_HIERARCHY.slice(currentIndex + 1);
}

// ============ CONVENIENCE FUNCTIONS ============

export function canViewProject(role) {
    return hasPermission(role, ACTIONS.PROJECT_VIEW);
}

export function canEditProject(role) {
    return hasPermission(role, ACTIONS.PROJECT_EDIT);
}

export function canDeleteProject(role) {
    return hasPermission(role, ACTIONS.PROJECT_DELETE);
}

export function canManageMembers(role) {
    return hasPermission(role, ACTIONS.PROJECT_MANAGE_MEMBERS);
}

export function canCreateTask(role) {
    return hasPermission(role, ACTIONS.TASK_CREATE);
}

export function canEditTask(role) {
    return hasPermission(role, ACTIONS.TASK_EDIT);
}

export function canDeleteTask(role) {
    return hasPermission(role, ACTIONS.TASK_DELETE);
}

export function canAssignTask(role) {
    return hasPermission(role, ACTIONS.TASK_ASSIGN);
}

export function canCreateMeeting(role) {
    return hasPermission(role, ACTIONS.MEETING_CREATE);
}

export function canRecordMeeting(role) {
    return hasPermission(role, ACTIONS.MEETING_RECORD);
}

export function canEditTranscript(role) {
    return hasPermission(role, ACTIONS.MEETING_EDIT_TRANSCRIPT);
}

export function canExportPDF(role) {
    return hasPermission(role, ACTIONS.MEETING_EXPORT_PDF);
}

// ============ ROLE BADGE COLORS ============
export const ROLE_COLORS = {
    [PROJECT_ROLES.OWNER]: 'bg-purple-100 text-purple-700',
    [PROJECT_ROLES.MANAGER]: 'bg-blue-100 text-blue-700',
    [PROJECT_ROLES.CONTRIBUTOR]: 'bg-green-100 text-green-700',
    [PROJECT_ROLES.VIEWER]: 'bg-gray-100 text-gray-600'
};
