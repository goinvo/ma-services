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
            const hierarchyData = buildHierarchy(data);
            drawTreeMap(hierarchyData);
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
    const height = 500;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const root = d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .paddingInner(3)
        .round(true)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    const svg = d3.select("#d3_chart_div")
        .html("")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", height)
        .attr("style", "font: 10px sans-serif;");

    const leaf = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    leaf.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d.value}`);

    leaf.append("rect")
        .attr("id", d => (d.leafUid = d.data.name))
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", 0.7)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on("click", function(event, d) {
            const description = itemDescriptions[d.data.name] || 'No description available for ' + d.data.name;
            document.getElementById('info').innerText = description;
        });

    leaf.append("text")
        .attr("clip-path", d => `url(#clip-${d.leafUid})`)
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][a-z])|\s+/g))
        .join("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .attr("fill-opacity", 0.9)
        .text(d => d);
}

document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
});
