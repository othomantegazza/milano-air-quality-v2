const convert = require('xml-js');
const fs = require('fs');

convertScicoPalette('data/tokyo_PARAVIEW.xml', 'data/tokyo-palette.json')

function convertScicoPalette(path_in, path_out) {
  fs.readFile(path_in, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    const pal = convert.xml2json(data, { compact: true, spaces: 4 })
    const pal_js = JSON.parse(pal)
    const points = pal_js.ColorMaps.ColorMap.Point
    const pointsHex = points.map(point => toHexColor(point))
    fs.writeFile(
      path_out,
      JSON.stringify(pointsHex),
      err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      })
  })
}

function toHexColor(point) {
  point = point._attributes
  const r = numberstringToHex(point.r)
  const g = numberstringToHex(point.g)
  const b = numberstringToHex(point.b)
  return (`#${r}${g}${b}`)
}

function numberstringToHex(str) {
  const intensity = Math.trunc(parseFloat(str) * 255)
  const hex = (0 + intensity.toString(16)).slice(-2)
  return (hex)
}
