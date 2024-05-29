export function getUniqueSubvers(data) {
  const uniqueSubvers = new Set();
  data.forEach((item) => {
    if (item.subver && typeof item.subver === "string") {
      // Extract substring before ()
      const subverWithoutParentheses = item.subver.split("(")[0].trim();
      // Remove / and \ from the substring
      const subver = subverWithoutParentheses.replace(/[\/\\]/g, "").trim();
      if (subver) {
        uniqueSubvers.add(subver);
      }
    }
  });
  // Convert Set to array, sort alphabetically, and return
  return Array.from(uniqueSubvers).sort();
}

export function debounce(func, wait) {
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