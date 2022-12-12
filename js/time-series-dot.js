// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/scatterplot
function Scatterplot(data, {
      originalData = data.data,
      smoothedData = data.smoothed,
      x = ([x]) => x, // given d in data, returns the (quantitative) x-value
      y = ([y]) => y, // given d in data, returns the (quantitative) y-value
      xSmooth = ([x]) => x,
      yLow95 = ([y]) => y,
      yHigh95 = ([y]) => y,
      targetLimit = 40,
      start, // start date, from view
      end,  // end date, from view
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
      columnsRatio = 8 / 12,
      xType = d3.scaleLinear, // type of x-scale
      xDomain, // [xmin, xmax]
      yType = d3.scaleLinear, // type of y-scale
      yDomain, // [ymin, ymax]
      xLabel, // a label for the x-axis
      yLabel, // a label for the y-axis
      xFormat, // a format specifier string for the x-axis
      yFormat, // a format specifier string for the y-axis
      curve = d3.curveLinear,  // method of interpolation between points
      fontSize = 14,
      fontTickReducer = 0.9,
      fill = "none", // fill color for dots
      stroke = "currentColor", // stroke color for the dots
      strokeWidth = 1.5, // stroke width for dots
      halo = "#fff", // color of label halo 
      haloWidth = 3 // padding around the labels
} = {}) {
  
      console.log({
        'X': x,
        'Y': y,
        'originalData': originalData,
        'smoothedData': smoothedData,
        'start': start,
        'end': end
      })
      
      originalData = originalData.filter((i) => {
            return (i.date*24*60*60*1000 >= start) & (i.date*24*60*60*1000 <= end)
      })

      smoothedData = smoothedData.filter((i) => {
            return (i.date*24*60*60*1000 >= start) & (i.date*24*60*60*1000 <= end)
      })

      // Compute values.

      if (screen.width >= 1200) {
            width = width * columnsRatio
      } else if (width < minWidth) {
            width = minWidth
      }

      const xRange = [marginLeft + insetLeft, width - marginRight - insetRight] // [left, right]
      const yRange = [height - marginBottom - insetBottom, marginTop + insetTop] // [bottom, top]

      const X = d3.map(originalData, x);
      const XSMOOTH = d3.map(smoothedData, xSmooth);
      const YLOW95 = d3.map(smoothedData, yLow95);
      const YHIGH95 = d3.map(smoothedData, yHigh95);
      const Y = d3.map(originalData, y);
      const T = title == null ? null : d3.map(originalData, title);
      const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]))
      const ISMOOTH = d3.range(XSMOOTH.length);

      // Compute default domains.
      if (xDomain === undefined) xDomain = d3.extent(X);
      if (yDomain === undefined) yDomain = d3.extent(Y);

      // Construct scales and axes.
      const xScale = xType(xDomain, xRange);
      const yScale = yType(yDomain, yRange);
      const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
      const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

      defined = (d, i) => true;

      const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", `max-width: 100%;
                  height: auto;
                  height: intrinsic;`);
                  
      console.log({
        'X': X,
        'Y': Y,
        'XSMOOTH': XSMOOTH,
        'YLOW95': YLOW95,
        'YHIGH95': YHIGH95,
      })

        // Construct an area generator.
      const area = d3.area()
            .defined(i => ISMOOTH[i])
            .curve(curve)
            .x(i => xScale(XSMOOTH[i]))
            .y0(i => yScale(YLOW95[i]))
            .y1(i => yScale(YHIGH95[i]));



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
                  .attr("y", marginBottom - 4)
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

      // smooth
      svg.append("g")
            .append("path")
            .attr("fill", '#DEDEDE')
            .attr("d", area(ISMOOTH));

      // target limit ine
      svg.append("g")
            .append("line")
            .attr("x1", xScale(d3.min(X)))
            .attr("x2", xScale(d3.max(X)))
            .attr("y1", yScale(targetLimit))
            .attr("y2", yScale(targetLimit))
            .attr("stroke-width", 3)
            .attr("stroke", '#CCCCCC')
            .attr("stroke-dasharray", "6 2");


      // circles    
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
