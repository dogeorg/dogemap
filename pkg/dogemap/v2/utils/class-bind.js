export const bindToClass = function (mapOfFunctions, that) {
  Object.keys(mapOfFunctions).forEach((key) => {
      if (typeof mapOfFunctions[key] === 'function') {
        that[key] = mapOfFunctions[key].bind(that);
      }
    });
}