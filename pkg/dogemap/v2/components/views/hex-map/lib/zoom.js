export function handleZoom(event) {
  const ctx = this.renderingContext
  const { transform } = event;
  // Save current state (allows us to revert if we wish)
  ctx.save();

  // Clear the entire canvas area 
  // before applying new transformations and redrawing the content
  ctx.clearRect(0, 0, this.width, this.height);

  // Make modifications
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  // Draw all content on the canvas
  this.draw();

  // Required so that scrolling backwards reverts state.
  ctx.restore();
}