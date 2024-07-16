let currentData; // Track the current hierarchical data
let currentView = 'tree'; // Track the current view
let currentFile = 'services.json'; // Track the current data file

// Load data from JSON file
function loadData(jsonFile) {
    fetch(jsonFile + '?_=' + new Date().getTime()) // Append a unique query string to disable caching
        .then(response => response.json())
        .then(data => {
            currentData = buildHierarchy(data); // Convert flat data to hierarchical
            if (currentView === 'tree') {
                drawTreeMap(currentData, true);
            } else {
                drawTable(currentData);
            }
            window.addEventListener('resize', () => {
                if (currentView === 'tree') {
                    drawTreeMap(currentData, false);
                } else {
                    drawTable(currentData);
                }
            }); // Redraw tree map or table on window resize
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Convert flat data to hierarchical format (needed for tree map)
function buildHierarchy(data) {
    const root = { name: "Services", children: [] };
    Object.keys(data).forEach(key => {
        const item = data[key];
        if (item.Parent === "") {
            root.name = key; // Set root name
        } else if (item.Parent === "Services") {    
            root.children.push({ name: key, value: item.Size, spending: item.Spending }); // Add children to root with spending
        }
    });
    return root;
}

// Updates header text
function updateHeader(title) {
    document.getElementById('tree-map-header').innerHTML = `<button id="back-button" class="back-button" style="display: ${currentFile === 'other.json' ? 'inline-block' : 'none'};">&lt;</button> ${title}`;
    document.getElementById('back-button').addEventListener('click', function() {
        loadData('services.json');
        currentFile = 'services.json';
        updateHeader("All Massachusetts Services");
        document.getElementById('back-button').style.display = 'none';
    });
}

// Draws tree map
function drawTreeMap(data, transition = false) {
    const chartDiv = document.getElementById('d3_chart_div');
    chartDiv.style.display = 'block';
    chartDiv.style.opacity = 0;  // Added to set initial opacity to 0
    document.getElementById('table_div').style.display = 'none';
    highlightSelectedViewButton('tree');

    const container = document.getElementById('d3_chart_div');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const color = d3.scaleLinear()
        .domain([0, d3.max(data.children, d => d.value)])
        .range(["#E6F7FA", "#BBDCE1"]);

    const format = d3.format(",");

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
        .attr("height", "100%")
        .attr("style", "font: 10px sans-serif;");

    const node = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .on("click", (event, d) => handleNodeClick(d));

    node.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d.value}`);

    node.append("rect")
        .attr("id", d => (d.leafUid = d.data.name))
        .attr("fill", d => color(d.value))
        .attr("fill-opacity", 0.9)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    if (transition) {
        d3.select("#d3_chart_div")
            .transition()  // Added to apply transition
            .duration(750)
            .style("opacity", 1);  // Added to transition opacity to 1
    } else {
        chartDiv.style.opacity = 1;
    }

    node.append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2)
        .attr("fill", "black")
        .attr("class", "node-text")
        .style("text-anchor", "middle")
        .text(d => d.data.name)
        .call(wrapText, function(d) { return d.x1 - d.x0 - 2 * paddingLeft; });

    node.filter(d => d.value >= 250000)
        .append("text")
        .attr("x", d => (d.x1 - d.x0) / 2)
        .attr("y", d => (d.y1 - d.y0) / 2 + 20)
        .attr("fill", "black")
        .attr("class", "node-text-enrolled")
        .style("text-anchor", "middle")
        .text(d => `${format(d.value)} enrolled`);
}


// Draws table
function drawTable(data) {
    document.getElementById('d3_chart_div').style.display = 'none';
    document.getElementById('table_div').style.display = 'block';
    highlightSelectedViewButton('table');

    const flatData = data.children.map(d => ({
        name: d.name,
        value: d.value
    }));

    const tableDiv = d3.select("#table_div");
    tableDiv.html(""); // Clear previous contents

    const table = tableDiv.append("table").attr("class", "data-table");
    const thead = table.append("thead");
    const tbody = table.append("tbody");

    thead.append("tr")
        .selectAll("th")
        .data(["Service Name", "Enrolled"])
        .enter()
        .append("th")
        .text(d => d);

    const rows = tbody.selectAll("tr")
        .data(flatData)
        .enter()
        .append("tr")
        .on("click", (event, d) => {
            if (d.name === 'Other') {
                loadData('other.json');
                currentFile = 'other.json';
                updateHeader("Other Services");
            }
        });

    rows.selectAll("td")
        .data(d => [d.name, d.value])
        .enter()
        .append("td")
        .text(d => d);
    
    tableDiv.transition()
        .duration(750)
        .style("opacity", 1);
}

function handleNodeClick(d) {
    if (d.data.name === "Other") {
        zoom(d); // Initiate zoom transition
        setTimeout(() => {
            loadData('other.json');
            currentFile = 'other.json';
            updateHeader("Other Services");
        }, 750); // Load new data after the zoom transition
    }
}



// Text wrapping
function wrapText(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
        const bbox = text.node().getBBox();
        const textHeight = bbox.height;
        const boxHeight = d3.select(text.node().parentNode).select('rect').attr('height');
        text.attr('y', +y + (boxHeight - textHeight) / 2);
    });
}

// Highlight selected view button
function highlightSelectedViewButton(view) {
    currentView = view;
    document.querySelectorAll('.view-button').forEach(button => {
        button.classList.remove('selected');
    });
    if (view === 'tree') {
        document.getElementById('tree-view-button').classList.add('selected');
        document.getElementById('tree-view-button-mobile').classList.add('selected');
    } else {
        document.getElementById('table-view-button').classList.add('selected');
        document.getElementById('table-view-button-mobile').classList.add('selected');
    }
}
// Highlight selected filter button
function highlightSelectedFilterButton(filter) {
    document.querySelectorAll('.filter-button').forEach(button => {
        button.classList.remove('selected');
    });
    if (filter === 'all') {
        document.getElementById('all-services-button').classList.add('selected');
        document.getElementById('all-services-button-mobile').classList.add('selected');
    } else if (filter === 'core') {
        document.getElementById('eligibility-button').classList.add('selected');
        document.getElementById('eligibility-button-mobile').classList.add('selected');
    }
}

// Initial load -- all services in tree view
document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json');
    updateHeader("All Massachusetts Services");
    setupEventListeners();
    highlightSelectedFilterButton("all");
    highlightSelectedViewButton("tree");
});

// Event listeners 
function setupEventListeners() {
    const actions = [
        { id: 'back-button', file: 'services.json', header: 'All Massachusetts Services', showBackButton: false },
        { id: 'all-services-button', file: 'services.json', header: 'All Massachusetts Services', showBackButton: false },
        { id: 'eligibility-button', file: 'elig.json', header: 'Eligibility Services', showBackButton: true },
        { id: 'see-code-button', action: () => window.open('https://github.com/goinvo/ma-services', '_blank') },
        { id: 'tree-view-button', action: () => drawTreeMap(currentData) },
        { id: 'table-view-button', action: () => drawTable(currentData) },
        { id: 'all-services-button-mobile', file: 'services.json', header: 'All Massachusetts Services', showBackButton: false },
        { id: 'eligibility-button-mobile', file: 'elig.json', header: 'Eligibility Services', showBackButton: true },
        { id: 'tree-view-button-mobile', action: () => drawTreeMap(currentData) },
        { id: 'table-view-button-mobile', action: () => drawTable(currentData) },
        { id: 'see-code-button-mobile', action: () => window.open('https://github.com/goinvo/ma-services', '_blank') }
    ];

    actions.forEach(({ id, file, header, showBackButton, action }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', () => {
                if (action) {
                    action();
                } else {
                    loadData(file);
                    currentFile = file;
                    updateHeader(header);
                    document.getElementById('back-button').style.display = file === 'other.json' ? 'inline-block' : 'none';
                    if (id.includes('all-services-button')) {
                        highlightSelectedFilterButton('all');
                    } else if (id.includes('eligibility-button')) {
                        highlightSelectedFilterButton('core');
                    }
                }
            });
        }
    });
}

// Zoom into other transition -- really not necessary
function zoom(d) {
    const chartDiv = document.getElementById('d3_chart_div');
    const width = chartDiv.clientWidth;
    const height = chartDiv.clientHeight;

    const x = d3.scaleLinear()
        .domain([d.x0, d.x1])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([d.y0, d.y1])
        .range([0, height]);

    const svg = d3.select("#d3_chart_div svg");

    const t = svg.transition()
        .duration(750)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

    svg.selectAll("g")
        .transition(t)
        .attr("transform", d => `translate(${x(d.x0)},${y(d.y0)})`);

    svg.selectAll("rect")
        .transition(t)
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.y0))
        .attr("width", d => x(d.x1) - x(d.x0))
        .attr("height", d => y(d.y1) - y(d.y0));
}

