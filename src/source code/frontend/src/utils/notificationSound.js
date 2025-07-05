// Notification sound utility
class NotificationSound {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
        
        // Initialize audio context
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported:', error);
        }
    }

    // Play notification sound using Web Audio API
    playNotificationSound() {
        if (!this.enabled || !this.audioContext) {
            return;
        }

        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            // Create oscillator for notification sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Configure sound
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800Hz
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1); // Drop to 600Hz

            // Configure volume envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

            // Play sound
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);

        } catch (error) {
            console.warn('Error playing notification sound:', error);
        }
    }

    // Play message sent sound (different tone)
    playMessageSentSound() {
        if (!this.enabled || !this.audioContext) {
            return;
        }

        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Higher pitch for sent messages
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);

        } catch (error) {
            console.warn('Error playing message sent sound:', error);
        }
    }

    // Enable/disable sounds
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    // Set volume (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Check if audio is supported
    isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }

    // Request permission for notifications (for desktop notifications)
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    // Show desktop notification
    showDesktopNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });

            // Auto close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            return notification;
        }
        return null;
    }
}

// Create singleton instance
const notificationSound = new NotificationSound();

export default notificationSound;
