/**
 * Task Management Service for TaskNest
 * Handles task creation, retrieval, updates, and deletion.
 * Uses localStorage for persistence.
 */

import { getTodayISO, getRelativeDate, isToday } from '../utils/dateUtils';

const STORAGE_KEY = 'tasknest_tasks';
const DELAY_MS = 300; // Simulate network delay

function getDefaultTasks() {
    return [
        {
            id: 1,
            title: 'Design System Update',
            description: 'Review new color palette',
            priority: 'High',
            date: getTodayISO(),
            completed: true
        },
        {
            id: 2,
            title: 'Client Meeting Prep',
            description: 'Prepare slides for Q3 review',
            priority: 'Medium',
            date: getRelativeDate(1),
            completed: false
        },
        {
            id: 3,
            title: 'Send Weekly Report',
            description: 'Compile metrics',
            priority: 'Low',
            date: getRelativeDate(4),
            completed: false
        },
    ];
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all tasks
 */
export async function getTasks() {
    await delay(DELAY_MS);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize defaults if empty
    const defaults = getDefaultTasks();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
}

/**
 * Add a new task
 */
export async function addTask(taskData) {
    await delay(DELAY_MS);
    const tasks = await getTasks();
    const newTask = {
        id: Date.now(),
        ...taskData,
        date: taskData.dueDate || taskData.date || getTodayISO(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    const updatedTasks = [newTask, ...tasks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    return newTask;
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId) {
    await delay(DELAY_MS / 2);
    const tasks = await getTasks();
    const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    return updatedTasks.find(t => t.id === taskId);
}

/**
 * Update a task
 */
export async function updateTask(taskId, updates) {
    await delay(DELAY_MS);
    const tasks = await getTasks();
    const index = tasks.findIndex(t => t.id === taskId);

    if (index === -1) throw new Error('Task not found');

    tasks[index] = { ...tasks[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return tasks[index];
}

/**
 * Delete a task
 */
export async function deleteTask(taskId) {
    await delay(DELAY_MS);
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
}

/**
 * Get task counts for dashboard
 */
export async function getTaskStats() {
    const tasks = await getTasks();
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        pending: tasks.filter(t => !t.completed).length,
        today: tasks.filter(t => isToday(t.date || t.dueDate) && !t.completed).length
    };
}
