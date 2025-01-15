/**
* Internal Timer implementation
* @private
*/
export class Timer {
    /**
    * @typedef {Object} TimerState
    * @property {number} startTime - When timer started
    * @property {number} remainingTime - Time left in pause
    * @property {number} timeoutId - System timeout ID
    * @property {boolean} isPaused - Pause state
    * @property {boolean} isCompleted - Completion state
    */
    
    /**
    * @typedef {Object} TimerConfig
    * @property {number} delay - Timer delay in milliseconds
    * @property {Object} [context] - Callback context
    * @property {Array} [args] - Callback arguments
    * @property {boolean} [autoStart=true] - Auto start after creation
    */
    
    /**
    * @param {Function} callback Timer callback
    * @param {TimerConfig} config Timer configuration
    * @private
    */
    constructor(callback, config = {}) {
        if (!callback || typeof callback !== 'function') {
            
            throw "Timer requires a callback function";
        }
        
        this.callback = callback;
        this.delay = config.delay || config?.delay === 0 ? config.delay : 1000;
        this.context = config.context || null;
        this.args = config.args || [];
        this.groups = new Set();
        
        /** @type {TimerState} */
        this.state = {
            startTime: 0,
            remainingTime: this.delay,
            timeoutId: null,
            isPaused: false,
            isCompleted: false
        };
        
        if (config.autoStart !== false) {
            this.start();
        }
        
        /**
        * @type {Set<Function>} Completion listeners
        * @private
        */
        this._onCompleteListeners = new Set();
    }
    
    
    /**
    * Cleans up timer state
    * @private
    */
    _cleanup() {
        this.state.timeoutId = null;
        this.state.startTime = 0;
        this.state.remainingTime = 0;
    }
    
    
    /**
    * Notifies all associated groups of completion
    * @private
    */
    _notifyGroups() {
        this.groups.forEach(group => {
            group.onTimerComplete(this);
        });
    }
    
    /**
    * Handles timer completion
    * @private
    */
    _handleComplete() {
        this.callback.apply(this.context, this.args);
        this.state.isCompleted = true;
        this._cleanup();
        this._notifyGroups();
        this._onCompleteListeners.forEach(listener => listener(this));
    }
    
    /**
    * Adds completion listener
    * @param {Function} listener Callback when timer completes
    * @returns {Timer}
    */
    onComplete(listener) {
        this._onCompleteListeners.add(listener);
        return this;
    }
    
    /**
    * Links this timer to one or more groups
    * @param {...Group} groups - Groups to link with
    * @returns {Timer}
    */
    link(...groups) {
        groups.forEach(group => {
            if (group instanceof Group) {
                this.groups.add(group);
                group.timers.add(this);
            }
        });
        return this;
    }
    
    /**
    * Unlinks this timer from one or more groups
    * @param {...Group} groups - Groups to unlink from
    * @returns {Timer}
    */
    unlink(...groups) {
        groups.forEach(group => {
            this.groups.delete(group);
            group.timers.delete(this);
        });
        return this;
    }
    
    /**
    * Starts or resumes the timer
    * @returns {Timer}
    */
    start() {
        if (!this.state.isPaused) {
            this.state.remainingTime = this.delay;
        }
        
        this.state.isPaused = false;
        this.state.startTime = performance.now();
        
        // Cas spécial pour un délai de 0
        if (this.delay === 0) {
            // Exécuter immédiatement de manière asynchrone
            
            queueMicrotask(() => {
                if (!this.state.isPaused) {
                    this._handleComplete();
                }
            });
        } else {
            this.state.timeoutId = setTimeout(() => {
                if (!this.state.isPaused) {
                    this._handleComplete();
                }
            }, this.state.remainingTime);
        }
        
        return this;
    }
    
    /**
    * Pauses the timer
    * @returns {Timer}
    */
    pause() {
        if (this.state.timeoutId && !this.state.isPaused) {
            clearTimeout(this.state.timeoutId);
            const elapsed = performance.now() - this.state.startTime;
            this.state.remainingTime = Math.max(0, this.state.remainingTime - elapsed);
            this.state.isPaused = true;
        }
        return this;
    }
    
    /**
    * Resets and optionally restarts the timer
    * @param {boolean} [autoStart=true] Auto start after reset
    * @returns {Timer}
    */
    reset(autoStart = true) {
        if (this.state.timeoutId) {
            clearTimeout(this.state.timeoutId);
        }
        
        this.state = {
            startTime: 0,
            remainingTime: this.delay,
            timeoutId: null,
            isPaused: false,
            isCompleted: false
        };
        
        if (autoStart) {
            this.start();
        }
        
        return this;
    }
    
    
    /**
    * Returns remaining time in milliseconds
    * @returns {number}
    */
    getRemainingTime() {
        if (this.state.isPaused) {
            return this.state.remainingTime;
        }
        const elapsed = performance.now() - this.state.startTime;
        return Math.max(0, this.state.remainingTime - elapsed);
    }
    
    /**
    * Checks if timer is active (started and not completed)
    * @returns {boolean}
    */
    isActive() {
        return !!this.state.timeoutId && !this.state.isCompleted;
    }
}

/**
* Internal Group implementation
* @private
*/
export class Group {
    /**
    * @param {Object} config Group configuration
    * @private
    */
    constructor(config = {}) {
        this.name = config.name || `group_${Date.now()}`;
        this.synchronous = config.synchronous || false;
        this.timers = new Set();
        this._completedTimers = new Set();
        this._onAllCompleteListeners = new Set();
    }
    
    /**
    * Handles timer completion notification
    * @param {Timer} timer Completed timer
    * @private
    */
    onTimerComplete(timer) {
        this._completedTimers.add(timer);
        
        // Vérifier si tous les timers sont complétés immédiatement après l'ajout
        if (Array.from(this.timers).every(t => t.state.isCompleted)) {
            this._onAllCompleteListeners.forEach(listener => listener(this));
            this._completedTimers.clear();
        }
    }
    
    /**
    * Adds listener for when all timers complete
    * @param {Function} listener Callback when all complete
    * @returns {Group}
    */
    onAllComplete(listener) {
        this._onAllCompleteListeners.add(listener);
        return this;
    }
    
    /**
    * Adds a timer to the group
    * @param {Timer} timer Timer instance
    * @returns {Group}
    */
    add(timer) {
        this.timers.add(timer);
        timer.groups.add(this);
        return this;
    }
    
    /**
    * Starts all timers in the group
    * @returns {Group}
    */
    startAll() {
        if (this.synchronous) {
            // TODO: Implement sequential execution
        } else {
            for (const timer of this.timers) {
                timer.start();
            }
        }
        return this;
    }
    
    /**
    * Pauses all timers in the group
    * @returns {Group}
    */
    pauseAll() {
        for (const timer of this.timers) {
            timer.pause();
        }
        return this;
    }
    
    /**
    * Resets all timers in the group
    * @param {boolean} [autoStart=true] Auto start after reset
    * @returns {Group}
    */
    resetAll(autoStart = true) {
        for (const timer of this.timers) {
            timer.reset(autoStart);
        }
        return this;
    }
    
    /**
    * Links this group with one or more timers
    * @param {...Timer} timers - Timers to link with
    * @returns {Group}
    */
    link(...timers) {
        timers.forEach(timer => {
            if (timer instanceof Timer) {
                this.timers.add(timer);
                timer.groups.add(this);
            }
        });
        return this;
    }
    
    /**
    * Removes a timer from the group
    * @param {...Timer} timers - Timers to remove
    * @returns {Group}
    */
    remove(...timers) {
        timers.forEach(timer => {
            this.timers.delete(timer);
            timer.groups.delete(this);
        });
        return this;
    }
    
    /**
    * Returns active timers count
    * @returns {number}
    */
    getActiveCount() {
        return Array.from(this.timers)
        .filter(timer => timer.isActive()).length;
    }
    
    /**
    * Executes callback when all timers complete
    * @param {Function} callback - Function to execute
    * @returns {Group}
    */
    onComplete(callback) {
        const checkComplete = () => {
            const allComplete = Array.from(this.timers)
            .every(timer => timer.state.isCompleted);
            if (allComplete) callback();
        };
        
        this.timers.forEach(timer => {
            const originalCallback = timer.callback;
            timer.callback = (...args) => {
                originalCallback.apply(timer.context, args);
                checkComplete();
            };
        });
        
        return this;
    }
    
    /**
    * Restarts all timers with the same remaining time ratio
    * @returns {Group}
    */
    restartSynchronized() {
        const maxDelay = Math.max(...Array.from(this.timers)
        .map(timer => timer.delay));
        
        this.timers.forEach(timer => {
            const ratio = timer.getRemainingTime() / timer.delay;
            timer.state.remainingTime = maxDelay * ratio;
            timer.start();
        });
        
        return this;
    }
}

/**
* Public Maestro API
*/
export class Maestro {
    /**
    * Creates a new timer
    * * @param {Function} [callback] Callback if first param is delay
    * @param {TimerConfig} [config] Timer configuration
    
    
    * @returns {Timer}
    */
    static timer(callback, config = {}) {
        
        if (!callback) {
            throw 'Timer requires a callback function';
        }
        
        return new Timer(callback, config);
    }
    
    /**
    * Creates a new group
    * @param {string|Object} [options] Group name or options
    * @returns {Group}
    */
    static group(options) {
        const config = typeof options === 'string' 
        ? { name: options }
        : options || {};
        
        return new Group(config);
    }
    
    /**
    * Creates a chain of sequential timers
    * @param {...Object} timerConfigs - Timer configurations
    * @returns {Group}
    */
    static sequence(...timerConfigs) {
        const group = new Group({ synchronous: true });
        
        timerConfigs.reduce((previousTimer, config) => {
            const { callback, delay, ...rest } = config;
            const timer = new Timer(callback, {
                delay,
                ...rest,
                autoStart: false
            });
            
            group.add(timer);
            
            if (previousTimer) {
                previousTimer.onComplete(() => timer.start());
            } else {
                timer.start(); // Démarrer le premier timer
            }
            
            return timer;
        }, null);
        
        return group;
    }
    
    /**
    * Creates multiple synchronized timers
    * @param {...Object} timerConfigs - Timer configurations
    * @returns {Group}
    */
    static sync(...timerConfigs) {
        const group = new Group({ synchronous: true });
        timerConfigs.forEach(config => {
            group.add(new Timer(config));
        });
        return group;
    }
}