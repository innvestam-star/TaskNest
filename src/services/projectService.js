/**
 * Project Management Service for TaskNest
 * Handles project creation, retrieval, and team collaboration
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_PROJECTS = [
    {
        id: 'proj_1',
        name: 'Website Redesign',
        description: 'Overhaul of the corporate website with new branding.',
        color: '#3B82F6', // Blue
        status: 'active',
        progress: 65,
        members: [
            { id: 'u1', name: 'You', role: 'owner', avatar: null },
            { id: 'u2', name: 'Sarah', role: 'editor', avatar: null }
        ],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
        dueDate: new Date(Date.now() + 86400000 * 20).toISOString(), // 20 days from now
    },
    {
        id: 'proj_2',
        name: 'Mobile App Launch',
        description: 'Preparation for the Q3 mobile app release.',
        color: '#8B5CF6', // Purple
        status: 'active',
        progress: 30,
        members: [
            { id: 'u1', name: 'You', role: 'owner', avatar: null },
            { id: 'u3', name: 'Mike', role: 'viewer', avatar: null }
        ],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        dueDate: new Date(Date.now() + 86400000 * 45).toISOString(),
    }
];

/**
 * Get all projects for a user
 */
export async function getProjects() {
    await delay(300);
    const stored = localStorage.getItem('projects');
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize defaults if empty
    localStorage.setItem('projects', JSON.stringify(DEFAULT_PROJECTS));
    return DEFAULT_PROJECTS;
}

/**
 * Get a single project by ID
 */
export async function getProject(id) {
    await delay(200);
    const projects = await getProjects();
    return projects.find(p => p.id === id) || null;
}

/**
 * Create a new project
 */
export async function createProject(projectData) {
    await delay(500);
    const projects = await getProjects();

    const newProject = {
        id: `proj_${Date.now()}`,
        status: 'active',
        progress: 0,
        members: [{ id: 'u1', name: 'You', role: 'owner', avatar: null }],
        createdAt: new Date().toISOString(),
        ...projectData,
    };

    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    return newProject;
}

/**
 * Update a project
 */
export async function updateProject(id, updates) {
    await delay(300);
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Project not found');

    projects[index] = { ...projects[index], ...updates };
    localStorage.setItem('projects', JSON.stringify(projects));
    return projects[index];
}

/**
 * Delete a project
 */
export async function deleteProject(id) {
    await delay(300);
    const projects = await getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem('projects', JSON.stringify(filtered));
    return true;
}

/**
 * Add a member to a project
 */
export async function addMember(projectId, memberData) {
    await delay(300);
    const projects = await getProjects();
    const project = projects.find(p => p.id === projectId);

    if (!project) throw new Error('Project not found');

    const newMember = {
        id: `u_${Date.now()}`,
        avatar: null,
        ...memberData
    };

    project.members.push(newMember);
    localStorage.setItem('projects', JSON.stringify(projects));
    return newMember;
}

/**
 * Get tasks for a specific project
 * (In a real app, this would query the tasks collection with project_id)
 */
export async function getProjectTasks(projectId) {
    await delay(300);
    // Mocking project-specific tasks logic by filtering main task list
    // This assumes we'll update the main task service to support projectId later
    // For now, we return mock data or specific tasks if we had a unified store
    return [];
}
