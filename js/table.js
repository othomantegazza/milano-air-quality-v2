function tableDays(data) {

    d = d3.create('div')

    d.append('table')
        .attr('id', 'daystable')
        .html(`<table>
                    <th>Pollutant</th>
                    <th>Pollutant Symbol</th>
                    <th>Days Measured</th>
                    <th>Days Above Limits</th>
                    <th>Frequency</th>
                    ${makeRow(data, 'Cylcic Aromatics', 'C6H6')}
                    ${makeRow(data, 'Carbon Monoxide', 'CO')}
                    ${makeRow(data, 'Nitrogen Dioxide', 'NO2')}
                    ${makeRow(data, 'Ozone', 'O3')}
                    ${makeRow(data, 'PM10', 'PM10')}
                    ${makeRow(data, 'PM2.5', 'PM25')}
                    ${makeRow(data, 'Sulphur Dioxide', 'SO2')}
                </table>`)

    return d.node()
}

function makeRow(data, pollName, pollutant) {
    let daysMeasured = data.filter((i) => {
        return (i.inquinante === pollutant & ! i.is_imputed)
    })
    let daysAboveLimit = daysMeasured.filter((i) => {
        return (i.valore > i.eu_limits)
    })
    
    let out
    out = `<tr>
                <td>${pollName}</td>
                <td>${pollutant}</td>
                <td>${daysMeasured.length}</td>
                <td>${daysAboveLimit.length}</td>
                <td>${d3.format('.0%')(daysAboveLimit.length/daysMeasured.length)}</td>
            </tr>`
    return out
}
