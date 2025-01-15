import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mock, spyOn } from "bun:test";
import {Maestro} from "../src/index.js";

describe('Maestro Timer Library', () => {
  let now = 0;
  let originalPerformanceNow;

  beforeEach(() => {
    originalPerformanceNow = performance.now;
    globalThis.performance.now = () => now;
  });

  afterEach(() => {
    now = 0;
    globalThis.performance.now = originalPerformanceNow;
    // Clear any pending timeouts
    for (let i = setTimeout(() => {}, 0); i > 0; i--) {
      clearTimeout(i);
    }
  });

  describe('Timer Creation', () => {
    test('should create a timer with number and callback', () => {
      const callback = () => {};
      const timer = Maestro.timer(callback, {delay: 1000});

      console.log("TIMER DELAY", timer.delay);
      
      
      expect(timer.delay).toBe(1000);
      expect(timer.callback).toBe(callback);
    });

    test('should create a timer with config object', () => {
      const config = {
        delay: 2000,
        context: { foo: 'bar' },
        args: ['test']
      };
      const timer = Maestro.timer(() => {}, config);

      expect(timer.delay).toBe(2000);
      expect(timer.context).toBe(config.context);
      expect(timer.args).toEqual(['test']);
    });

    test('should throw if no callback provided', () => {
      expect(() => Maestro.timer({delay: 1000})).toThrow('Timer requires a callback function');
    });
  });

  describe('Timer Controls', () => {
    let timer;
    let callbackMock;

    beforeEach(() => {
      callbackMock = mock(() => {});
      timer = Maestro.timer(callbackMock, {delay: 1000});
    });

    test('should start automatically by default', () => {
      expect(timer.isActive()).toBe(true);
    });

    test('should not start when autoStart is false', () => {
      timer = Maestro.timer(callbackMock, { delay: 1000, autoStart: false });
      expect(timer.isActive()).toBe(false);
    });

    test('should pause and resume correctly', async () => {
      now = 500;  // Half way through
      timer.pause();
      
      expect(timer.state.isPaused).toBe(true);
      expect(timer.getRemainingTime()).toBe(500);

      timer.start();
      expect(timer.state.isPaused).toBe(false);
      expect(timer.isActive()).toBe(true);
    });

    test('should reset correctly', () => {
      now = 500;
      timer.reset();

      expect(timer.state.remainingTime).toBe(1000);
      expect(timer.isActive()).toBe(true);
    });

    test('should execute callback on completion', async () => {
      const completionPromise = new Promise(resolve => {
        timer = Maestro.timer(() => {
            callbackMock();
            resolve();
          },
          {delay: 50});
      });
      
      await completionPromise;
      expect(callbackMock).toHaveBeenCalled();
      expect(timer.state.isCompleted).toBe(true);
    });
  });

  describe('Timer Events', () => {
    test('should notify on complete', async () => {
      const completeMock = mock(() => {});
      const completionPromise = new Promise(resolve => {
        const timer = Maestro.timer( () => {
            resolve();
          }, {delay: 50}).onComplete(completeMock);
      });

      await completionPromise;
      expect(completeMock).toHaveBeenCalled();
    });
  });

  describe('Group Management', () => {
    let group;
    let timer1;
    let timer2;
    
    beforeEach(() => {
      group = Maestro.group('test-group');
      timer1 = Maestro.timer(() => {}, {delay: 1000});
      timer2 = Maestro.timer(() => {}, {delay: 2000});
    });

    test('should add timers correctly', () => {
      group.add(timer1).add(timer2);
      expect(group.timers.size).toBe(2);
      expect(timer1.groups.has(group)).toBe(true);
    });

    test('should link timers correctly', () => {
      group.link(timer1, timer2);
      expect(group.timers.size).toBe(2);
      expect(timer1.groups.has(group)).toBe(true);
    });

    test('should remove timers correctly', () => {
      group.add(timer1).add(timer2);
      group.remove(timer1);
      
      expect(group.timers.size).toBe(1);
      expect(timer1.groups.has(group)).toBe(false);
    });

    test('should control all timers simultaneously', () => {
      group.add(timer1).add(timer2);
      
      group.pauseAll();
      expect(Array.from(group.timers).every(t => t.state.isPaused)).toBe(true);
      
      group.startAll();
      expect(Array.from(group.timers).every(t => !t.state.isPaused)).toBe(true);
      
      group.resetAll();
      expect(Array.from(group.timers).every(t => t.state.remainingTime === t.delay)).toBe(true);
    });

    test('should notify when all timers complete', async () => {
        const completeMock = mock(() => {});
        const timer1 = Maestro.timer(() => {}, {delay: 50});
        const timer2 = Maestro.timer(() => {}, {delay: 100});
        
        const group = Maestro.group();
        group.onAllComplete(completeMock);
        
        const completionPromise = new Promise(resolve => {
            timer2.onComplete(() => {
                resolve();
            });
            
            group.add(timer1);
            group.add(timer2);
            
            // Assurons-nous que les timers démarrent après l'ajout au groupe
            timer1.start();
            timer2.start();
        });
    
        await completionPromise;
        // Attendre un peu plus longtemps pour s'assurer que le callback a le temps de s'exécuter
        await new Promise(resolve => setTimeout(resolve, 150));
        expect(completeMock).toHaveBeenCalled();
    });
  });

  describe('Advanced Features', () => {
    test('should create sequential timers', async () => {
      const spy1 = mock(() => {});
      const spy2 = mock(() => {});

      const completionPromise = new Promise(resolve => {
        const sequence = Maestro.sequence(
          { delay: 50, callback: spy1 },
          { delay: 50, callback: () => {
            spy2();
            resolve();
          }}
        );
      });

      await completionPromise;
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid group links', () => {
      const group = Maestro.group();
      expect(() => group.link('not a timer')).not.toThrow();
      expect(group.timers.size).toBe(0);
    });

    test('should handle multiple pauses', () => {
      const timer = Maestro.timer(() => {}, {delay: 1000});
      timer.pause();
      timer.pause(); // Second pause shouldn't throw
      expect(timer.state.isPaused).toBe(true);
    });

    test('should handle completion of paused timer', async () => {
      const callbackMock = mock(() => {});
      const timer = Maestro.timer(callbackMock, {delay: 50});
      
      timer.pause();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callbackMock).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle zero delay', async () => {
        const callbackMock = mock(() => {
            console.log("CALLBACK MOCK");
        });
        
        Maestro.timer(callbackMock, { 
            delay: 0
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(callbackMock).toHaveBeenCalled();
    });

    test('should handle very large delays', () => {
      const timer = Maestro.timer(() => {}, {delay: Number.MAX_SAFE_INTEGER});
      expect(timer.isActive()).toBe(true);
    });

    test('should maintain accurate timing after multiple pauses', () => {
      const timer = Maestro.timer(() => {}, {delay: 1000});
      
      now = 250;
      timer.pause();
      expect(timer.getRemainingTime()).toBe(750);
      
      now = 500;
      timer.start();
      
      now = 750;
      timer.pause();
      expect(timer.getRemainingTime()).toBe(500);
    });
  });
});