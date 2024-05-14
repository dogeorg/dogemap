export function ready(context) {
  // Assign data to userData
  context.userData = context.data;

  // Some set up.
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pr = window.devicePixelRatio || 1;

  // Crisp canvas and context.
  context.canvas = d3
    .select("canvas")
    .attr("width", width * pr)
    .attr("height", height * pr)
    .style("width", `${width}px`)
    .style("height", `${height}px`);
  const d3ctx = context.canvas.node().getContext("2d");
  d3ctx.scale(pr, pr);

  // Projection and path.
  context.projection = d3.geoRobinson().fitSize([width, height], context.geoData);
  const geoPath = d3.geoPath().projection(context.projection).context(d3ctx);

  // Prep user data.
  context.userData.forEach((site) => {
    const coords = context.projection([+site.lng, +site.lat]);
    site.x = coords[0];
    site.y = coords[1];
  });

  // Hexgrid generator.
  const hexgrid = d3
    .hexgrid()
    .extent([width, height])
    .geography(context.geoData)
    .projection(context.projection)
    .pathGenerator(geoPath)
    .hexRadius(3);

  // Hexgrid instance.
  let hex = hexgrid(context.userData);

  // Define hexagon
  const hexagon = new Path2D(hex.hexagon());

  // Colour scale.
  const counts = hex.grid.layout
    .map((el) => el.datapointsWt)
    .filter((el) => el > 0);

  // Check if there is enough data for clustering
  if (counts.length < 5) {
    console.error("Insufficient data for clustering.");
    draw(); // Draw the map with available data only
    return;
  }

  const ckBreaks = ss.ckmeans(counts, 4).map((clusters) => clusters[0]);
  context.colour = d3
    .scaleThreshold()
    .domain(ckBreaks)
    .range(["#e1e1e1", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]);

  const body = document.body;
  if (body.classList.contains("dark-mode")) {
    context.colour.range(["#444444", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]); // Change color scale for dark mode
  } else {
    context.colour.range(["#e1e1e1", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]); // Change color scale for light mode
  }

  // Draw function
  function draw() {
    d3ctx.clearRect(0, 0, width, height);
    hex.grid.layout.forEach((hex) => {
      d3ctx.save();
      d3ctx.translate(hex.x, hex.y);
      d3ctx.fillStyle = context.colour(hex.datapointsWt);
      d3ctx.fill(hexagon);
      // Add border
      if (document.body.classList.contains("dark-mode")) {
        d3ctx.strokeStyle = "#75FBF9"; // Border color for dark mode
      } else {
        d3ctx.strokeStyle = "#444"; // Border color for light mode
      }
      d3ctx.lineWidth = 0.1; // Border width
      d3ctx.stroke(hexagon);
      d3ctx.restore();
    });
  }

  draw();

  // Listen for zoom events
  context.canvas.call(d3.zoom().scaleExtent([1, 8]).on("zoom", (e) => zoomed(e, context)));

  // Zoomed function
  const zoomed = (event, context) => {
    const { transform } = event;
    d3ctx.save();
    d3ctx.clearRect(0, 0, width, height);
    d3ctx.translate(transform.x, transform.y);
    d3ctx.scale(transform.k, transform.k);
    draw(); // Redraw hexagons
    d3ctx.restore();

    // Adjust popup position
    const rect = context.canvas.node().getBoundingClientRect();
    const mouseX =
      (event.sourceEvent.clientX - rect.left - transform.x) / transform.k;
    const mouseY =
      (event.sourceEvent.clientY - rect.top - transform.y) / transform.k;
    adjustPopupPosition(mouseX, mouseY);
  }
}

// Function to adjust popup position
export function adjustPopupPosition(x, y) {
  const popup = document.getElementById("popup");
  popup.style.left = x + "px";
  popup.style.top = y + "px";
}

export function showPopup(x, y, site) {
  const popup = document.getElementById("popup");
  popup.style.position = "absolute";
  popup.style.display = "block";
  popup.style.left = x + "px";
  popup.style.top = y + "px";
  popup.innerText = site.subver + "\n" + site.city + "(" + site.country + ")";
}

export function hidePopup() {
  const popup = document.getElementById("popup");
  //popup.style.display = 'none';
}