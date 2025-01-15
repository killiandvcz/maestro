declare module 'maestro' {
    /**
     * Timer configuration options
     */
    export interface TimerConfig {
      /** Timer delay in milliseconds */
      delay?: number;
      /** Callback context */
      context?: any;
      /** Callback arguments */
      args?: any[];
      /** Auto start after creation */
      autoStart?: boolean;
    }
  
    /**
     * Timer internal state
     */
    export interface TimerState {
      /** When timer started */
      startTime: number;
      /** Time left in pause */
      remainingTime: number;
      /** System timeout ID */
      timeoutId: number | null;
      /** Pause state */
      isPaused: boolean;
      /** Completion state */
      isCompleted: boolean;
    }
  
    /**
     * Group configuration options
     */
    export interface GroupConfig {
      /** Group name */
      name?: string;
      /** Whether timers should run synchronously */
      synchronous?: boolean;
    }
  
    /**
     * Timer class for managing individual timers
     */
    export class Timer {
      /** Timer callback function */
      callback: Function;
      /** Timer delay in milliseconds */
      delay: number;
      /** Callback context */
      context: any;
      /** Callback arguments */
      args: any[];
      /** Groups this timer belongs to */
      groups: Set<Group>;
      /** Current timer state */
      state: TimerState;
  
      constructor(callback: Function, config?: TimerConfig);
  
      /**
       * Adds completion listener
       * @param listener Callback when timer completes
       */
      onComplete(listener: (timer: Timer) => void): Timer;
  
      /**
       * Links this timer to one or more groups
       * @param groups Groups to link with
       */
      link(...groups: Group[]): Timer;
  
      /**
       * Unlinks this timer from one or more groups
       * @param groups Groups to unlink from
       */
      unlink(...groups: Group[]): Timer;
  
      /**
       * Starts or resumes the timer
       */
      start(): Timer;
  
      /**
       * Pauses the timer
       */
      pause(): Timer;
  
      /**
       * Resets and optionally restarts the timer
       * @param autoStart Auto start after reset
       */
      reset(autoStart?: boolean): Timer;
  
      /**
       * Returns remaining time in milliseconds
       */
      getRemainingTime(): number;
  
      /**
       * Checks if timer is active (started and not completed)
       */
      isActive(): boolean;
    }
  
    /**
     * Group class for managing multiple timers
     */
    export class Group {
      /** Group name */
      name: string;
      /** Whether timers should run synchronously */
      synchronous: boolean;
      /** Set of timers in this group */
      timers: Set<Timer>;
  
      constructor(config?: GroupConfig);
  
      /**
       * Adds listener for when all timers complete
       * @param listener Callback when all complete
       */
      onAllComplete(listener: (group: Group) => void): Group;
  
      /**
       * Adds a timer to the group
       * @param timer Timer instance
       */
      add(timer: Timer): Group;
  
      /**
       * Starts all timers in the group
       */
      startAll(): Group;
  
      /**
       * Pauses all timers in the group
       */
      pauseAll(): Group;
  
      /**
       * Resets all timers in the group
       * @param autoStart Auto start after reset
       */
      resetAll(autoStart?: boolean): Group;
  
      /**
       * Links this group with one or more timers
       * @param timers Timers to link with
       */
      link(...timers: Timer[]): Group;
  
      /**
       * Removes timers from the group
       * @param timers Timers to remove
       */
      remove(...timers: Timer[]): Group;
  
      /**
       * Returns active timers count
       */
      getActiveCount(): number;
  
      /**
       * Executes callback when all timers complete
       * @param callback Function to execute
       */
      onComplete(callback: () => void): Group;
  
      /**
       * Restarts all timers with the same remaining time ratio
       */
      restartSynchronized(): Group;
    }
  
    /**
     * Timer configuration with callback for sequence/sync methods
     */
    export interface TimerConfigWithCallback extends TimerConfig {
      /** Timer callback function */
      callback: Function;
    }
  
    /**
     * Main Maestro API
     */
    export default class Maestro {
      /**
       * Creates a new timer
       * @param callback Timer callback function
       * @param config Timer configuration
       */
      static timer(callback: Function, config?: TimerConfig): Timer;
  
      /**
       * Creates a new group
       * @param options Group name or options
       */
      static group(options?: string | GroupConfig): Group;
  
      /**
       * Creates a chain of sequential timers
       * @param timerConfigs Timer configurations
       */
      static sequence(...timerConfigs: TimerConfigWithCallback[]): Group;
  
      /**
       * Creates multiple synchronized timers
       * @param timerConfigs Timer configurations
       */
      static sync(...timerConfigs: TimerConfigWithCallback[]): Group;
    }
  }