export function draw() {
  const ctx = this.renderingContext
  ctx.clearRect(0, 0, this.width, this.height);
  
  this.hex.grid.layout.forEach((hex) => {
    ctx.save();
    ctx.translate(hex.x, hex.y);

    // Fill
    ctx.fillStyle = this.color(hex.datapointsWt);
    ctx.fill(this.hexagon);
  
    // Border
    ctx.strokeStyle = "#75FBF9";
    ctx.lineWidth = 0.1;

    // Point
    ctx.stroke(this.hexagon);
    ctx.restore();
  });
}