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

// Draw the TreeMap
function drawTreeMap(data) {
    const container = document.getElementById('d3_chart_div');
    
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Custom color scale using shades of #007385
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
        .attr("x", paddingLeft)
        .attr("y", paddingTop + 5)
        .attr("fill", "black")
        .attr("class", "node-text")
        //.style("font-weight", "bold")
        .text(d => d.data.name)
        .call(wrap, 10)


    // createBasicLegend(color);
    
}

/*
// Legend
function createBasicLegend(colorScale) {
    const legendContainer = d3.select("#legend").html("").append("svg")
        .attr("width", 300)
        .attr("height", 70) // Increased height to accommodate the title above
        .style("font", "10px open-sans");

    const legendScale = d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, 300]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(2); // Only two ticks

    const gradient = legendContainer.append("defs").append("linearGradient")
        .attr("id", "legend-gradient");

    gradient.selectAll("stop")
        .data(colorScale.ticks(10).map((t, i, n) => ({ 
            offset: `${100 * i / n.length}%`, 
            color: colorScale(t) 
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendContainer.append("rect")
        .attr("width", 300)
        .attr("height", 20)
        .attr("y", 20) // Moved down to make space for the title
        .style("fill", "url(#legend-gradient)");

    legendContainer.append("g")
        .attr("transform", "translate(0,40)") // Adjusted to match the new position of the rect
        .call(legendAxis);

    legendContainer.append("text")
        .attr("x", 150)
        .attr("y", 10) // Positioned above the legend
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Spending");
}
*/ 

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
    });
}


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
