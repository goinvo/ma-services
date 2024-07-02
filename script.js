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

function loadData(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            drawTreeMap(buildHierarchy(data));
        })
        .catch(error => console.error('Error fetching data:', error));
}

function buildHierarchy(data) {
    const root = { name: "Services", children: [] };

    Object.keys(data).forEach(key => {
        const item = data[key];
        if (item.Parent === "") {
            root.name = key;
        } else if (item.Parent === "Services") {
            root.children.push({ name: key, value: item.Size });
        }
    });

    return root;
}

function drawTreeMap(data) {
    const width = 1154;
    const height = 1154;

    const color = d3.scaleOrdinal(data.children.map(d => d.name), d3.schemeTableau10);

    const root = d3.treemap()
        .tile(d3.treemapSquarify)
        .size([width, height])
        .padding(5)  // Increase padding
        .round(true)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    const svg = d3.select("#d3_chart_div")
        .html("")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    const format = d3.format(",d");
    leaf.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join(".")}\n${format(d.value)}`);

    leaf.append("rect")
        .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", 0.6)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on("click", function(event, d) {
            const description = itemDescriptions[d.data.name] || 'No description available for ' + d.data.name;
            document.getElementById('info').innerText = description;
        });

    leaf.append("clipPath")
        .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
        .append("use")
        .attr("xlink:href", d => d.leafUid.href);

    leaf.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g).concat(format(d.value)))
        .join("tspan")
        .attr("x", 10)  // Add more padding
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.2 + i * 1.0}em`)  // Adjust y-position for more space
        .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
        .style("font-size", "14px")  // Increase font size
        .text(d => d);
}

document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
});

