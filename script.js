// Load the Visualization API and the treemap package.
google.charts.load('current', {'packages':['treemap']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    // Replace the URL below with the URL of your Google Sheet
    var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1nKfr0JKhdzhHCMK1ilWhLRfPzgBd5fbpZTtXtOdglsg/gviz/tq?sheet=Sheet1');

    query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
    if (response.isError()) {
        console.error('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
    }

    var data = response.getDataTable();

    var options = {
        minColor: '#f00',
        midColor: '#ddd',
        maxColor: '#0d0',
        headerHeight: 15,
        fontColor: 'black',
        showScale: true
    };

    var chart = new google.visualization.TreeMap(document.getElementById('chart_div'));
    chart.draw(data, options);
}
