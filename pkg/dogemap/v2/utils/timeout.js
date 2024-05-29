export function asyncTimeout(delay, fn) {
  return new Promise(resolve => setTimeout(() => {
    if (fn && typeof fn === 'function') {
      try {
        fn();
      } catch (err) {
        console.error('Function provided to asyncTimeout threw an error:', err);
      } finally {
        resolve();
      }
    } else {
      resolve();
    }
  }, delay));
}