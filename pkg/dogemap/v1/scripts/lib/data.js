import { countActivePoints } from "./points.js";
import { ready } from "./map.js";

// Fetch data from JSON file
export async function fetchData() {
  const response = await fetch("./scripts/nodes.json");
  const data = await response.json();
  return data;
}

// Promise.all([world, points]).then((res) => {
//   let [geo, datan] = res;
//   geoData = geo;
//   data = datan;

//   // Count the number of active points
//   countActivePoints(data);

//   ready(geo, data, userData, colour);

//   // Much Hide loading image once the map is loaded
//   loadingImage.style.display = "none";
// });

export async function initD3(context) {
  try {
    // Much Load Doge World.
    const world = d3.json("./scripts/dogeWorld.json");
    // Much Load Doge Nodes.
    const points = d3.json("./scripts/nodes.json");
    
    let [geoData, data] = await Promise.all([world, points]);
    context.geoData = geoData
    context.data = data
    context.initialData = data;

    // Count the number of active points
    countActivePoints(data);

    ready(context)

    // Hide loading image once the map is loaded
    context.loadingImage.style.display = "none";

    return { geoData, data };

  } catch (error) {
      console.error("Failed to load geo data:", error);
      // Handle the error appropriately
      throw error;
  }
}