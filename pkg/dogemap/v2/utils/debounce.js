export default function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function onceThenDebounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
    };
    const shouldCallNow = !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (shouldCallNow) func.apply(this, args);
  };
}