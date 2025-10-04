// Encouragement Module - Supportive, non-judgmental messaging

class EncouragementManager {
    constructor() {
        this.messages = [
            "You've got this! Let's take it one step at a time.",
            "Every small step is progress. Be proud of what you accomplish.",
            "Remember: progress, not perfection.",
            "You're doing great just by being here.",
            "It's okay to start small. Small steps lead to big changes.",
            "Your effort matters, no matter how small it seems.",
            "Take your time. There's no rush.",
            "You're stronger than you think.",
            "Be kind to yourself today.",
            "Celebrate every win, no matter how small.",
            "You don't have to do everything at once.",
            "Rest is productive too. Take breaks when you need them.",
            "You're making progress even when it doesn't feel like it.",
            "Some days are harder than others, and that's okay.",
            "You're doing the best you can, and that's enough.",
            "Focus on what you can control.",
            "It's okay to adjust your goals based on how you're feeling.",
            "You're not behind. You're exactly where you need to be.",
            "Give yourself credit for showing up.",
            "Your worth isn't measured by your productivity."
        ];

        this.completionMessages = [
            "Fantastic! You did it! 🎉",
            "Great job! Keep up the momentum!",
            "Wonderful work! You should be proud!",
            "Amazing! Another task completed!",
            "You're on fire! Keep going!",
            "Excellent progress! Well done!",
            "You're making it happen! Great work!",
            "Brilliant! That's one more off the list!",
            "You're unstoppable today!",
            "Nice work! Celebrate this win!"
        ];

        this.enabled = true;
    }

    getRandomMessage() {
        return this.messages[Math.floor(Math.random() * this.messages.length)];
    }

    getCompletionMessage() {
        return this.completionMessages[Math.floor(Math.random() * this.completionMessages.length)];
    }

    getEnergySpecificMessage(energyLevel) {
        const energyMessages = {
            low: [
                "It's okay to take it slow today. Focus on the essentials.",
                "Be gentle with yourself. Small wins count.",
                "Low energy days are valid. Do what you can.",
                "Rest is part of the process. Take care of yourself.",
                "Focus on survival mode tasks today. That's enough."
            ],
            medium: [
                "You've got a good balance today. Keep steady.",
                "Nice! You're finding your rhythm.",
                "You're doing well. Keep this comfortable pace.",
                "This is a good day for making progress.",
                "You're managing your energy wisely."
            ],
            high: [
                "You're feeling energized! Great day to tackle bigger tasks.",
                "Ride this wave of energy! You can do a lot today.",
                "Fantastic energy! Make the most of it.",
                "You're powered up and ready! Let's go!",
                "This is your time to shine!"
            ]
        };

        const messages = energyMessages[energyLevel] || energyMessages.medium;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    updateEncouragementDisplay() {
        const encouragementText = document.getElementById('encouragement-text');
        if (encouragementText && this.enabled) {
            encouragementText.textContent = this.getRandomMessage();
        }
    }

    updateForEnergyLevel(energyLevel) {
        const encouragementText = document.getElementById('encouragement-text');
        if (encouragementText && this.enabled) {
            encouragementText.textContent = this.getEnergySpecificMessage(energyLevel);
        }
    }

    showToast(message, duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    showCompletionCelebration(task) {
        if (!this.enabled) return;

        // Show toast
        this.showToast(this.getCompletionMessage());

        // Create confetti effect
        if (modeManager.currentMode === 'gamified') {
            this.createConfetti();
        }

        // Add celebration animation to task
        const taskElements = document.querySelectorAll('.task-item');
        taskElements.forEach(el => {
            if (el.textContent.includes(task.title)) {
                el.classList.add('celebrating');
                setTimeout(() => el.classList.remove('celebrating'), 500);
            }
        });
    }

    createConfetti() {
        const colors = ['#6750A4', '#7D5260', '#625B71', '#FFD700', '#FF6B9D'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 3000);
            }, i * 30);
        }
    }

    async loadSettings() {
        const enabled = await storage.getSetting('encouragementEnabled');
        if (enabled !== undefined) {
            this.enabled = enabled;
        }
    }

    async setEnabled(enabled) {
        this.enabled = enabled;
        await storage.setSetting('encouragementEnabled', enabled);
        
        const encouragementDiv = document.getElementById('encouragement');
        if (encouragementDiv) {
            encouragementDiv.style.display = enabled ? 'flex' : 'none';
        }
    }

    // Rotate message periodically
    startRotation(intervalMinutes = 5) {
        setInterval(() => {
            if (this.enabled) {
                this.updateEncouragementDisplay();
            }
        }, intervalMinutes * 60 * 1000);
    }
}

// Global encouragement manager instance
const encouragementManager = new EncouragementManager();
