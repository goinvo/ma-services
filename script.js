// Descriptions for each service
const itemDescriptions = {
    'MassHealth': 'Enrollment 2 million',
    'TAFDC': 'Transitional Aid to Families with Dependent Children',
    'EAEDC': 'Emergency Aid to the Elderly, Disabled, and Children',
    'SNAP': 'Supplemental Nutrition Assistance Program',
    'LIHEAP': 'Low Income Home Energy Assistance Program',
    'SSDI': 'Social Security Disability Insurance',
    'SSI': 'Supplemental Security Income'
    // Add more items and descriptions as needed
};

// Load data from JSON file
function loadData(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const hierarchyData = buildHierarchy(data); // Convert flat data to hierarchical
            drawTreeMap(hierarchyData); // Draw the TreeMap
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Convert flat data to hierarchical format
function buildHierarchy(data) {
    const root = { name: "Services", children: [] };

    Object.keys(data).forEach(key => {
        const item = data[key];
        if (item.Parent === "") {
            root.name = key; // Set root name
        } else if (item.Parent === "Services") {
            root.children.push({ name: key, value: item.Size }); // Add children to root
        }
    });

    return root;
}

// Draw the TreeMap
function drawTreeMap(data) {
    const width = 1154;
    const height = 500;

    // Custom color scale using shades of #007385
    const color = d3.scaleLinear()
        .domain([0, d3.max(data.children, d => d.value)])
        .range(["#D3EFF4", "#007385"]); // Light blue to dark blue

    // Compute the layout
    const root = d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .paddingInner(3)
        .round(true)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    // Create SVG container
    const svg = d3.select("#d3_chart_div")
        .html("") // Clear previous contents
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height)
        .attr("style", "font: 10px sans-serif;");

    // Add a group for each leaf node
    const node = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Add title (tooltip) for each node
    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d.value}`);

    // Add rectangles for each node
    node.append("rect")
        .attr("id", d => (d.leafUid = d.data.name))
        .attr("fill", d => color(d.value))
        .attr("fill-opacity", 0.9)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on("click", function(event, d) {
            const description = itemDescriptions[d.data.name] || 'No description available for ' + d.data.name;
            document.getElementById('info').innerText = description; // Show description on click
        });

    // Define clip paths for text clipping
    node.append("clipPath")
        .attr("id", d => (d.clipUid = `clip-${d.leafUid}`))
        .append("use")
        .attr("xlink:href", d => `#${d.leafUid}`);

    // Add text for each node
    const text = node.append("text")
        .attr("clip-path", d => `url(#clip-${d.leafUid})`)
        .attr("x", 4)
        .attr("y", 20)
        .attr("fill", "white");

    // Add service name with font size 18px
    text.append("tspan")
        .attr("x", 4)
        .attr("y", 20)
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text(d => d.data.name);

    // Add enrollment number with font size 14px
    text.append("tspan")
        .attr("x", 4)
        .attr("y", 40)
        .style("font-size", "14px")
        .text(d => `Enrollment: ${d.data.value}`);
}

// Load initial data when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
});

// Event listeners for buttons
document.getElementById('all-services-button').addEventListener('click', function() {
    loadData('services.json');
});

document.getElementById('eligibility-button').addEventListener('click', function() {
    loadData('elig.json');
});
