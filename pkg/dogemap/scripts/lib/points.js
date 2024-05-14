// Function to update the text of btn-nodes with the number of active points
export function updateActivePointsCount(count) {
  const btnNodes = document.getElementById("btn-nodes");
  btnNodes.innerHTML = count + " Nodes"; // Update the text with the count
}

// Function to count the number of active points
export function countActivePoints(data) {
  // Filter the data to get active points
  const activePoints = data.filter((point) => {
    // Define your criteria for active points here
    return true; // Example: point.active === true
  });

  // Update the count in the btn-nodes button
  updateActivePointsCount(activePoints.length);
}