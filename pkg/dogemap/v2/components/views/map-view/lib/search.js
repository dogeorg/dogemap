export function handleSearchInput(e) {
  
  console.log(e.target.value);
  
  // Reset if search box is empty.
  if (!e.target.value) {
    this.points = this.originalPoints;
    return;
  }

  // Doing a filter here, but this should move.
  this.points = this.points.filter((p) => {
    return p.country && typeof p.country === 'string' && p.country.startsWith(e.target.value)
  });
}