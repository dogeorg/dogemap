import { debounce } from "./utils.js";
import { ready, hidePopup, showPopup } from "./map.js";

export function initEventListeners(context) {
  // Handle Resize
  window.addEventListener(
    "resize",
    debounce(() => ready(context), 300),
  );

  // Display popup on marker click
  window.addEventListener("click", (e) => handleNodeClick(e, context), { passive: true });

  // Open Dogecoin Nodes Filters Menu
  const drawer = document.querySelector(".drawer-overview");
  const menu = document.querySelector("#btn-menu");
  menu.addEventListener("click", (event) => {
    event.stopPropagation();
    drawer.show()
  });

  // Toggle Dark and Light Modes
  const toggle = document.querySelector("#btn-mode");
  toggle.addEventListener("click", (e) => handleToggleDarkModeClick(e, context));
}

function handleNodeClick (event, context) {
  if (!context.canvas) return;
  const rect = context.canvas.node().getBoundingClientRect();
  const mouseX = (event.clientX - rect.left) / context.transform.k - context.transform.x;
  const mouseY = (event.clientY - rect.top) / context.transform.k - context.transform.y;
  context.userData.forEach((site) => {
    const coords = context.projection([+site.lon, +site.lat]);
    site.x = coords[0];
    site.y = coords[1];
    const markerX = site.x;
    const markerY = site.y;
    if (Math.abs(mouseX - markerX) < 5 && Math.abs(mouseY - markerY) < 5) {
      showPopup(markerX, markerY, site);
    } else {
      hidePopup();
    }
  });
}

function handleToggleDarkModeClick (e, context) {
  const body = document.body;
  body.classList.toggle("dark-mode");

  const modeIcon = document.getElementById("mode-icon");
  if (body.classList.contains("dark-mode")) {
    modeIcon.setAttribute("name", "moon-fill");
    context.colour.range(["#444444", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]); // Change color scale for dark mode
  } else {
    modeIcon.setAttribute("name", "sun-fill");
    context.colour.range(["#e1e1e1", "#F0BE5F", "#ECB23B", "#EF9907", "#C56B00"]); // Change color scale for light mode
  }
  // We Redraw hexagons Doge Nodes Locations with the data
  ready(context);
}