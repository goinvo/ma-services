const itemDescriptions = {
    'MassHealth': 'Enrollment 2 million',
    'TAFDC': 'Description ',
    'EAEDC': 'Description ',
    'SNAP': 'Description ',
    'LIHEAP': 'Description ',
    'SSDI': 'Description ',
    'SSI': 'Description '
    // Add more items and descriptions as needed
};

function loadData(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const hierarchy = buildHierarchy(data);
            drawTreeMap(hierarchy);
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
    const width = 900;
    const height = 500;

    const svg = d3.select("#d3_chart_div")
        .html("") // Clear any existing content
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    d3.treemap()
        .size([width, height])
        .padding(1)(root);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("id", d => d.data.name)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => {
            const scale = d3.scaleLinear()
                .domain([0, d3.max(root.leaves(), d => d.value)])
                .range(["#D3EFF4", "#007385"]);
            return scale(d.value);
        })
        .on("click", function(event, d) {
            const description = itemDescriptions[d.data.name] || 'No description available for ' + d.data.name;
            document.getElementById('info').innerText = description;
        });

    cell.append("text")
        .attr("x", 4)
        .attr("y", 14)
        .text(d => d.data.name)
        .attr("fill", "white");
}

document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
});
