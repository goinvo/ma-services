google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var query = new google.visualization.Query('https://docs.google.com/spreadsheets/d/1nKfr0JKhdzhHCMK1ilWhLRfPzgBd5fbpZTtXtOdglsg/gviz/tq?sheet=Sheet1');

    query.send(function(response) {
        if (response.isError()) {
            console.error('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
            return;
        }

        var data = response.getDataTable();
        var chart = new google.visualization.TreeMap(document.getElementById('chart_div'));

        google.visualization.events.addListener(chart, 'select', function() {
            var selection = chart.getSelection();
            if (selection.length > 0) {
                var item = data.getValue(selection[0].row, 0);
                document.getElementById('info').innerText = 'You selected: ' + item;
                chart.setSelection([]); // Clear the selection to prevent zooming
            }
        });

        var options = {
            minColor: '#D3EFF4', // Light blue
            midColor: '#9BC8CF', // Medium blue
            maxColor: '#007385', // Dark blue
            headerHeight: 25,
            fontColor: 'black',
            showScale: true,
            maxPostDepth: 2, // Ensures the header text is larger and more visible
            headerColor: '#007385'
        };

        chart.draw(data, options);
    });
}
