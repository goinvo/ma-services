const itemDescriptions = {
    'MassHealth': 'Massachusetts Health Insurance',
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

            // Redraw tree map on window resize
            window.addEventListener('resize', () => drawTreeMap(hierarchyData));
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
    const container = document.getElementById('d3_chart_div');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Custom color scale using shades of #007385
    const color = d3.scaleLinear()
        .domain([0, d3.max(data.children, d => d.value)])
        .range(["#B6DFE6", "#007385"]); // Light blue to dark blue

    // Number format with commas
    const format = d3.format(",");

    // Compute the layout with resquarify method
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
        .attr("height", "100%")
        .attr("style", "font: 10px sans-serif;");

    // Define padding values
    const paddingTop = 10;
    const paddingLeft = 10;

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
            const description = itemDescriptions[d.data.name] || 'No description available';
            const formattedDescription = `${d.data.name} - ${description}\n${format(d.value)} individuals enrolled`;
            document.getElementById('info').innerText = formattedDescription; // Show description on click
        });

    // Add text for each node
    node.append("text")
        .attr("x", paddingLeft)
        .attr("y", paddingTop + 12) // Adjust based on padding and font size
        .attr("fill", "white")
        .style("font-size", "16px")
        .each(function(d) {
            const node = d3.select(this);
            const words = d.data.name.split(/\s+/).reverse();
            let word;
            const line = [];
            const lineHeight = 1.1; // ems
            let lineNumber = 0;
            const x = node.attr("x");
            const y = node.attr("y");
            const dy = parseFloat(node.attr("dy") || 0);
            let tspan = node.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > (d.x1 - d.x0 - paddingLeft * 2)) { // Adjust width for padding
                    line.pop();
                    tspan.text(line.join(" "));
                    line.length = 0;
                    line.push(word);
                    tspan = node.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });

    // Add enrollment number below name
    node.append("text")
        .attr("x", paddingLeft)
        .attr("y", function(d) {
            const textHeight = this.previousSibling.getBBox().height;
            return paddingTop + textHeight + 12; // Adjust to place below the name
        })
        .attr("fill", "white")
        .style("font-size", "12px")
        .text(d => format(d.value));
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
