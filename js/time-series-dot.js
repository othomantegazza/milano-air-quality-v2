// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/scatterplot
function Scatterplot(data, {
      originalData = data.data,
      smoothedData = data.smoothed,
      euLimit = data.eu_limits,
      x = ([x]) => x, // given d in data, returns the (quantitative) x-value
      y = ([y]) => y, // given d in data, returns the (quantitative) y-value
      fill = ([fill]) => fill,
      xSmooth = ([x]) => x,
      yLow95 = ([y]) => y,
      yHigh95 = ([y]) => y,
      start, // start date, from view
      end,  // end date, from view
      r = 3, // (fixed) radius of dots, in pixels
      rMultiplier = 1.68,
      title, // given d in data, returns the title
      marginTop = 25, // top margin, in pixels
      marginRight = 0, // right margin, in pixels
      marginBottom = 40, // bottom margin, in pixels
      marginLeft = 45, // left margin, in pixels
      inset = r * 2, // inset the default range, in pixels
      insetTop = inset, // inset the default y-range
      insetRight = inset, // inset the default x-range
      insetBottom = 0, // inset the default y-range
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
      fillType = d3.scaleLinear,
      fillDomain, // [fillmin, fillmid, fillmax]
      fillRange = ["#02417e", "grey", "#8e2905"],
      fillPalette = d3.interpolateCividis,
      curve = d3.curveLinear,  // method of interpolation between points
      fontSize = 14,
      fontTickReducer = 0.9,
      stroke = "currentColor", // stroke color for the dots
      strokeWidth = 1.5, // stroke width for dots
      halo = "#fff", // color of label halo 
      haloWidth = 3, // padding around the labels,
      tooltipBackground = 'black',
      highlightColor = '#b72dfc     ',
      tooltipOffsetPx = r*rMultiplier*3,
} = {}) {

      // parameter to convert time scales
      const msec_per_day = 24*60*60*1000
  
      console.log({
        'x': x,
        'y': y,
        'originalData': originalData,
        'smoothedData': smoothedData,
        'euLimit': euLimit,
        'start': start,
        'end': end
      })
      
      // convert time scales
      originalData = originalData.filter((i) => {
            return (i.date*msec_per_day >= start) & (i.date*msec_per_day <= end)
      })

      smoothedData = smoothedData.filter((i) => {
            return (i.date*msec_per_day >= start) & (i.date*msec_per_day <= end)
      })

      // Compute page layout values
      if (screen.width >= 1200) {
            width = width * columnsRatio
      } else if (width < minWidth) {
            width = minWidth
      }

      // Define scales parameters and build data variables
      const xRange = [marginLeft + insetLeft, width - marginRight - insetRight] // [left, right]
      const yRange = [height - marginBottom - insetBottom, marginTop + insetTop] // [bottom, top]
      const X = d3.map(originalData, x);
      const XSMOOTH = d3.map(smoothedData, xSmooth);
      const YLOW95 = d3.map(smoothedData, yLow95);
      const YHIGH95 = d3.map(smoothedData, yHigh95);
      const Y = d3.map(originalData, y);
      const FILL = d3.map(d3.map(originalData, fill), i => i/euLimit)
      const T = title == null ? null : d3.map(originalData, title);
      const I = d3.range(X.length).filter(i => !isNaN(X[i]) && !isNaN(Y[i]))
      const ISMOOTH = d3.range(XSMOOTH.length);

      // Compute default domains.
      if (xDomain === undefined) xDomain = d3.extent(X);
      if (yDomain === undefined) yDomain = [0, d3.max(Y)];
      if (fillDomain === undefined) fillDomain = [d3.min(FILL), euLimit, d3.max(FILL)];

      // Construct scales and axes.
      const xScale = xType(xDomain, xRange);
      const yScale = yType(yDomain, yRange);
      const fillScale = fillType()
            .domain(fillDomain)
            .range(fillRange)
            .interpolate(d3.interpolateRgb.gamma(2.2));
      const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
      const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

      
      console.log({
            'X': X,
            'Y': Y,
            'xRange': xRange,
            'XSMOOTH': XSMOOTH,
            'YLOW95': YLOW95,
            'YHIGH95': YHIGH95,
            'FILL': FILL,
      })
      
      // Construct an area generator.
      defined = (d, i) => true;
      const area = d3.area()
            .defined(i => ISMOOTH[i])
            .curve(curve)
            .x(i => xScale(XSMOOTH[i]))
            .y0(i => yScale(YLOW95[i]))
            .y1(i => yScale(YHIGH95[i]));

      // Tooltip
      // const div = d3.selectAll(".observablehq")
      // const tooltip = div.append('div')
      //       .attr('class', 'tooltiptest')
      //       .style('background-color', tooltipBackground)
      //       .style('width', 'fit-content')
      //       .style('height', tooltipHeight + 'px')
      //       .style('position', 'fixed')
      //       .style('pointer-events', 'none')
      //       .style('opacity', 1)
      //       .style('padding', tooltipPadding + 'px')
      //       .style('font-size', '10px')

      const tooltip = d3.select("body")
            .append("div")
            .attr("class", "svg-tooltip")
            .style("visibility", "hidden")


      const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .on("pointerenter pointermove", pointermoved)
            .on("pointerout", pointerleft);

      
            

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
            .attr("y1", yScale(euLimit))
            .attr("y2", yScale(euLimit))
            .attr("stroke-width", 3)
            .attr("stroke", '#CCCCCC')
            .attr("stroke-dasharray", "6 2");


      // circles    
      svg.append("g")
            .attr("fill", "none")
            //.attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .selectAll("circle")
            .data(I)
            .join("circle")
            .attr("cx", i => xScale(X[i]))
            .attr("cy", i => yScale(Y[i]))
            .attr("r", r)
            .attr("stroke", i => fillScale(Y[i]/euLimit))
            .attr("id", i => dateForID(X[i]))

      function pointermoved(event) { 

            const line_x = event.layerX;
            const millisec = xScale.invert(d3.pointer(event)[0])
            const floored_msec = millisec - (millisec % msec_per_day)
            const selector = dateForID(floored_msec)
            const dateLabel = dateForLabel(floored_msec)
            const selected_records = X.reduce(function(a, e, i) {
                  if (e === floored_msec)
                      a.push(i);
                  return a;
              }, [])
            let poll_levels = Y
                  .filter((lev, index) => selected_records.includes(index))
                  .sort(function(a, b){return b-a})
            let poll_levels_colors = d3.map(poll_levels, i => `
                  <span style="color: ${fillScale(i/euLimit)}">⬤</span> ${i}
                  ${i/euLimit}`)
            const poll_levels_string = poll_levels_colors.join('<br>')


            console.log({
                  'event': event,
                  'pointer': d3.pointer(event),
                  'millisec': millisec - 1 + 1,
                  'floored_msec': floored_msec,
                  'remainder': millisec % msec_per_day,
                  'xequal': X.filter(i => i == floored_msec),
                  // 'xindex': X.findIndex(i => i == floored_msec),
                  'xindex': selected_records,
                  'xRemainder': d3.map(X, i => i % msec_per_day),
                  // 'invertjs':  xScale.invert(d3.pointer(event)[0]).setHours(0, 0, 0, 0),
                  'invertdayjs': dateForID(xScale.invert(d3.pointer(event)[0])),
                  'invertinvert': xScale(xScale.invert(d3.pointer(event)[0])),
                  'bisect':  d3.bisectCenter(X, xScale.invert(d3.pointer(event)[0])),
                  'label': dateLabel,
                  'poll_levels': poll_levels,
                  'poll_levels_string': poll_levels_string,
            })

            d3.selectAll("#tooltip-vline")
                  .remove()

            svg.append("g")
                  .attr("id", "tooltip-vline")
                  .attr("stroke-width", 2)
                  .attr("stroke", '#CCCCCC')
                  .append("line")
                  .attr("x1", xScale(millisec))
                  .attr("x2", xScale(millisec))
                  .attr("y1", yScale(0))
                  .attr("y2", yScale(d3.max(Y)))

            d3.selectAll(".selectedCircle")
                  .remove()
                  

            d3.selectAll(`#${selector}`)
                  .clone()
                  .attr("class", "selectedCircle")
                  .attr("stroke", highlightColor)
                  .attr("r", r + r*rMultiplier)

            // tooltip text
            tooltip.style('top', `${event.pageY}px`)
                  .style('left', `${event.pageX + tooltipOffsetPx}px`)
                  .style("visibility", "visible")
                  .html(`${dateLabel}<br>
                        measured level:<br>
                        ${poll_levels_string}`)

            
      }

      function pointerleft() {
            console.log('pointer left')

            d3.selectAll(".selectedCircle")
                  .remove()

            d3.select("#tooltip-vline")
                  .attr("visibility", "hidden")

            tooltip.style("visibility", "hidden")
      }

      function dateForID(msec) {
            const formatted = dayjs(msec)
            return(`d${formatted.$y}_${formatted.$M}_${formatted.$D}`)
      }

      function dateForLabel(msec) {
            const formatted = dayjs(msec)
            return(`${formatted.$D}-${formatted.$M}-${formatted.$y}`)
      }

      return svg.node();
}
