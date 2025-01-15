// Type definitions for Maestro Timer Library
declare module "@killiandvcz/maestro" {
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

  export interface GroupConfig {
      /** Group name */
      name?: string;
      /** Whether timers run synchronously */
      synchronous?: boolean;
  }

  export class Timer {
      private callback: Function;
      private delay: number;
      private context: any;
      private args: any[];
      private groups: Set<Group>;
      private state: TimerState;
      private _onCompleteListeners: Set<(timer: Timer) => void>;

      constructor(callback: Function, config?: TimerConfig);

      private _cleanup(): void;
      private _notifyGroups(): void;
      private _handleComplete(): void;

      /**
       * Adds completion listener
       * @param listener - Callback when timer completes
       */
      onComplete(listener: (timer: Timer) => void): this;

      /**
       * Links this timer to one or more groups
       * @param groups - Groups to link with
       */
      link(...groups: Group[]): this;

      /**
       * Unlinks this timer from one or more groups
       * @param groups - Groups to unlink from
       */
      unlink(...groups: Group[]): this;

      /**
       * Starts or resumes the timer
       */
      start(): this;

      /**
       * Pauses the timer
       */
      pause(): this;

      /**
       * Resets and optionally restarts the timer
       * @param autoStart - Auto start after reset
       */
      reset(autoStart?: boolean): this;

      /**
       * Returns remaining time in milliseconds
       */
      getRemainingTime(): number;

      /**
       * Checks if timer is active (started and not completed)
       */
      isActive(): boolean;
  }

  export class Group {
      name: string;
      synchronous: boolean;
      timers: Set<Timer>;
      private _completedTimers: Set<Timer>;
      private _onAllCompleteListeners: Set<(group: Group) => void>;

      constructor(config?: GroupConfig);

      /**
       * Handles timer completion notification
       */
      private onTimerComplete(timer: Timer): void;

      /**
       * Adds listener for when all timers complete
       * @param listener - Callback when all complete
       */
      onAllComplete(listener: (group: Group) => void): this;

      /**
       * Adds a timer to the group
       * @param timer - Timer instance
       */
      add(timer: Timer): this;

      /**
       * Starts all timers in the group
       */
      startAll(): this;

      /**
       * Pauses all timers in the group
       */
      pauseAll(): this;

      /**
       * Resets all timers in the group
       * @param autoStart - Auto start after reset
       */
      resetAll(autoStart?: boolean): this;

      /**
       * Links this group with one or more timers
       * @param timers - Timers to link with
       */
      link(...timers: Timer[]): this;

      /**
       * Removes a timer from the group
       * @param timers - Timers to remove
       */
      remove(...timers: Timer[]): this;

      /**
       * Returns active timers count
       */
      getActiveCount(): number;

      /**
       * Executes callback when all timers complete
       * @param callback - Function to execute
       */
      onComplete(callback: () => void): this;

      /**
       * Restarts all timers with the same remaining time ratio
       */
      restartSynchronized(): this;
  }

  export interface TimerSequenceConfig extends TimerConfig {
      callback: Function;
      delay: number;
  }

  export class Maestro {
      /**
       * Creates a new timer
       * @param callback - Timer callback function
       * @param config - Timer configuration
       */
      static timer(callback: Function, config?: TimerConfig): Timer;

      /**
       * Creates a new group
       * @param options - Group name or configuration
       */
      static group(options?: string | GroupConfig): Group;

      /**
       * Creates a chain of sequential timers
       * @param timerConfigs - Timer configurations
       */
      static sequence(...timerConfigs: TimerSequenceConfig[]): Group;

      /**
       * Creates multiple synchronized timers
       * @param timerConfigs - Timer configurations
       */
      static sync(...timerConfigs: TimerConfig[]): Group;
  }
}