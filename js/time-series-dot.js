// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/scatterplot
function Scatterplot(data, { 
  x = ([x]) => x, // given d in data, returns the (quantitative) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  r = 3, // (fixed) radius of dots, in pixels
  title, // given d in data, returns the title
  marginTop = 20, // top margin, in pixels
  marginRight = 0, // right margin, in pixels
  marginBottom = 40, // bottom margin, in pixels
  marginLeft = 25, // left margin, in pixels
  inset = r * 2, // inset the default range, in pixels
  insetTop = inset, // inset the default y-range
  insetRight = inset, // inset the default x-range
  insetBottom = inset, // inset the default y-range
  insetLeft = inset, // inset the default x-range
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  minWidth = 375,
  columnsRatio = 8/12,
  xType = d3.scaleLinear, // type of x-scale
  xDomain, // [xmin, xmax]
  yType = d3.scaleLinear, // type of y-scale
  yDomain, // [ymin, ymax]
  xLabel, // a label for the x-axis
  yLabel, // a label for the y-axis
  xFormat, // a format specifier string for the x-axis
  yFormat, // a format specifier string for the y-axis
  fontSize = 14,
  fontTickReducer = 0.9,
  fill = "none", // fill color for dots
  stroke = "currentColor", // stroke color for the dots
  strokeWidth = 1.5, // stroke width for dots
  halo = "#fff", // color of label halo 
  haloWidth = 3 // padding around the labels
} = {}) {

  // Compute values.
  
  if(screen.width >= 1200) {
    width = width*columnsRatio
  } else if(width < minWidth) {
    width = minWidth
  }

  const xRange = [marginLeft + insetLeft, width - marginRight - insetRight] // [left, right]
  const yRange = [height - marginBottom - insetBottom, marginTop + insetTop] // [bottom, top]
  
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const T = title == null ? null : d3.map(data, title);
  const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]));
  
  // Compute default domains.
  if (xDomain === undefined) xDomain = d3.extent(X);
  if (yDomain === undefined) yDomain = d3.extent(Y);
  
  // Construct scales and axes.
  const xScale = xType(xDomain, xRange);
  const yScale = yType(yDomain, yRange);
  const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
  const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);
  


  const svg = d3.create("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", [0, 0, width, height])
  .attr("style", `max-width: 100%;
                  height: auto;
                  height: intrinsic;`);
  

  // axis x                  
  svg.append("g")
  .attr("transform", `translate(0,${height - marginBottom})`)
  .call(xAxis)
  //.call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").clone()
        .attr("y2", marginTop + marginBottom - height)
        .attr("stroke-opacity", 0.1))
  .call(g => g.selectAll(".tick text")
        .attr("font-size", fontSize * fontTickReducer))
  .call(g => g.append("text")
        .attr("x", width)
        .attr("y", marginBottom  - 4)
        .attr("font-size", fontSize)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text(xLabel));
  
  // axis y
  svg.append("g")
  .attr("transform", `translate(${marginLeft},0)`)
  .call(yAxis)
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
  .call(g => g.selectAll(".tick text")
        .attr("font-size", fontSize * fontTickReducer))
  .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("font-size", fontSize)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text(yLabel));
  
  svg.append("g")
  .attr("fill", fill)
  .attr("stroke", stroke)
  .attr("stroke-width", strokeWidth)
  .selectAll("circle")
  .data(I)
  .join("circle")
  .attr("cx", i => xScale(X[i]))
  .attr("cy", i => yScale(Y[i]))
  .attr("r", r);
  
  return svg.node();
}
