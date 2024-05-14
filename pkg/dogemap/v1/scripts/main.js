import { generateSwitches, initFilterEventListeners } from "./lib/filter.js";
import { debounce } from "./lib/utils.js";
import { initD3 } from "./lib/data.js";
import { initEventListeners } from "./lib/event-listeners.js";

// Define global variables with initial values
let context = {
  transform: { x: 0, y: 0, k: 1 },
  colour: () => {},
  userData: [],
  geoData: [],
  data: [],
  initialData: [],
  canvas: null,
  selectedSwitchValues: [],
  loadingImage: null,
  projection: () => {},
}

// Show loading image while the map is loading
context.loadingImage = document.getElementById("much-loading-image");
context.loadingImage.style.display = "flex";

// Function to initialize the application
async function initialize(context) {
  // Generate map
  await initD3(context)

  // Generate sl-switch elements
  generateSwitches(context.data);

  // Add event listeners
  initEventListeners(context);
  initFilterEventListeners(context);
}

// Call initialize function when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => initialize(context));
