// AI-Powered Task Breakdown
// LLM-based implementation with fallback to local patterns
// Supports self-hosted LLMs and browser-based models for privacy

class AIBreakdown {
    constructor() {
        this.llmEndpoint = null; // User can configure their own LLM endpoint
        this.llmApiKey = null;
        this.useLLM = false;
        
        // Fallback patterns if LLM is not available
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

    async breakdown(taskText) {
        // Try LLM-based breakdown first if configured
        if (this.useLLM && this.llmEndpoint) {
            try {
                return await this.llmBreakdown(taskText);
            } catch (error) {
                console.warn('LLM breakdown failed, falling back to pattern matching:', error);
            }
        }
        
        // Fallback to pattern matching
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

    async llmBreakdown(taskText) {
        const prompt = `Break down the following task into smaller, actionable subtasks. Return only a JSON array of subtask titles, nothing else.

Task: "${taskText}"

Return format: ["subtask 1", "subtask 2", ...]`;

        const response = await fetch(this.llmEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.llmApiKey && { 'Authorization': `Bearer ${this.llmApiKey}` })
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Can be configured
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that breaks down tasks into smaller, actionable subtasks. Always respond with a valid JSON array of strings.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        let subtaskTitles;

        // Parse response (different APIs have different formats)
        if (data.choices && data.choices[0]?.message?.content) {
            // OpenAI-compatible format
            const content = data.choices[0].message.content.trim();
            // Extract JSON array from response
            const jsonMatch = content.match(/\[.*\]/s);
            if (jsonMatch) {
                subtaskTitles = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse LLM response');
            }
        } else if (Array.isArray(data)) {
            // Direct array response
            subtaskTitles = data;
        } else {
            throw new Error('Unexpected LLM response format');
        }

        return subtaskTitles.map(title => ({
            title: title.trim(),
            parent: taskText,
            completed: false,
            energyLevel: this.suggestEnergyLevel(title),
            isSurvival: this.suggestSurvival(title)
        }));
    }

    // Configuration methods
    configureLLM(endpoint, apiKey = null) {
        this.llmEndpoint = endpoint;
        this.llmApiKey = apiKey;
        this.useLLM = true;
        
        // Save to storage
        storage.setSetting('llmEndpoint', endpoint);
        if (apiKey) {
            storage.setSetting('llmApiKey', apiKey);
        }
    }

    async loadLLMConfig() {
        const endpoint = await storage.getSetting('llmEndpoint');
        const apiKey = await storage.getSetting('llmApiKey');
        
        if (endpoint) {
            this.llmEndpoint = endpoint;
            this.llmApiKey = apiKey;
            this.useLLM = true;
        }
    }

    disableLLM() {
        this.useLLM = false;
    }

    enableLLM() {
        if (this.llmEndpoint) {
            this.useLLM = true;
        }
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
