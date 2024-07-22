let currentData; // Variable to store the current hierarchical data
let currentView = 'tree'; // Variable to track the current view (tree or table)
let currentFile = 'services.json'; // Variable to track the current data file

/**
 * loadData(jsonFile)
 * Loads data from a specified JSON file and draws the initial view with a fade-in effect.
 * @param {string} jsonFile - The path to the JSON file.
 */
function loadData(jsonFile) {
    fade('#d3_chart_div, #table_div', 250, () => {
        clearSidebar();                                     // Clear the sidebar content
        fetch(jsonFile + '?_=' + new Date().getTime())      // Fetch the JSON file with a unique query to disable caching
            .then(response => response.json())              // Parse the response as JSON
            .then(data => {
                currentData = buildHierarchy(data);         // Convert flat data to hierarchical
                if (currentView === 'tree') {               // Check if the current view is 'tree'
                    drawTreeMap(currentData, true);         // Draw the tree map
                } else {
                    drawTable(currentData); // Draw the table
                }
                window.addEventListener('resize', () => {   // Add event listener to handle window resize
                    if (currentView === 'tree') {
                        drawTreeMap(currentData, false);    // Redraw tree map on resize
                    } else {
                        drawTable(currentData);             // Redraw table on resize
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error)); // Log any errors
    });
}

/**
 * buildHierarchy(data)
 * Converts flat data to a hierarchical format needed for the tree map.
 * @param {object} data - The flat data to convert.
 * @returns {object} - The hierarchical data.
 */
function buildHierarchy(data) {
    const root = { name: "Services", children: [] };    // Root node
    const dataMap = new Map();                          // Map to store data nodes

    Object.keys(data).forEach(key => {          // First pass to create nodes for each key
        dataMap.set(key, {  
            name: key,                          // Name of service
            value: data[key].Size,              // Number of people 
            spending: data[key].Spending,       // Spending 
            color: data[key].Color,             // Color of tree map node (based on size)
            department: data[key].Department,   // Mass.gov department
            parent: data[key].Parent,           // Parent node for tree map
            roundSize: data[key].RoundSize,     // For displaying size rounded, will make this a function later
            roundSpend: data[key].RoundSpend,   // For displaying spending rounded, will make this a function later
            site: data[key].Site,               // URL to Mass.gov site for each service
            description: data[key].Description, // Description of service
            eligibility: data[key].Elig,        // Eligibility criteria
            children: []
        });
    });

    dataMap.forEach((value, key) => {           // Second pass to link children to their parents
        if (value.parent === "Services") {      // Check if the node is a child of the root
            root.children.push(value);          // Add to root's children
        } else if (dataMap.has(value.parent)) {                 // Check if the parent exists in the map
            dataMap.get(value.parent).children.push(value);     // Add to parent's children
        }
    });
    return root;                                // Return the hierarchical data
}

/**
 * updateHeader(title)
 * Updates the header text and the back button visibility.
 * @param {string} title - The title to set in the header.
 */
function updateHeader(title) {
    document.getElementById('tree-map-header').innerHTML = `<button id="back-button" class="back-button" style="display: ${currentFile === 'other.json' ? 'inline-block' : 'none'};">&lt;</button> ${title}`; // Update header HTML
    document.getElementById('back-button').addEventListener('click', function() {   // Add click event to back button
        loadData('services.json');                                                  // Load the main data file
        currentFile = 'services.json';                                              // Set current file to main data file
        updateHeader("All Services");                                               // Update header text
        document.getElementById('back-button').style.display = 'none';              // Hide back button
    });
}

function drawTreeMap(data, transition = false) {
    const chartDiv = document.getElementById('d3_chart_div');
    chartDiv.style.display = 'block';
    chartDiv.style.opacity = 1;
    document.getElementById('table_div').style.display = 'none';
    document.getElementById('statistics').style.display = 'block';
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

    const padding = 5;
    const yOffset = 10; // Offset to move text slightly down

    node.each(function(d) {
        const group = d3.select(this);
        const nameFontSize = Math.min((d.x1 - d.x0) / 10, (d.y1 - d.y0) / 3.3);
        const smallFontSize = nameFontSize * 0.8;
        const lineHeight = smallFontSize * 1.1;

        // Adjust y positions here
        group.append("text")
            .attr("x", (d.x1 - d.x0) / 2)
            .attr("y", (d.y1 - d.y0) / 2 - lineHeight + yOffset)
            .attr("fill", "black")
            .attr("class", "node-text")
            .style("text-anchor", "middle")
            .style("font-size", nameFontSize + 'px')
            .text(d.data.name)
            .call(wrapText, d.x1 - d.x0 - padding * 2);

        group.append("text")
            .attr("x", (d.x1 - d.x0) / 2)
            .attr("y", (d.y1 - d.y0) / 2 + yOffset)
            .attr("fill", "black")
            .attr("class", "node-text-enrolled")
            .style("text-anchor", "middle")
            .style("font-size", smallFontSize + 'px')
            .text(`${d.data.roundSize} people`)
            .call(wrapText, d.x1 - d.x0 - padding * 2);

        group.append("text")
            .attr("x", (d.x1 - d.x0) / 2)
            .attr("y", (d.y1 - d.y0) / 2 + lineHeight + yOffset)
            .attr("fill", "black")
            .attr("class", "node-text-enrolled")
            .style("text-anchor", "middle")
            .style("font-size", smallFontSize + 'px')
            .text(`$${d.data.roundSpend} spent`)
            .call(wrapText, d.x1 - d.x0 - padding * 2);
    });
}


/**
 * handleNodeClick(d)
 * Handles click events on tree map nodes.
 * @param {object} d - The clicked node data.
 */
function handleNodeClick(d) {
    if (d.data.name === "Other") { // Check if the node name is 'Other'
        loadData('other.json'); // Load other data file
        currentFile = 'other.json'; // Set current file to other data file
        updateHeader("Other Services"); // Update header text
    } else {
        displayNodeInfo(d.data); // Display node info in the sidebar
    }
}

/**
 * displayNodeInfo(data)
 * Displays the node information in the statistics sidebar.
 * @param {object} data - The data of the clicked node.
 */
function displayNodeInfo(data) {
    const statisticsDiv = document.getElementById('statistics');
    const eligibility = data.eligibility && typeof data.eligibility === 'object';

    let eligibilityHtml = '';
    if (eligibility) {
        if (data.eligibility.Income) {
            eligibilityHtml += `<p>Max Income per Year: ${data.eligibility.Income}</p>`;
        }
        if (data.eligibility.Benefit) {
            eligibilityHtml += `<p>Benefits per Year: ${data.eligibility.Benefit}</p>`;
        }
        if (data.eligibility.Age) {
            eligibilityHtml += `<p>Age: ${data.eligibility.Age}</p>`;
        }
        if (data.eligibility.Resident) {
            eligibilityHtml += `<p>Residency: ${data.eligibility.Resident}</p>`;
        }
        if (data.eligibility.Other) {
            eligibilityHtml += `<p>Other: ${data.eligibility.Other}</p>`;
        }
        if (data.eligibility.URL) {
            eligibilityHtml += `<p><a href="${data.eligibility.URL}" target="_blank" class="apply-now-link">Apply Now!</a></p>`;
        }        
    }

    const formattedValue = data.value.toLocaleString();
    const formattedSpending = data.spending.toLocaleString();

    statisticsDiv.innerHTML = `
        <h2>${data.name}</h2>
        <h3><a href="${data.site}" target="_blank">${data.description}</a></h3>
        
        ${data.roundSize ? `<p>People: ${formattedValue}</p>` : ''}
        ${data.roundSpend ? `<p>Spend: $${formattedSpending}</p>` : ''}
        ${data.department ? `<p>Department: ${data.department}</p>` : ''}
        
        ${eligibilityHtml ? `<h3>Eligibility Criteria for an Individual</h3>${eligibilityHtml}` : ''}
        
    `;
    statisticsDiv.classList.add('visible'); // for mobile
}



/**
 * clearSidebar()
 * Clears the content of the sidebar.
 */
function clearSidebar() {
    const statisticsDiv = document.getElementById('statistics');
    statisticsDiv.innerHTML = '';
    statisticsDiv.classList.remove('visible');
}

/**
 * drawTable(data)
 * Draws the table visualization.
 * @param {object} data - The hierarchical data to visualize.
 */
function drawTable(data) {
    document.getElementById('d3_chart_div').style.display = 'none'; // Hide the chart div
    document.getElementById('table_div').style.display = 'block'; // Display the table div
    document.getElementById('statistics').style.display = 'none'; // Hide the statistics sidebar
    clearSidebar(); // Clear the sidebar content
    highlightSelectedViewButton('table'); // Highlight the table view button

    const flatData = data.children.map(d => ({
        name: d.name,
        size: d.value,
        spending: d.spending,
        department: d.department,
        site: d.site,
        description: d.description // Add description from JSON
    })); // Flatten the hierarchical data

    const format = d3.format(","); // Create number formatter for commas

    const tableDiv = d3.select("#table_div"); // Select the table div
    tableDiv.html(""); // Clear previous contents

    const table = tableDiv.append("table").attr("class", "data-table"); // Append table element
    const thead = table.append("thead"); // Append thead element
    const tbody = table.append("tbody"); // Append tbody element

    thead.append("tr") // Append row to thead
        .selectAll("th") // Select all th elements
        .data(["Service", "People", "Spend", "Department", "Description"]) // Bind data including Description
        .enter() // Enter selection
        .append("th") // Append th elements
        .text(d => d); // Set text

    const rows = tbody.selectAll("tr") // Select all rows
        .data(flatData) // Bind data
        .enter() // Enter selection
        .append("tr") // Append rows
        .on("click", function(event, d) { // Add click event listener
            if (d.name === "Other") {
                loadData('other.json'); // Load other data file
                currentFile = 'other.json'; // Set current file to other data file
                updateHeader("Other Services"); // Update header text
            }
        });

    rows.selectAll("td") // Select all cells
        .data(d => [
            d.name === 'Other' ? d.name : `<a href="${d.site}" target="_blank">${d.name}</a>`, // Links to mass gov page, no link for other
            format(d.size),
            `$${format(d.spending)}`, // Add $ in front of spending
            d.department,
            d.description // Include description
        ]) // Bind data and format size and spending
        .enter() // Enter selection
        .append("td") // Append cells
        .html(d => d); // Set HTML content
    
    tableDiv.transition() // Add transition effect
        .duration(750) // Set duration
        .style("opacity", 1); // Set opacity
}



/**
 * wrapText(text, width)
 * Wraps text within specified width.
 * @param {object} text - The D3 text selection.
 * @param {number} width - The maximum width for the text.
 */
function wrapText(text, width) {
    text.each(function() {
        var text = d3.select(this), // Select the text element
            words = text.text().split(/\s+/).reverse(), // Split text into words
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em"); // Append tspan element
        while (word = words.pop()) { // Loop through words
            line.push(word); // Add word to line
            tspan.text(line.join(" ")); // Set tspan text
            if (tspan.node().getComputedTextLength() > width) { // Check if text exceeds width
                line.pop(); // Remove last word
                tspan.text(line.join(" ")); // Set tspan text
                line = [word]; // Start new line
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word); // Append new tspan
            }
        }
        const bbox = text.node().getBBox(); // Get bounding box
        const textHeight = bbox.height; // Get text height
        const boxHeight = d3.select(text.node().parentNode).select('rect').attr('height'); // Get parent rect height
        text.attr('y', +y + (boxHeight - textHeight) / 2); // Adjust y position
    });
}

/**
 * highlightSelectedViewButton(view)
 * Highlights the selected view button.
 * @param {string} view - The view to highlight (tree or table).
 */
function highlightSelectedViewButton(view) {
    currentView = view; // Set current view
    document.querySelectorAll('.view-button').forEach(button => { // Loop through view buttons
        button.classList.remove('selected'); // Remove selected class
    });
    if (view === 'tree') { // Check if view is 'tree'
        document.getElementById('tree-view-button').classList.add('selected'); // Add selected class to tree view button
        document.getElementById('tree-view-button-mobile').classList.add('selected'); // Add selected class to mobile tree view button
    } else {
        document.getElementById('table-view-button').classList.add('selected'); // Add selected class to table view button
        document.getElementById('table-view-button-mobile').classList.add('selected'); // Add selected class to mobile table view button
    }
}

/**
 * highlightSelectedFilterButton(filter)
 * Highlights the selected filter button.
 * @param {string} filter - The filter to highlight (all or core).
 */
function highlightSelectedFilterButton(filter) {
    document.querySelectorAll('.filter-button').forEach(button => { // Loop through filter buttons
        button.classList.remove('selected'); // Remove selected class
    });
    if (filter === 'all') { // Check if filter is 'all'
        document.getElementById('all-services-button').classList.add('selected'); // Add selected class to all services button
        document.getElementById('all-services-button-mobile').classList.add('selected'); // Add selected class to mobile all services button
    } else if (filter === 'core') { // Check if filter is 'core'
        document.getElementById('eligibility-button').classList.add('selected'); // Add selected class to core services button
        document.getElementById('eligibility-button-mobile').classList.add('selected'); // Add selected class to mobile core services button
    }
}

/**
 * Event listener for DOMContentLoaded event
 * Initial load of data and setting up event listeners.
 */
document.addEventListener("DOMContentLoaded", function() {
    loadData('services.json'); // Load the main data file
    updateHeader("All Services"); // Update header text
    setupEventListeners(); // Setup event listeners
    highlightSelectedFilterButton("all"); // Highlight all services button
    highlightSelectedViewButton("tree"); // Highlight tree view button
});

/**
 * setupEventListeners()
 * Sets up event listeners for the navigation and filter buttons.
 */
function setupEventListeners() {
    const actions = [
        { id: 'back-button', file: 'services.json', header: 'All Services', showBackButton: false },
        { id: 'all-services-button', file: 'services.json', header: 'All Services', showBackButton: false },
        { id: 'eligibility-button', file: 'elig.json', header: 'Benefits', showBackButton: true },
        { id: 'see-code-button', action: () => window.open('https://github.com/goinvo/ma-services', '_blank') },
        { id: 'tree-view-button', action: () => drawTreeMap(currentData) },
        { id: 'table-view-button', action: () => drawTable(currentData) },
        { id: 'all-services-button-mobile', file: 'services.json', header: 'All Services', showBackButton: false },
        { id: 'eligibility-button-mobile', file: 'elig.json', header: 'Benefits', showBackButton: true },
        { id: 'tree-view-button-mobile', action: () => drawTreeMap(currentData) },
        { id: 'table-view-button-mobile', action: () => drawTable(currentData) },
        { id: 'see-code-button-mobile', action: () => window.open('https://github.com/goinvo/ma-services', '_blank') }
    ];

    actions.forEach(({ id, file, header, showBackButton, action }) => { // Loop through actions
        const element = document.getElementById(id); // Get the element by ID
        if (element) { // Check if element exists
            element.addEventListener('click', () => { // Add click event listener
                if (action) { // Check if action is defined
                    action(); // Execute action
                } else {
                    loadData(file); // Load specified data file
                    currentFile = file; // Set current file
                    updateHeader(header); // Update header text
                    document.getElementById('back-button').style.display = file === 'other.json' ? 'inline-block' : 'none'; // Set back button visibility
                    if (id.includes('all-services-button')) { // Check if ID includes 'all-services-button'
                        highlightSelectedFilterButton('all'); // Highlight all services button
                    } else if (id.includes('eligibility-button')) { // Check if ID includes 'eligibility-button'
                        highlightSelectedFilterButton('core'); // Highlight core services button
                    }
                }
            });
        }
    });
}

/**
 * fade(selector, duration, callback)
 * Fades out the specified elements, then executes the callback, and fades the elements back in.
 * @param {string} selector - The selector of the elements to fade.
 * @param {number} duration - The duration of the fade effect.
 * @param {function} callback - The callback function to execute after fade-out.
 */
function fade(selector, duration, callback) {
    const elements = d3.selectAll(selector);
    elements.transition()
        .duration(duration)
        .style("opacity", 0)
        .on("end", () => {
            callback();
            elements.transition()
                .duration(duration)
                .style("opacity", 1);
        });
}
