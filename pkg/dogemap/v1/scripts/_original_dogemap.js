   // Define global variables
   let transform = { x: 0, y: 0, k: 1 };
   let colour;
   let userData;
   let geoData;
   let data;

   // Preprocess user data to compute coordinates
   function preprocessUserData(userData, projection) {
     userData.forEach(site => {
       const coords = projection([+site.lon, +site.lat]);
       site.x = coords[0];
       site.y = coords[1];
     });
   }

   function ready(geo, data) {
   // Assign data to userData
   userData = data;

   // Some set up.
   const width = window.innerWidth;
   const height = window.innerHeight;
   const pr = window.devicePixelRatio || 1;

   // Crisp canvas and context.
   const canvas = d3.select('canvas')
       .attr('width', width * pr)
       .attr('height', height * pr)
       .style('width', `${width}px`)
       .style('height', `${height}px`);
   const context = canvas.node().getContext('2d');
   context.scale(pr, pr);

   // Projection and path.
   const projection = d3.geoRobinson().fitSize([width, height], geo);
   const geoPath = d3.geoPath()
       .projection(projection)
       .context(context);

   // Prep user data.
   userData.forEach(site => {
       const coords = projection([+site.lng, +site.lat]);
       site.x = coords[0];
       site.y = coords[1];
   });

   // Hexgrid generator.
   const hexgrid = d3.hexgrid()
       .extent([width, height])
       .geography(geo)
       .projection(projection)
       .pathGenerator(geoPath)
       .hexRadius(3);

   // Hexgrid instance.
   let hex = hexgrid(userData);

   // Define hexagon
   const hexagon = new Path2D(hex.hexagon());

   // Colour scale.
   const counts = hex.grid.layout
       .map(el => el.datapointsWt)
       .filter(el => el > 0);

   // Check if there is enough data for clustering
   if (counts.length < 5) {
       console.error("Insufficient data for clustering.");
       draw(); // Draw the map with available data only
       return;
   }

   const ckBreaks = ss.ckmeans(counts, 4).map(clusters => clusters[0]);
   colour = d3
       .scaleThreshold()
       .domain(ckBreaks)
       .range(['#e1e1e1', '#F0BE5F', '#ECB23B', '#EF9907', '#C56B00']);

   const body = document.body;
   if (body.classList.contains('dark-mode')) {
       colour.range(['#444444', '#F0BE5F', '#ECB23B', '#EF9907', '#C56B00']); // Change color scale for dark mode
   } else {
       colour.range(['#e1e1e1', '#F0BE5F', '#ECB23B', '#EF9907', '#C56B00']); // Change color scale for light mode
   }


 // Draw function
 function draw() {
       context.clearRect(0, 0, width, height);
       hex.grid.layout.forEach(hex => {
           context.save();
           context.translate(hex.x, hex.y);
           context.fillStyle = colour(hex.datapointsWt);
           context.fill(hexagon);
           // Add border
           if (document.body.classList.contains('dark-mode')) {
               context.strokeStyle = '#75FBF9'; // Border color for dark mode
           } else {
               context.strokeStyle = '#444'; // Border color for light mode
           }
           context.lineWidth = 0.1; // Border width
           context.stroke(hexagon);
           context.restore();
       });
   }


   draw();

   // Display popup on marker click
   window.addEventListener('click', function(event) {
       const rect = canvas.node().getBoundingClientRect();
       const mouseX = (event.clientX - rect.left) / transform.k - transform.x;
       const mouseY = (event.clientY - rect.top) / transform.k - transform.y;
       userData.forEach(site => {
           const coords = projection([+site.lon, +site.lat]);
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
   }, { passive: true });


   // Listen for zoom events
   canvas.call(
       d3.zoom()
           .scaleExtent([1, 8])
           .on("zoom", zoomed)
   );

   // Zoomed function
   function zoomed(event) {
       const { transform } = event;
       context.save();
       context.clearRect(0, 0, width, height);
       context.translate(transform.x, transform.y);
       context.scale(transform.k, transform.k);
       draw(); // Redraw hexagons
       context.restore();

       // Adjust popup position
       const rect = canvas.node().getBoundingClientRect();
       const mouseX = (event.sourceEvent.clientX - rect.left - transform.x) / transform.k;
       const mouseY = (event.sourceEvent.clientY - rect.top - transform.y) / transform.k;
       adjustPopupPosition(mouseX, mouseY);
   }

   // Function to adjust popup position
   function adjustPopupPosition(x, y) {
      
     const popup = document.getElementById('popup');
       popup.style.left = x + 'px';
       popup.style.top = y + 'px';
   }


   function showPopup(x, y, site) {
       const popup = document.getElementById('popup');
       popup.style.position = 'absolute';
       popup.style.display = 'block';
       popup.style.left = x + 'px';
       popup.style.top = y + 'px';
       popup.innerText =
           site.subver + '\n' + site.city + "(" + site.country + ")";
   }

   function hidePopup() {
       const popup = document.getElementById('popup');
       //popup.style.display = 'none';
   }
}

// Show loading image while the map is loading
const loadingImage = document.getElementById('much-loading-image');
loadingImage.style.display = 'flex';

   // Function to update the text of btn-nodes with the number of active points
   function updateActivePointsCount(count) {
       const btnNodes = document.getElementById('btn-nodes');
       btnNodes.innerHTML = count + ' Nodes'; // Update the text with the count
   }

   // Function to count the number of active points
   function countActivePoints(data) {
       // Filter the data to get active points
       const activePoints = data.filter(point => {
           // Define your criteria for active points here
           return true; // Example: point.active === true
       });

       // Update the count in the btn-nodes button
       updateActivePointsCount(activePoints.length);
   }

// Much Load Doge World.
const world = d3.json('./scripts/dogeWorld.json');
// Much Load Doge Nodes.
const points = d3.json('./scripts/nodes.json');

Promise.all([world, points]).then(res => {
       let [geo, datan] = res;
       geoData = geo;
       data = datan;

       // Count the number of active points
       countActivePoints(data);

       ready(geo, data);

       // Much Hide loading image once the map is loaded
       loadingImage.style.display = 'none';
   });

// Open Dogecoin Nodes Filters Menu
const drawer = document.querySelector('.drawer-overview');
const menu = document.querySelector('#btn-menu');
menu.addEventListener('click', () => drawer.show());

// Toggle Dark and Light Modes
const toggle = document.querySelector("#btn-mode");
toggle.addEventListener("click", e => {

   const body = document.body;
   body.classList.toggle('dark-mode');

   const modeIcon = document.getElementById('mode-icon');
   if (body.classList.contains('dark-mode')) {
       modeIcon.classList.remove('fa-sun');
       modeIcon.classList.add('fa-moon');
       colour.range(['#444444', '#F0BE5F', '#ECB23B', '#EF9907', '#C56B00']); // Change color scale for dark mode
   } else {
       modeIcon.classList.remove('fa-moon');
       modeIcon.classList.add('fa-sun');
       colour.range(['#e1e1e1', '#F0BE5F', '#ECB23B', '#EF9907', '#C56B00']); // Change color scale for light mode
   }
   // We Redraw hexagons Doge Nodes Locations with the data
   ready(geoData, data);
});


// We have to store in a global Array all Dogecoin Nodes to filter
let selectedSwitchValues = [];

// Check each Dogecoin Node Filter Active
document.getElementById('filter-menu').addEventListener('sl-change', event => {
   const switchElement = event.target;
   if (switchElement.tagName === 'SL-SWITCH') {
     const switchValue = switchElement.id.trim();
     // If the switch is checked, add its value to the array
     if (switchElement.checked) {
       selectedSwitchValues.push(switchValue);
     } else {
       // If the switch is unchecked, remove its value from the array
       const index = selectedSwitchValues.indexOf(switchValue);
       if (index !== -1) {
         selectedSwitchValues.splice(index, 1);
       }
     }
     // Apply filter with selected switch values
     applyFilter(selectedSwitchValues);
   }
 });

// We apply all selected Filters to reflect on the Dogecoin Nodes Map
function applyFilter(selectedValues) {

// If no Doge Nodes switches are selected, show all nodes
if (selectedValues.length === 0) {
   ready(geoData, data);
   return;
}

// Filter nodes based on selected switch values
const filteredData = selectedValues.reduce((acc, selectedValue) => {
   const sanitizedValue = selectedValue.trim().toLowerCase();
   const filteredSites = data.filter(site => {
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
ready(geoData, filteredData);

// Update the count of active points
countActivePoints(filteredData);
}

// Function to count the number of active points
function countActivePoints(data) {
// Filter the data to get active points
const activePoints = data.filter(point => {
   // Define your criteria for active points here
   return true; // Example: point.active === true
});

// Update the count in the btn-nodes button
updateActivePointsCount(activePoints.length);
}

function getUniqueSubvers(data) {
   const uniqueSubvers = new Set();
   data.forEach(item => {
       if (item.subver && typeof item.subver === 'string') {
           // Extract substring before ()
           const subverWithoutParentheses = item.subver.split('(')[0].trim();
           // Remove / and \ from the substring
           const subver = subverWithoutParentheses.replace(/[\/\\]/g, '').trim();
           if (subver) {
               uniqueSubvers.add(subver);
           }
       }
   });
   // Convert Set to array, sort alphabetically, and return
   return Array.from(uniqueSubvers).sort();
}

 // Generate sl-switch elements based on unique subver values
 function generateSwitches(data) {
     const uniqueSubvers = getUniqueSubvers(data);
     const filterMenu = document.getElementById('filter-menu');

     uniqueSubvers.forEach(subver => {
         const switchElement = document.createElement('sl-switch');
         switchElement.id = `${subver}`;
         switchElement.innerText = subver;
         switchElement.value = subver;
         filterMenu.appendChild(switchElement);
     });
 }

 // Fetch data from JSON file
 async function fetchData() {
     const response = await fetch('./scripts/nodes.json');
     const data = await response.json();
     return data;
 }

 // Function to initialize the application
 async function initialize() {
     // Fetch data
     const data = await fetchData();

     // Generate sl-switch elements
     generateSwitches(data);

     // Initialize the map
     //const world = await d3.json('./dogeWorld.json');
     //ready(world, data);

      window.addEventListener('resize', debounce(() => ready(geoData, data), 300));
 }

 // Call initialize function when the DOM content is loaded
 document.addEventListener('DOMContentLoaded', initialize);

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}