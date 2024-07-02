const itemDescriptions = {
    'MassHealth': 'Enrollment 2 million',
    'TAFDC': 'Description ',
    // Add more items and descriptions as needed
};

function loadSheet(sheetType) {
    let sheetUrl;
    if (sheetType === 'all') {
        sheetUrl = 'https://docs.google.com/spreadsheets/d/1nKfr0JKhdzhHCMK1ilWhLRfPzgBd5fbpZTtXtOdglsg/gviz/tq?sheet=Sheet1';
    } else if (sheetType === 'eligibility') {
        sheetUrl = 'https://docs.google.com/spreadsheets/d/18zHBxhj_UAkdqEzQsVTFJ5siOZBqMEwjdA6Z0kPumxM/gviz/tq?sheet=Sheet1';
    }

    fetch(sheetUrl)
        .then(response => response.text())
        .then(dataText => {
            const jsonData = JSON.parse(dataText.substr(47).slice(0, -2));
            const data = processData(jsonData.table.rows);
            drawTreeMap(data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

function processData(rows) {
    let data = {
        name: "Services",
        children: []
    };

    rows.forEach(row => {
        data.children.push({
            name: row.c[0].v,
            value: row.c[1].v
        });
    });

    return data;
}

function drawTreeMap(data) {
    const width = 900;
    const height = 500;

    const svg = d3.select("#d3_chart_div")
        .html("")
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
    loadSheet('all');
});
