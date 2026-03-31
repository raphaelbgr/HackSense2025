// Score queue system with background retry and localStorage persistence

const QUEUE_KEY = 'pending_scores';
const FLUSH_INTERVAL = 5000; // Try to flush every 5 seconds

class ScoreQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.isFlushing = false;
    this.startWorker();
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading score queue:', error);
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving score queue:', error);
    }
  }

  // Add score to queue
  addScore(name, email, score) {
    const entry = {
      id: Date.now() + Math.random(), // Unique ID
      name,
      email,
      score,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    this.queue.push(entry);
    this.saveQueue();

    // Try to flush immediately
    this.flush();

    return entry.id;
  }

  // Remove score from queue
  removeScore(id) {
    this.queue = this.queue.filter(entry => entry.id !== id);
    this.saveQueue();
  }

  // Try to send all pending scores
  async flush() {
    if (this.isFlushing || this.queue.length === 0) return;

    this.isFlushing = true;

    const toSend = [...this.queue];

    for (const entry of toSend) {
      try {
        entry.attempts++;

        const response = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: entry.name,
            email: entry.email,
            score: entry.score
          })
        });

        if (response.ok) {
          // Success - remove from queue
          console.log('✅ Score sent successfully:', entry);
          this.removeScore(entry.id);
        } else {
          // Server error - keep in queue, will retry
          console.log('⚠️ Score send failed (will retry):', entry);
          this.saveQueue(); // Update attempt count
        }
      } catch (error) {
        // Network error - keep in queue, will retry
        console.log('❌ Network error sending score (will retry):', entry, error);
        this.saveQueue(); // Update attempt count
      }
    }

    this.isFlushing = false;
  }

  // Start background worker
  startWorker() {
    setInterval(() => {
      this.flush();
    }, FLUSH_INTERVAL);

    // Also try to flush when online
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored - flushing score queue');
      this.flush();
    });
  }

  // Get pending count (for UI)
  getPendingCount() {
    return this.queue.length;
  }

  // Get queue status (for debugging)
  getStatus() {
    return {
      pending: this.queue.length,
      entries: this.queue.map(e => ({
        name: e.name,
        score: e.score,
        attempts: e.attempts,
        timestamp: e.timestamp
      }))
    };
  }
}

// Create singleton instance
export const scoreQueue = new ScoreQueue();
