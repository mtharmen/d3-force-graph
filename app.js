// https://bl.ocks.org/mbostock/4062045

const url = "https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json"

d3.json(url, (err, data) => {
  if (err !== null) {
    console.error(err)
  }
  else {
    data.links = data.links.map(link => {
      let t = link.target
      let s = link.source
      return { target: data.nodes[t], source: data.nodes[s] }
    })
    document.getElementById("chart").onload = makeChart(data, 800, 800)
  }
})

var makeChart = function(dataset, width, height) {
  const strength = 80
//  var offsetLeft = document.getElementById("chart").offsetLeft
//  var offsetTop = document.getElementById("chart").offsetTop

  d3.select("#chart").style("width", width + "px")

  var svg = d3.select("#chart") 
                .append("svg").attr("id", "svg")
                  .attr("width", width)
                  .attr("height", height)

  // Border
  svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)      
        .attr("class", "border")

  // Graph
  var link = svg.append("g").attr("class", "links")
                  .selectAll("line").data(dataset.links).enter()
                    .append("line")

  // TODO: Appending outside of SVG because images didnt work?
  var node = d3.select("#chart")
              .append("div").attr("class", "nodes")
                .selectAll(".node").data(dataset.nodes).enter()              
                  .append("div").attr("class", "node")
                  .append("img")
                    .attr("class", d => "flag flag-" + d.code)
                    .style("position", "absolute")
                    

  // Force Animation
  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => { 
        return d.country; 
      }))
      .force("charge", d3.forceManyBody().strength(-strength))
      .force("center", d3.forceCenter( width/2, height/2 ))
      .force("x", d3.forceX())
      .force("y", d3.forceY())

  simulation
      .nodes(dataset.nodes)
      .on("tick", tick)

  simulation.force("link")
      .links(dataset.links)

  node.call(d3.drag()
                .on("start", dragStart)
                .on("drag", dragMove)
                .on("end", dragEnd))
        .on("dblclick", unStick)

  function tick() {  
    node
      .style("left", d => (bound(d.x, "width") - 8) + "px")
      .style("top", d => bound(d.y, "height") + "px")  

    link
      .attr("x1", d => d.source.x )
      .attr("y1", d => d.source.y )
      .attr("x2", d => d.target.x )
      .attr("y2", d => d.target.y )    
  }

  // Manipulate Stuff
  let dragging = false;

  function dragStart(d) {
    dragging = true
    if (!d3.event.active) {
      simulation.alphaTarget(0.1).restart()
    }
    d.fx = d.x
    d.fy = d.y  
  }

  function dragMove(d) {
    d.fx = bound(d3.event.x, "width");
    d.fy = bound(d3.event.y, "height")

    mouseMove(d)
  }

  function dragEnd(d) {
    dragging = false
    if (!d3.event.active) {
      simulation.alphaTarget(0)
    }  
    mouseOut()
  }

  function unStick(d) {
    d.fx = null
    d.fy = null
  }

  // Tooltip Stuff
  node.on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut)

  var tooltip = d3.select("#chart")
                    .append("div")
                      .attr("class", "tooltip")

  function mouseOver(d) {
    tooltip.html(d.country).style("display", "inline")
  }

  function mouseMove(d) {
    let x = d.x + 20
    let y = d.y + 10

    tooltip.style("left", x + "px")
           .style("top", y + "px")
  }

  function mouseOut() {
    if (!dragging) {
      tooltip.style("display", "none")  
    }          
  }

  function bound(c, dimension) {
    let buffer = dimension === "height" ? 6 : 9
    let max = dimension === "height" ? height : width
    if ( c > max - buffer ) {
      return max - buffer
    }
    else if (c < buffer) {
      return buffer
    }
    else {
      return c
    }
  }
}



