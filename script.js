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
    fetch(jsonFile + '?_=' + new Date().getTime()) // Append a unique query string to disable caching
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
        } else if (item.Parent === "Services") {    // Note if parent is not ervices, this will break
            root.children.push({ name: key, value: item.Size, spending: item.Spending }); // Add children to root with spending
        }
    });
    return root;
}

// Function to update the header text
function updateHeader(title) {
    document.getElementById('tree-map-header').innerText = title;
}

// Function to draw tree map
function drawTreeMap(data) {
    const container = document.getElementById('d3_chart_div');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Custom color scale using shades of blue
    const color = d3.scaleLinear()
        .domain([0, d3.max(data.children, d => d.value)])
        .range(["#E6F7FA", "#BBDCE1"]); // Light blue to dark blue

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
            if (d.data.name === "Other") {
                loadData('other.json');
                updateHeader("Other Services");
            } else {
                const description = itemDescriptions[d.data.name] || 'No description available';
                const formattedDescription = `${d.data.name} - ${description}\n${format(d.value)} individuals enrolled`;
                document.getElementById('info').innerText = formattedDescription; // Show description on click
            }
        });

    // Add text for each node
    node.append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("fill", "black")
        .attr("class", "node-text")
        .style("text-anchor", "middle")
        .text(d => d.data.name)
        .call(wrap, function(d) { return d.x1 - d.x0 - 2 * paddingLeft; });

    // Add enrolled text for large nodes
    node.filter(d => d.value >= 250000)          // check size for determinging is a box gets data
        .append("text")                             
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2 + 20)
        .attr("fill", "black")
        .attr("class", "node-text-enrolled")
        .style("text-anchor", "middle")
        .text(d => `${format(d.value)} enrolled`);
}

// Function to wrap text within a given width
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
        // Center the text vertically within the box
        const bbox = text.node().getBBox();
        const textHeight = bbox.height;
        const boxHeight = d3.select(text.node().parentNode).select('rect').attr('height');
        text.attr('y', +y + (boxHeight - textHeight) / 2);
    });
}


// Event listeners 
// Load initial data when the document is ready
document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
    updateHeader("All Massachusetts Services");
});

// Event listeners for buttons (Mobile)
document.getElementById('all-services-button').addEventListener('click', function() {
    loadData('services.json');
    updateHeader("All Massachusetts Services");
    toggleMenu();
});
document.getElementById('eligibility-button').addEventListener('click', function() {
    loadData('elig.json');
    updateHeader("Eligibility Services");
    toggleMenu();
});
document.getElementById('other-button').addEventListener('click', function() {
    loadData('other.json');
    updateHeader("Other Services");
    toggleMenu();
});

// Event listeners for buttons (Desktop)
document.getElementById('all-services-button-desktop').addEventListener('click', function() {
    loadData('services.json');
    updateHeader("All Massachusetts Services");
});
document.getElementById('eligibility-button-desktop').addEventListener('click', function() {
    loadData('elig.json');
    updateHeader("Eligibility Services");
});
document.getElementById('other-button-desktop').addEventListener('click', function() {
    loadData('other.json');
    updateHeader("Other Services");
});

// Toggle mobile menu 
function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    if (menu.style.display === "block") {
        menu.style.display = "none";
    } else {
        menu.style.display = "block";
    }
}
