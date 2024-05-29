export function setup () {
  console.group('HexMap loading..');

  // Set the height and width to whatever the the dimensions of the host element are.
  const { width, height } = this.getBoundingClientRect();
  this.width = width;
  this.height = height;
  this.pixelRatio = window.devicePixelRatio || 1;

  // Establish canvas.
  this.canvas = d3
    .select(this.shadowRoot.querySelector("canvas#Hexmap"))
    .attr("width", this.width * this.pixelRatio)
    .attr("height", this.height * this.pixelRatio)
    .style("width", this.width + 'px')
    .style("height", this.height + 'px');

  // Test canvas
  const canvasReady =
    this.canvas &&
    this.canvas._groups &&
    this.canvas._groups.length === 1 &&
    this.canvas._groups[0][0].id === "Hexmap"

  if (!canvasReady) {
    console.warn('Hexmap failed canvas ready checks', this.canvas);
  }

  if (canvasReady) {
    console.log('Complete.');
  }

  console.groupEnd();

  console.group('Configuring canvas..')
  // Retreive the 2d rendering context of our canvas
  this.renderingContext = this.canvas.node().getContext("2d");

  // Set the rendering context scale to match the pixel density 
  // of the user's device to ensure a clear image.
  this.renderingContext.scale(this.pixelRatio, this.pixelRatio);
  console.log('..setting scale');

  // Projection (a function that converts geographical coordinates 
  // (eg latitude and longitude) from a spherical surface (like the Earth)
  // to a point on a flat surface).

  // We are using the Robinson projection, which is a commonly used for 
  // displaying the entire world in a more visually pleasing way.
  this.projection = d3.geoRobinson().fitSize([this.width, this.height], this.world);
  console.log('..setting projection');

  // We initialize a geoPath generator, which is used to convert GeoJSON data 
  // into SVG path data or Canvas drawing paths, depending on the rendering context provided.
  // By setting the .projection(projection) we ensure that the path data is calculated according
  // to the Robinson projection set above. The .context(this.context) indicates that
  // the paths should be rendered on our Canvas context.
  const geoPath = d3.geoPath()
    .projection(this.projection)
    .context(this.renderingContext);
  console.log('..setting geoPath');

  // Iterate over our array of points, "projecting" these geographical coordinates
  // onto the 2D canvas using the Robinson projection to determine their corresponding (x, y) positions
  // on the screen. This processing is essential for accurately placing these points 
  // on the canvas based on their real-world locations.
  this.points.forEach((site) => {
    const coords = this.projection([+site.lng, +site.lat]);
    site.x = coords[0];
    site.y = coords[1];
  });
  console.log('..determing x/y of each point according to projection');

  // Hexgrid generator.
  const hexgrid = d3
    .hexgrid()
    .extent([this.width, this.height])
    .geography(this.world)
    .projection(this.projection)
    .pathGenerator(geoPath)
    .hexRadius(3);
  console.log('..configuring hexgrid');

  // Hexgrid instance.
  this.hex = hexgrid(this.points);
  console.log('..suppling hexgrid with point data');

  // Defines a new path for a hexagon shape
  this.hexagon = new Path2D(this.hex.hexagon());
  console.log('..defining hexagon');

  // Color scale.
  // This property represents kind of weight or count of data points
  // within each hexagon, and the filter removes any hexagons without data points.
  const counts = this.hex.grid.layout
    .map((el) => el.datapointsWt)
    .filter((el) => el > 0);
  console.log('..considering clustering');

  // Attach zoom handler
  this.canvas
    .call(d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", this.handleZoom)
    );

  // Check if there is enough data for clustering
  if (counts.length < 5) {
    console.warn("Insufficient data for clustering.");
    console.log('Setup complete, now Drawing.');
    console.groupEnd();
    this.draw(); // Draw the map with available data only
    return;
  }

  // This section checks if there are enough data points for 
  // meaningful clustering (at least 5 clusters). If not, 
  // it logs a warning and proceeds to draw the map with 
  // the available data. 

  // If sufficient, it uses the ss.ckmeans method to perform a 
  // statistical clustering on the data points, dividing them 
  // into 4 clusters, and extracts the smallest value from each
  // cluster to serve as thresholds for the color scale.
  const ckBreaks = ss.ckmeans(counts, 4).map((clusters) => clusters[0]);
  console.log('..performing statistical clustering');

  // This code sets up a threshold color scale using D3.
  // The domain of the scale is set to the break points calculated
  // by the ckmeans clustering, and the range is an array of color values.
  // This color scale will be used to color the hexagons based on their data weight.
  this.color = d3
    .scaleThreshold()
    .domain(ckBreaks)
    .range(["#444444", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]);
  console.log('..adjusting colours per clustering');

  // We clustered, lets draw.
  console.log('Setup complete, now Drawing.');
  console.groupEnd();
  this.draw();
}