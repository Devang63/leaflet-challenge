// initial draw of map

// Create a map instance
const map = L.map('map').setView([0, 0], 2);

// Add a tile layer (you can use different map providers)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch USGS earthquake data
// Function to map depth to color using a gradient scale
function depthToColor(depth) {
    // Define a depth range and corresponding color scale
    const depthRange = [0, 700]; // Example depth range in kilometers
    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain(depthRange);

    // Map depth to color
    return colorScale(depth);
}

// Fetch GeoJSON earthquake data using D3.js
d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson')
    .then(data => {
        // Loop through earthquake data and create markers
        data.features.forEach(feature => {
            const coords = feature.geometry.coordinates;
            const magnitude = feature.properties.mag;
            const depth = coords[2]; // Depth in kilometers
            const title = feature.properties.title;

            // Calculate marker size based on magnitude
            const markerSize = magnitude * 5;

            // Create a marker for each earthquake
            const marker = L.circleMarker([coords[1], coords[0]], {
                radius: markerSize,
                fillColor: depthToColor(depth), // Set the marker color based on depth
                color: 'black', // Border color
                weight: 1, // Border weight
                opacity: 1, // Border opacity
                fillOpacity: 0.7, // Fill opacity
            }).addTo(map);

            marker.bindPopup(`Magnitude: ${magnitude}<br>Depth: ${depth} km<br>${title}`);
        });
    })
    .catch(error => console.error('Error fetching earthquake data:', error));

// Function to create a legend
function createLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const depthRanges = ['-10', '10', '30', '50', '70', '90 +']; 
        const labels = [];

        // Loop through depth ranges and generate a label with a colored square for each range
        for (let i = 0; i < depthRanges.length - 1; i++) {
            div.innerHTML +=
                '<i style="background:' +
                depthToColor(depthRanges[i] + 1) +
                '"></i> ' +
                depthRanges[i] +
                (depthRanges[i + 1] ? '&ndash;' + depthRanges[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(map);
}

// Call the function to create the legend
createLegend();
