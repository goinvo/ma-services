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
            minColor: '#E0F7FA', // Light blue
            midColor: '#4FC3F7', // Medium blue
            maxColor: '#01579B', // Dark blue
            headerHeight: 15,
            fontColor: 'black',
            showScale: true,
            useWeightedAverageForAggregation: true,
            generateTooltip: showFullTooltip,
        };

        chart.draw(data, options);
    });
}

function showFullTooltip(row, size, value) {
    return '<div style="background:#fd9; padding:10px; border-style:solid">' +
           '<span style="font-family:Courier"><b>' + row + '</b>, ' + size + '</span><br>' +
           '</div>';
}
