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
            }
        });

        var options = {
            minColor: '#e0f7fa', // Light blue
            midColor: '#80deea', // Medium blue
            maxColor: '#00796b', // Dark blue
            headerHeight: 15,
            fontColor: 'black',
            showScale: true
        };

        chart.draw(data, options);
    });
}

