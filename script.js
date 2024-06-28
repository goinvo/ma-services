google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(() => loadSheet('all'));

const itemDescriptions = {
    'MassHealth': 'Enrollment 2 million',
    'TAFDC': 'Description ',',
    // Add more items and descriptions as needed
};

let chart;
let options = {
    minColor: '#D3EFF4', // Light blue
    midColor: '#9BC8CF', // Medium blue
    maxColor: '#007385', // Dark blue
    headerHeight: 25,
    fontColor: 'black',
    showScale: true,
    useWeightedAverageForAggregation: true
};

function loadSheet(sheetType) {
    let sheetUrl;
    if (sheetType === 'all') {
        sheetUrl = 'https://docs.google.com/spreadsheets/d/1nKfr0JKhdzhHCMK1ilWhLRfPzgBd5fbpZTtXtOdglsg/gviz/tq?sheet=Sheet1';
    } else if (sheetType === 'eligibility') {
        sheetUrl = 'https://docs.google.com/spreadsheets/d/18zHBxhj_UAkdqEzQsVTFJ5siOZBqMEwjdA6Z0kPumxM/gviz/tq?sheet=Sheet1';
    }

    var query = new google.visualization.Query(sheetUrl);

    query.send(function(response) {
        if (response.isError()) {
            console.error('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
            return;
        }

        var data = response.getDataTable();
        if (!chart) {
            chart = new google.visualization.TreeMap(document.getElementById('chart_div'));
        }

        google.visualization.events.addListener(chart, 'select', function() {
            var selection = chart.getSelection();
            if (selection.length > 0) {
                var item = data.getValue(selection[0].row, 0);
                var description = itemDescriptions[item] || 'No description available for ' + item;
                document.getElementById('info').innerText = description;
                chart.setSelection([]); // Clear the selection to prevent zooming
            }
        });

        chart.draw(data, options);
    });
}
