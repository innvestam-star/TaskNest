/**
 * Mock AI Service for NestAI
 * Simulates AI productivity assistant responses
 */

// Simulated delay to mimic API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Predefined responses for common prompts
const goalBreakdownTemplates = {
    exam: [
        { title: 'Review course syllabus', priority: 'High', duration: '30 min' },
        { title: 'Create study schedule', priority: 'High', duration: '20 min' },
        { title: 'Gather study materials', priority: 'Medium', duration: '45 min' },
        { title: 'Review Chapter 1-3', priority: 'High', duration: '2 hours' },
        { title: 'Complete practice problems', priority: 'Medium', duration: '1.5 hours' },
        { title: 'Take practice test', priority: 'High', duration: '1 hour' },
        { title: 'Review weak areas', priority: 'Medium', duration: '1 hour' },
    ],
    presentation: [
        { title: 'Define presentation goals', priority: 'High', duration: '15 min' },
        { title: 'Outline key points', priority: 'High', duration: '30 min' },
        { title: 'Research supporting data', priority: 'Medium', duration: '1 hour' },
        { title: 'Create slide deck', priority: 'High', duration: '2 hours' },
        { title: 'Add visuals and graphics', priority: 'Medium', duration: '45 min' },
        { title: 'Practice run-through', priority: 'High', duration: '30 min' },
    ],
    project: [
        { title: 'Define project scope', priority: 'High', duration: '30 min' },
        { title: 'Break into milestones', priority: 'High', duration: '45 min' },
        { title: 'Assign resources', priority: 'Medium', duration: '30 min' },
        { title: 'Set up project tracking', priority: 'Low', duration: '20 min' },
        { title: 'Create timeline', priority: 'High', duration: '30 min' },
        { title: 'Schedule kickoff meeting', priority: 'Medium', duration: '15 min' },
    ],
    default: [
        { title: 'Define your goal clearly', priority: 'High', duration: '15 min' },
        { title: 'Identify required steps', priority: 'High', duration: '30 min' },
        { title: 'Prioritize tasks', priority: 'Medium', duration: '20 min' },
        { title: 'Set deadlines', priority: 'High', duration: '15 min' },
        { title: 'Begin first action', priority: 'High', duration: '1 hour' },
    ],
};

// Detect goal type from user input
function detectGoalType(input) {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('exam') || lowerInput.includes('study') || lowerInput.includes('test')) {
        return 'exam';
    }
    if (lowerInput.includes('presentation') || lowerInput.includes('slides') || lowerInput.includes('pitch')) {
        return 'presentation';
    }
    if (lowerInput.includes('project') || lowerInput.includes('launch') || lowerInput.includes('build')) {
        return 'project';
    }
    return 'default';
}

/**
 * Simulates AI breaking down a goal into tasks
 * @param {string} goalInput - User's goal description
 * @returns {Promise<{message: string, tasks: Array}>}
 */
export async function breakDownGoal(goalInput) {
    await delay(1500 + Math.random() * 1000); // Simulate network delay

    const goalType = detectGoalType(goalInput);
    const tasks = goalBreakdownTemplates[goalType];

    return {
        message: `I've analyzed your goal and created a plan with ${tasks.length} actionable steps. Each task is prioritized and has an estimated duration. Would you like me to add these to your task list?`,
        tasks,
        goalType,
    };
}

/**
 * Simulates AI planning the user's day
 * @returns {Promise<{message: string, schedule: Array}>}
 */
export async function planMyDay() {
    await delay(1200 + Math.random() * 800);

    const schedule = [
        { time: '9:00 AM', task: 'Check emails and messages', type: 'task' },
        { time: '9:30 AM', task: 'Focus work: High priority tasks', type: 'focus' },
        { time: '11:00 AM', task: 'Team standup meeting', type: 'meeting' },
        { time: '11:30 AM', task: 'Continue focus work', type: 'focus' },
        { time: '12:30 PM', task: 'Lunch break', type: 'break' },
        { time: '1:30 PM', task: 'Collaborative work', type: 'task' },
        { time: '3:00 PM', task: 'Quick break', type: 'break' },
        { time: '3:15 PM', task: 'Administrative tasks', type: 'task' },
        { time: '4:30 PM', task: 'Wrap-up and plan tomorrow', type: 'task' },
    ];

    return {
        message: `Here's an optimized schedule for your day based on your tasks and appointments. I've balanced focus time with breaks and meetings.`,
        schedule,
    };
}

/**
 * Handles general AI conversation
 * @param {string} input - User's message
 * @returns {Promise<string>}
 */
export async function chat(input) {
    await delay(800 + Math.random() * 600);

    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello! I'm NestAI, your productivity assistant. How can I help you today? Try asking me to break down a goal or plan your day.";
    }
    if (lowerInput.includes('thank')) {
        return "You're welcome! I'm here to help you stay productive. Let me know if you need anything else.";
    }
    if (lowerInput.includes('help')) {
        return "I can help you with:\n• Breaking down large goals into tasks\n• Planning your day optimally\n• Suggesting best times for tasks\n• Rescheduling missed items\n\nJust tell me what you need!";
    }

    return "I understand you're looking for productivity help. Could you tell me more about what you'd like to accomplish? For example, try saying 'I need to prepare for an exam' or 'Plan my day'.";
}

/**
 * Suggests the best time to schedule a task based on calendar availability
 * Integrates with schedulingService for smart recommendations
 * @param {string} taskDescription - Description of the task
 * @returns {Promise<Object>} Best time suggestions
 */
export async function suggestBestTime(taskDescription) {
    await delay(1000 + Math.random() * 500);

    // Mock smart time suggestions based on task type
    const lowerDesc = taskDescription.toLowerCase();
    let priority = 'medium';
    let duration = 60;

    if (lowerDesc.includes('urgent') || lowerDesc.includes('important')) {
        priority = 'high';
    }
    if (lowerDesc.includes('quick') || lowerDesc.includes('brief')) {
        duration = 15;
    } else if (lowerDesc.includes('focus') || lowerDesc.includes('deep work')) {
        duration = 120;
    }

    // Generate time slot suggestions
    const suggestions = [
        {
            slot: '9:00 AM - 10:00 AM',
            reason: 'Morning hours are optimal for focused work when energy levels are highest.',
            confidence: 0.92,
        },
        {
            slot: '2:00 PM - 3:00 PM',
            reason: 'Post-lunch slot with no conflicts detected in your calendar.',
            confidence: 0.85,
        },
        {
            slot: 'Tomorrow 10:00 AM',
            reason: 'If today is packed, tomorrow morning offers a clear block.',
            confidence: 0.78,
        },
    ];

    return {
        message: `Based on your task "${taskDescription}", I found ${suggestions.length} optimal time slots. The best option is ${suggestions[0].slot}.`,
        suggestions,
        taskDetails: {
            estimatedDuration: duration,
            suggestedPriority: priority,
        },
    };
}

/**
 * Analyzes the workload for a given day
 * @param {Date} date - Optional date to analyze (defaults to today)
 * @returns {Promise<Object>} Workload analysis
 */
export async function analyzeDayLoad(date = new Date()) {
    await delay(800 + Math.random() * 400);

    // Mock workload analysis
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const mockEvents = [
        { title: 'Team standup', duration: 30 },
        { title: 'Client call', duration: 60 },
        { title: 'Focus time', duration: 120 },
    ];

    const totalScheduled = mockEvents.reduce((sum, e) => sum + e.duration, 0);
    const availableTime = 480 - totalScheduled; // 8 working hours = 480 min
    const utilizationPercent = Math.round((totalScheduled / 480) * 100);

    let status = 'balanced';
    let recommendation = '';

    if (utilizationPercent > 80) {
        status = 'overloaded';
        recommendation = 'Your day looks packed! Consider rescheduling non-urgent items or delegating tasks.';
    } else if (utilizationPercent > 60) {
        status = 'busy';
        recommendation = 'A productive day ahead. Make sure to take short breaks between tasks.';
    } else if (utilizationPercent < 30) {
        status = 'light';
        recommendation = 'You have plenty of open time. Great opportunity for deep work or tackling backlog items.';
    } else {
        recommendation = 'Your schedule looks well-balanced with a good mix of meetings and focus time.';
    }

    return {
        message: `Your ${dayName} is ${status} with ${utilizationPercent}% of your time scheduled.`,
        analysis: {
            date: date.toISOString().split('T')[0],
            dayName,
            status,
            totalScheduledMinutes: totalScheduled,
            availableMinutes: availableTime,
            utilizationPercent,
            eventCount: mockEvents.length,
        },
        recommendation,
        events: mockEvents,
    };
}

/**
 * Provides smart scheduling recommendations when user asks about timing
 * @param {string} input - User's scheduling query
 * @returns {Promise<Object>} Scheduling assistance response
 */
export async function handleSchedulingQuery(input) {
    await delay(900 + Math.random() * 500);

    const lowerInput = input.toLowerCase();

    // Detect scheduling intent
    if (lowerInput.includes('best time') || lowerInput.includes('when should')) {
        return await suggestBestTime(input);
    }

    if (lowerInput.includes('busy') || lowerInput.includes('overloaded') || lowerInput.includes('how is my day')) {
        return await analyzeDayLoad();
    }

    if (lowerInput.includes('reschedule') || lowerInput.includes('move')) {
        return {
            message: "I can help you reschedule. Which task or meeting would you like to move, and do you have a preferred new time?",
            action: 'reschedule_prompt',
        };
    }

    if (lowerInput.includes('focus') || lowerInput.includes('block')) {
        const suggestion = await suggestBestTime('2-hour focus block');
        return {
            ...suggestion,
            message: "I found some great slots for focused work. " + suggestion.message,
        };
    }

    return {
        message: "I can help with scheduling! Try asking:\n• 'When is the best time for a meeting?'\n• 'How busy is my day?'\n• 'Schedule a 2-hour focus block'\n• 'Help me reschedule a task'",
        action: 'show_options',
    };
}

// ============ MEETING TRANSCRIPT ANALYSIS ============

/**
 * Generate AI-powered meeting summary from transcript
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @returns {Promise<Object>} Structured meeting summary
 */
export async function generateMeetingSummary(transcriptParts) {
    await delay(1500 + Math.random() * 1000);

    const fullText = transcriptParts.map(p => p.text).join(' ').toLowerCase();

    // Extract key topics based on content analysis
    const topics = [];
    if (fullText.includes('project') || fullText.includes('timeline')) topics.push('Project Updates');
    if (fullText.includes('budget') || fullText.includes('cost')) topics.push('Budget Discussion');
    if (fullText.includes('deadline') || fullText.includes('due')) topics.push('Timeline & Deadlines');
    if (fullText.includes('team') || fullText.includes('resource')) topics.push('Team & Resources');
    if (fullText.includes('client') || fullText.includes('customer')) topics.push('Client Relations');
    if (fullText.includes('issue') || fullText.includes('problem')) topics.push('Issues & Challenges');
    if (topics.length === 0) topics.push('General Discussion');

    // Generate executive summary bullets
    const summaryBullets = [
        `Meeting covered ${topics.length} main topic${topics.length > 1 ? 's' : ''}: ${topics.join(', ')}.`,
        `Duration: approximately ${Math.ceil(transcriptParts.length * 0.5)} minutes of discussion.`,
        `${transcriptParts.length} distinct conversation segments recorded.`,
    ];

    // Add contextual bullets based on content
    if (fullText.includes('agree') || fullText.includes('decided')) {
        summaryBullets.push('Key decisions were made during this meeting.');
    }
    if (fullText.includes('next') || fullText.includes('action') || fullText.includes('will')) {
        summaryBullets.push('Action items were identified for follow-up.');
    }
    if (fullText.includes('concern') || fullText.includes('risk') || fullText.includes('worry')) {
        summaryBullets.push('Some concerns or risks were raised that need attention.');
    }

    return {
        executiveSummary: summaryBullets.slice(0, 7), // Max 7 bullets
        topics,
        confidence: 0.85,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Extract action items from transcript
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @returns {Promise<Array>} Array of action items
 */
export async function extractActionItems(transcriptParts) {
    await delay(1200 + Math.random() * 800);

    const actionItems = [];
    const actionKeywords = ['will', 'need to', 'should', 'going to', 'have to', 'must', 'action', 'task', 'follow up', 'let me', "i'll"];

    for (const part of transcriptParts) {
        const text = part.text.toLowerCase();

        // Check if this segment contains action language
        const hasActionKeyword = actionKeywords.some(keyword => text.includes(keyword));

        if (hasActionKeyword && text.length > 20) {
            // Determine priority based on language
            let priority = 'Medium';
            if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
                priority = 'High';
            } else if (text.includes('eventually') || text.includes('when possible') || text.includes('low priority')) {
                priority = 'Low';
            }

            // Try to extract assignee
            let assignee = 'Unassigned';
            if (text.includes(' i ') || text.startsWith('i ') || text.includes("i'll") || text.includes('i will')) {
                assignee = 'Speaker';
            } else if (text.includes('we ') || text.includes("we'll")) {
                assignee = 'Team';
            }

            // Infer due date
            let dueDate = null;
            if (text.includes('today')) dueDate = 'Today';
            else if (text.includes('tomorrow')) dueDate = 'Tomorrow';
            else if (text.includes('this week')) dueDate = 'This Week';
            else if (text.includes('next week')) dueDate = 'Next Week';

            actionItems.push({
                id: `action_${Date.now()}_${actionItems.length}`,
                title: part.text.slice(0, 100) + (part.text.length > 100 ? '...' : ''),
                fullText: part.text,
                timestamp: part.timestamp,
                priority,
                assignee,
                dueDate,
                confidence: 0.75 + Math.random() * 0.2,
                status: 'pending'
            });
        }
    }

    // Limit to top 10 most confident items
    return actionItems
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);
}

/**
 * Extract key decisions from transcript
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @returns {Promise<Array>} Array of decisions
 */
export async function extractDecisions(transcriptParts) {
    await delay(800 + Math.random() * 500);

    const decisions = [];
    const decisionKeywords = ['decided', 'agreed', 'approved', 'confirmed', 'finalized', 'going with', 'chose', 'selected'];

    for (const part of transcriptParts) {
        const text = part.text.toLowerCase();

        const hasDecisionKeyword = decisionKeywords.some(keyword => text.includes(keyword));

        if (hasDecisionKeyword) {
            decisions.push({
                id: `decision_${Date.now()}_${decisions.length}`,
                text: part.text,
                timestamp: part.timestamp,
                confidence: 0.70 + Math.random() * 0.25
            });
        }
    }

    return decisions.slice(0, 5);
}

/**
 * Extract risks and blockers from transcript
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @returns {Promise<Array>} Array of risks
 */
export async function extractRisksAndBlockers(transcriptParts) {
    await delay(700 + Math.random() * 400);

    const risks = [];
    const riskKeywords = ['risk', 'concern', 'worry', 'problem', 'issue', 'blocker', 'blocked', 'delay', 'late', 'behind'];

    for (const part of transcriptParts) {
        const text = part.text.toLowerCase();

        const hasRiskKeyword = riskKeywords.some(keyword => text.includes(keyword));

        if (hasRiskKeyword) {
            // Determine severity
            let severity = 'Medium';
            if (text.includes('critical') || text.includes('major') || text.includes('serious')) {
                severity = 'High';
            } else if (text.includes('minor') || text.includes('small')) {
                severity = 'Low';
            }

            risks.push({
                id: `risk_${Date.now()}_${risks.length}`,
                text: part.text,
                timestamp: part.timestamp,
                severity,
                confidence: 0.65 + Math.random() * 0.25
            });
        }
    }

    return risks.slice(0, 5);
}

/**
 * Extract open questions from transcript
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @returns {Promise<Array>} Array of open questions
 */
export async function extractOpenQuestions(transcriptParts) {
    await delay(600 + Math.random() * 300);

    const questions = [];

    for (const part of transcriptParts) {
        const text = part.text;

        // Check for question marks or question words
        if (text.includes('?') ||
            text.toLowerCase().startsWith('how') ||
            text.toLowerCase().startsWith('what') ||
            text.toLowerCase().startsWith('when') ||
            text.toLowerCase().startsWith('where') ||
            text.toLowerCase().startsWith('who') ||
            text.toLowerCase().startsWith('why')) {

            questions.push({
                id: `question_${Date.now()}_${questions.length}`,
                text: text,
                timestamp: part.timestamp,
                answered: false
            });
        }
    }

    return questions.slice(0, 5);
}

/**
 * Generate complete meeting analysis
 * @param {Array} transcriptParts - Array of transcript parts with timestamps
 * @param {Object} meetingMetadata - Meeting metadata (title, date, attendees)
 * @returns {Promise<Object>} Complete meeting analysis
 */
export async function analyzeMeeting(transcriptParts, meetingMetadata = {}) {
    await delay(500);

    const [summary, actionItems, decisions, risks, questions] = await Promise.all([
        generateMeetingSummary(transcriptParts),
        extractActionItems(transcriptParts),
        extractDecisions(transcriptParts),
        extractRisksAndBlockers(transcriptParts),
        extractOpenQuestions(transcriptParts)
    ]);

    return {
        metadata: {
            ...meetingMetadata,
            analyzedAt: new Date().toISOString(),
            transcriptLength: transcriptParts.length
        },
        summary,
        actionItems,
        decisions,
        risks,
        questions,
        overallConfidence: (
            summary.confidence +
            (actionItems.reduce((sum, a) => sum + a.confidence, 0) / Math.max(actionItems.length, 1))
        ) / 2
    };
}

