# 🎯 Maestro

> A powerful and flexible timer management library for JavaScript with grouping, sequencing, and synchronization capabilities.

[![npm version](https://img.shields.io/npm/v/@killiandvcz/maestro.svg)](https://www.npmjs.com/package/@killiandvcz/maestro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features

- 🕒 Create single timers with precise control
- 🔄 Group multiple timers with synchronized management
- ⛓️ Create sequential timer chains
- 🔁 Pause, resume, and reset functionality
- 📊 Monitor timer states and progress
- 🎯 TypeScript support with full type definitions
- 🔄 Method chaining for elegant syntax
- 🎮 Event-based control with completion callbacks
- 🏃‍♂️ Zero dependencies

## 📦 Installation

```bash
npm install @killiandvcz/maestro
```

## 🎮 Quick Start

```javascript
import {Maestro} from '@killiandvcz/maestro';

// Simple timer
const timer = Maestro.timer(() => {
  console.log('Timer completed!');
}, { delay: 1000 });

// Timer with control
timer.pause();  // Pause the timer
timer.start();  // Resume the timer
timer.reset();  // Reset the timer
```

## 📚 API Reference

### Timer Creation

#### `Maestro.timer(callback, config)`

Creates a new timer instance.

```javascript
const timer = Maestro.timer(
  () => console.log('Done!'),
  {
    delay: 1000,          // Delay in milliseconds
    context: this,        // Callback context (optional)
    args: ['arg1', 'arg2'], // Callback arguments (optional)
    autoStart: true       // Auto-start the timer (default: true)
  }
);
```

### Timer Methods

```javascript
timer
  .start()           // Start or resume the timer
  .pause()           // Pause the timer
  .reset()           // Reset the timer
  .onComplete(fn)    // Add completion listener
  .getRemainingTime() // Get remaining time in ms
  .isActive()        // Check if timer is active
```

### Timer Groups

Groups allow you to manage multiple timers together.

```javascript
const group = Maestro.group({ name: 'myGroup' });

group
  .add(timer1)
  .add(timer2)
  .startAll()      // Start all timers
  .pauseAll()      // Pause all timers
  .resetAll()      // Reset all timers
  .onAllComplete(() => {
    console.log('All timers completed!');
  });
```

### Sequential Timers

Create a chain of timers that execute one after another.

```javascript
const sequence = Maestro.sequence(
  {
    callback: () => console.log('First'),
    delay: 1000
  },
  {
    callback: () => console.log('Second'),
    delay: 500
  },
  {
    callback: () => console.log('Third'),
    delay: 200
  }
);
```

### Synchronized Timers

Create multiple timers that run in sync with coordinated timing.

```javascript
const sync = Maestro.sync(
  {
    callback: () => console.log('Sync 1'),
    delay: 1000
  },
  {
    callback: () => console.log('Sync 2'),
    delay: 1000
  }
);
```

## 🎯 Advanced Usage

### Event Handling

```javascript
// Single timer completion
timer.onComplete((timer) => {
  console.log('Timer completed!');
  console.log('Elapsed time:', timer.delay);
});

// Group completion
group.onAllComplete((group) => {
  console.log('Group completed!');
  console.log('Active timers:', group.getActiveCount());
});
```

### Timer Linking

```javascript
// Link timers to groups
timer1.link(group1, group2);
timer1.unlink(group1);

// Link groups to timers
group.link(timer1, timer2);
group.remove(timer1);
```

### Synchronized Restart

```javascript
// Restart all timers in a group while maintaining their relative progress
group.restartSynchronized();
```

## 🔧 TypeScript Support

Maestro includes full TypeScript definitions. Import types as needed:

```typescript
import {Maestro, Timer, Group, TimerConfig } from '@killiandvcz/maestro';

const config: TimerConfig = {
  delay: 1000,
  autoStart: true
};

const timer: Timer = Maestro.timer(() => {}, config);
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Examples

### Creating a Countdown Timer

```javascript
const countdown = Maestro.timer(() => {
  console.log('Countdown complete!');
}, {
  delay: 5000
});

countdown.onComplete(() => {
  const remainingTime = countdown.getRemainingTime();
  console.log(`Time left: ${remainingTime}ms`);
});
```

### Creating a Timer Sequence with Dependencies

```javascript
const sequence = Maestro.sequence(
  {
    callback: () => setupDatabase(),
    delay: 1000
  },
  {
    callback: () => loadData(),
    delay: 2000
  },
  {
    callback: () => initializeApp(),
    delay: 500
  }
);

sequence.onAllComplete(() => {
  console.log('Application initialized!');
});
```

## ⚡ Performance Tips

- Use `timer.pause()` instead of clearing and recreating timers
- Group related timers together for easier management
- Use `sequence()` for dependent operations instead of nested callbacks
- Leverage `onComplete` callbacks instead of polling for timer status

## 🤔 Common Questions

**Q: Can I use Maestro with React/Vue/Angular?**
A: Yes! Maestro works with any JavaScript framework. Just make sure to clean up timers in your component's unmount/destroy lifecycle methods.

**Q: How accurate are the timers?**
A: Maestro uses `performance.now()` for high-resolution timing, but like all JavaScript timers, they are subject to the event loop and system load.

**Q: Can I use Maestro in Node.js?**
A: Yes, Maestro works in both browser and Node.js environments.

## 📞 Support

- Report bugs by creating a [GitHub issue](https://github.com/killiandvcz/maestro/issues)
- Request features through [GitHub issues](https://github.com/killiandvcz/maestro/issues)
- Get help by starting a [GitHub discussion](https://github.com/killiandvcz/maestro/discussions)