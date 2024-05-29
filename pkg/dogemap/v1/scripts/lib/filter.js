import { getUniqueSubvers } from "./utils.js"
import { countActivePoints } from "./points.js";
import { ready } from "./map.js";

// Check each Dogecoin Node Filter Active
export function initFilterEventListeners(context) {
  document
    .getElementById("filter-menu")
    .addEventListener("sl-change", (event) => {
      const switchElement = event.target;
      if (switchElement.tagName === "SL-SWITCH") {
        const switchValue = switchElement.id.trim();
        // If the switch is checked, add its value to the array
        if (switchElement.checked) {
          context.selectedSwitchValues.push(switchValue);
        } else {
          // If the switch is unchecked, remove its value from the array
          const index = context.selectedSwitchValues.indexOf(switchValue);
          if (index !== -1) {
            context.selectedSwitchValues.splice(index, 1);
          }
        }
        // Apply filter with selected switch values
        applyFilter(context.selectedSwitchValues, context);
      }
    });
}

// We apply all selected Filters to reflect on the Dogecoin Nodes Map
function applyFilter(selectedValues, context) {
  // If no Doge Nodes switches are selected, show all nodes
  if (selectedValues.length === 0) {
    context.data = context.initialData;
    ready(context);
    return;
  }

  // Filter nodes based on selected switch values
  const filteredData = selectedValues.reduce((acc, selectedValue) => {
    const sanitizedValue = selectedValue.trim().toLowerCase();
    const filteredSites = context.data.filter((site) => {
      const sanitizedSubver = site.subver.trim().toLowerCase();
      return sanitizedSubver.includes(sanitizedValue);
    });
    return acc.concat(filteredSites);
  }, []);

  // Check if no nodes are found after filtering
  if (filteredData.length === 0) {
    //alert("Much Sad, No nodes found with the selected criteria.");
    //return;
  }

  // We Redraw hexagons Doge Nodes Locations with filtered data
  context.data = filteredData
  // ready(geoData, filteredData);
  ready(context);

  // Update the count of active points
  countActivePoints(filteredData);
}

// Generate sl-switch elements based on unique subver values
export function generateSwitches(data) {
  const uniqueSubvers = getUniqueSubvers(data);
  const filterMenu = document.getElementById("filter-menu");

  uniqueSubvers.forEach((subver) => {
    const switchElement = document.createElement("sl-switch");
    switchElement.id = `${subver}`;
    switchElement.innerText = subver;
    switchElement.value = subver;
    filterMenu.appendChild(switchElement);
  });
}