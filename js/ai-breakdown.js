// AI-Powered Task Breakdown
// This is a client-side implementation using pattern matching and rules
// No external API calls for privacy

class AIBreakdown {
    constructor() {
        this.patterns = [
            // Travel/Vacation
            {
                keywords: ['vacation', 'trip', 'travel', 'visit'],
                subtasks: [
                    'Research destination',
                    'Set budget',
                    'Book transportation',
                    'Book accommodation',
                    'Plan activities',
                    'Pack essentials',
                    'Arrange pet/plant care'
                ]
            },
            // Shopping
            {
                keywords: ['shopping', 'buy', 'purchase', 'get groceries'],
                subtasks: [
                    'Make a list of needed items',
                    'Check budget',
                    'Research best prices',
                    'Go to store or order online',
                    'Put items away'
                ]
            },
            // Cleaning
            {
                keywords: ['clean', 'organize', 'tidy'],
                subtasks: [
                    'Gather cleaning supplies',
                    'Declutter the area',
                    'Dust surfaces',
                    'Vacuum or sweep',
                    'Wipe down surfaces',
                    'Take out trash'
                ]
            },
            // Cooking/Meal prep
            {
                keywords: ['cook', 'meal prep', 'dinner', 'lunch', 'breakfast'],
                subtasks: [
                    'Choose recipe',
                    'Check ingredients',
                    'Make shopping list',
                    'Prep ingredients',
                    'Cook meal',
                    'Clean up kitchen'
                ]
            },
            // Job search
            {
                keywords: ['job', 'career', 'employment', 'work'],
                subtasks: [
                    'Update resume',
                    'Write cover letter',
                    'Search job listings',
                    'Apply to positions',
                    'Follow up on applications',
                    'Prepare for interviews'
                ]
            },
            // Moving
            {
                keywords: ['move', 'relocate', 'new apartment', 'new house'],
                subtasks: [
                    'Find new place',
                    'Give notice to landlord',
                    'Hire movers or rent truck',
                    'Pack belongings',
                    'Update address',
                    'Transfer utilities',
                    'Unpack and organize'
                ]
            },
            // Event planning
            {
                keywords: ['party', 'event', 'celebration', 'birthday'],
                subtasks: [
                    'Set date and time',
                    'Create guest list',
                    'Send invitations',
                    'Plan menu/catering',
                    'Arrange venue',
                    'Buy decorations',
                    'Prepare activities',
                    'Day-of setup'
                ]
            },
            // Exercise/Fitness
            {
                keywords: ['exercise', 'workout', 'fitness', 'gym'],
                subtasks: [
                    'Set fitness goals',
                    'Choose workout routine',
                    'Prepare workout clothes',
                    'Schedule workout time',
                    'Do warm-up',
                    'Complete workout',
                    'Cool down and stretch'
                ]
            },
            // Learning/Study
            {
                keywords: ['learn', 'study', 'course', 'education'],
                subtasks: [
                    'Identify learning goals',
                    'Find resources/materials',
                    'Create study schedule',
                    'Take notes',
                    'Practice/do exercises',
                    'Review material',
                    'Test knowledge'
                ]
            },
            // Home maintenance
            {
                keywords: ['fix', 'repair', 'maintain', 'home improvement'],
                subtasks: [
                    'Identify the problem',
                    'Research solutions',
                    'Get necessary tools/parts',
                    'Watch tutorials if needed',
                    'Do the repair',
                    'Test the fix',
                    'Clean up'
                ]
            }
        ];
    }

    breakdown(taskText) {
        const lowerText = taskText.toLowerCase();
        
        // Find matching pattern
        for (const pattern of this.patterns) {
            for (const keyword of pattern.keywords) {
                if (lowerText.includes(keyword)) {
                    return this.createSubtasks(taskText, pattern.subtasks);
                }
            }
        }

        // Default breakdown for unmatched tasks
        return this.createGenericBreakdown(taskText);
    }

    createSubtasks(parentTask, subtaskList) {
        return subtaskList.map(subtask => ({
            title: subtask,
            parent: parentTask,
            completed: false,
            energyLevel: 'medium',
            isSurvival: false
        }));
    }

    createGenericBreakdown(taskText) {
        // Generic breakdown for tasks that don't match patterns
        return [
            {
                title: `Plan how to: ${taskText}`,
                parent: taskText,
                completed: false,
                energyLevel: 'low',
                isSurvival: false
            },
            {
                title: `Gather materials/info for: ${taskText}`,
                parent: taskText,
                completed: false,
                energyLevel: 'medium',
                isSurvival: false
            },
            {
                title: `Start working on: ${taskText}`,
                parent: taskText,
                completed: false,
                energyLevel: 'high',
                isSurvival: false
            },
            {
                title: `Complete and review: ${taskText}`,
                parent: taskText,
                completed: false,
                energyLevel: 'medium',
                isSurvival: false
            }
        ];
    }

    // Suggest energy level for a task based on keywords
    suggestEnergyLevel(taskText) {
        const lowerText = taskText.toLowerCase();
        
        const lowEnergyKeywords = ['review', 'read', 'check', 'list', 'plan', 'think'];
        const highEnergyKeywords = ['exercise', 'clean', 'organize', 'move', 'build', 'create'];
        
        for (const keyword of highEnergyKeywords) {
            if (lowerText.includes(keyword)) {
                return 'high';
            }
        }
        
        for (const keyword of lowEnergyKeywords) {
            if (lowerText.includes(keyword)) {
                return 'low';
            }
        }
        
        return 'medium';
    }

    // Suggest if task is survival/essential based on keywords
    suggestSurvival(taskText) {
        const lowerText = taskText.toLowerCase();
        
        const survivalKeywords = [
            'medicine', 'medication', 'doctor', 'appointment',
            'eat', 'food', 'groceries', 'meal',
            'pay', 'bill', 'rent', 'utilities',
            'work', 'job', 'meeting'
        ];
        
        for (const keyword of survivalKeywords) {
            if (lowerText.includes(keyword)) {
                return true;
            }
        }
        
        return false;
    }
}

// Global AI breakdown instance
const aiBreakdown = new AIBreakdown();
