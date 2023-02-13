function heatmap(data, {
      xName, 
      yName, 
      fillName,
      marginTop = 20, // top margin, in pixels
      marginRight = 0, // right margin, in pixels
      marginBottom = 40, // bottom margin, in pixels
      marginLeft = 50, // left margin, in pixels
      rectYPadding = 4,
      inset = 3, // inset the default range, in pixels
      insetTop = inset, // inset the default y-range
      insetRight = inset, // inset the default x-range
      insetBottom = inset, // inset the default y-range
      insetLeft = inset, // inset the default x-range
      width = 640, // outer width, in pixels
      height = 400, // outer height, in pixels
      minWidth = 375,
      columnsRatio = 8 / 12,
      columnWidth = 1200,
      xType = d3.scaleLinear, // type of x-scale
      xDomain, // [xmin, xmax]
      yType = d3.scaleBand, // type of y-scale
      yDomain, // [ymin, ymax]
      //fillType = d3.interpolateRgb.gamma,
      fillType = d3.scaleLinear,
      fillDomain, // [fillmin, fillmid, fillmax]
      fillRange = [0, 0.5, 1],
      fillPalette,
      targetLimit,
      xLabel, // a label for the x-axis
      yLabel, // a label for the y-axis
      xFormat, // a format specifier string for the x-axis
      yFormat, // a format specifier string for the y-axis
      fontSize = 14,
      fontTickReducer = 0.9,
      strokeWidth = .5, // stroke width for dots
} = {}) {

      const dayMillisec = 24 * 60 * 60 * 1000

      // fit to screen size
      if (screen.width >= columnWidth) {
            width = width * columnsRatio
      } else if (width < minWidth) {
            width = minWidth
      }

      // ranges within svg
      const xRange = [marginLeft + insetLeft, width - marginRight - insetRight] // [left, right]
      const yRange = [height - marginBottom - insetBottom, marginTop + insetTop] // [bottom, top]

      
      // extract variables from data
      const x = d => d[xName]
      const y = d => d[yName]
      const fill = d => d[fillName]
      // 
      const X = d3.map(data, x);
      const Y = d3.map(data, y);
      const FILL = d3.map(data, fill)
      const I = d3.range(X.length)
      const pollutants = [...new Set(Y)]

      // Compute default domains.
      if (xDomain === undefined) xDomain = d3.extent(X);
      if (yDomain === undefined) yDomain = new d3.InternSet(Y);
      if (fillDomain === undefined) fillDomain = [d3.min(FILL), targetLimit, d3.max(FILL)];

      // compute daily tile width
      const nDays = (xDomain[1] - xDomain[0]) / dayMillisec
      const tileWidth = (xRange[1] - xRange[0]) / nDays

      // Construct scales and axes.
      const xScale = xType(xDomain, xRange);
      const yScale = yType(yDomain, yRange);
      const fillBase = fillType()
            .domain(fillDomain)
            .range(fillRange)
      const interpolatePalette = d3.piecewise(
            d3.interpolateHsl,
            fillPalette
      )
      function fillScale(n) {
            return (
                  interpolatePalette(
                        fillBase(n)
                  )
            )
      }
      const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
      const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

      // append invisible tooltip
      const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip-heatmap-container")

      // define SVG
      const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", `max-width: 100%;
                    height: auto;
                    height: intrinsic;`)
            .on("pointerenter pointermove", pointermoved)
            .on("pointerout", pointerleft)
            .attr("id", "svgheatmap")    

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

      // rectangles
      svg.append("g")
            .attr("stroke-width", strokeWidth)
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => xScale(d[xName]))
            .attr("y", d => yScale(d[yName]) + rectYPadding)
            .attr("fill", d => fillScale(d[fillName]))
            .attr("stroke",  d => fillScale(d[fillName]))
            .attr("width", tileWidth)
            .attr("height", yScale.step() - 2 * rectYPadding)

      function pointermoved(e) { 
            const millisec = xScale.invert(d3.pointer(e)[0])

            d3.selectAll("#heatmap-tooltipline")
                  .remove()

            const topPos = document
                  .getElementById("svgheatmap")
                  .getBoundingClientRect()
                  .y

            svg.append("g")
                  .attr("id", "heatmap-tooltipline")
                  .attr("stroke-width", 2)
                  .attr("stroke", '#CCCCCC')
                  .append("line")
                  .attr("x1", xScale(millisec))
                  .attr("x2", xScale(millisec))
                  .attr("y1", yRange[0])
                  .attr("y2", yRange[1])

            d3.select("#tooltip-heatmap-container")
                  .selectAll("div")
                  .data(pollutants)
                  .join("div")
                  //.append("div")
                  .attr("class", "svg-tooltip")
                  .attr("id", i => i)
                  .attr("id", "tooltip-heatmap")
                  //.attr
                  .style("position", "absolute")
                  .style("top", i => scrollY +topPos + (yScale(i)) +  "px")
                  .style("left", e.pageX + 15 + "px")
                  .html(i => i)
            

      }


      function pointerleft(e) {
            d3.selectAll("#heatmap-tooltipline")
                  .attr("visibility", "hidden")

            d3.selectAll("#tooltip-heatmap")
                  .remove()
      }      
      
      return svg.node();
}
