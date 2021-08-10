const graf = d3.select('#graf')
const anchoTotal = graf.style('width').slice(0, -2)
const altoTotal = (anchoTotal * 9) / 16

const svg = graf
  .append('svg')
  .attr('width', anchoTotal)
  .attr('height', altoTotal)
  .attr('class', 'graf')

const margin = {
  top: 10,
  bottom: 100,
  left: 100,
  right: 100,
}

var tooltip = d3.select("body").append("div")
                .style("position", "absolute")
                .style("padding", "0 10px")
                .style("background", "white")
                .style("opacity",0);


const ancho = anchoTotal - margin.left - margin.right
const alto = altoTotal - margin.top - margin.bottom


const g = svg
  .append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)

g.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', ancho)
  .attr('height', alto)
  .attr('stroke', '#333333')
  .attr('fill', '#ffffff77')



const yearDisplay = g
  .append('text')
  .attr('class', 'numerote')
  .attr('x', ancho / 2)
  .attr('y', alto / 2 - 150)
  .attr('text-anchor', 'middle')


let allData = []
let year = 0
let minYear, maxYear
let corriendo = false
let intervalo
var rainbow = d3.scaleSequential(d3.interpolateRainbow).domain([0, 10]);


const txtYear = d3.select('#txt-year')
const btnAtras = d3.select('#btn-atras')
const btnPlay = d3.select('#btn-play')
const btnAdelante = d3.select('#btn-adelante')


let x = d3.scaleLog().range([0, ancho])
let y = d3.scaleLinear().range([alto, 0])
let r = d3.scaleLinear().range([5, 100])
let color = d3
  .scaleOrdinal()
  .range(['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c','#6761c7', '#fed324', '#993399', '#c3e928'])

function carga() {
  d3.csv('incidents2.csv').then((datos) => {
    datos.forEach((d) => {
      d.users = +d.users
      d.incidents = +d.incidents
      d.outage = +d.outage
      d.year = +d.year
    })

    datos = d3.filter(
      datos,
      (d) => d.outage > 0 && d.incidents > 0 
    )

    allData = datos
    txtYear.attr('value', year)
    minYear = d3.min(datos, (d) => d.year)
    maxYear = d3.max(datos, (d) => d.year)
    year = minYear
    
    
    x.domain([d3.min(datos, (d) => d.users), d3.max(datos, (d) => d.users)])
    y.domain(d3.extent(d3.map(datos, (d) => d.incidents)))
    r.domain(d3.extent(d3.map(datos, (d) => d.outage)))
    color.domain(d3.map(datos, (d) => d.cause))

    g.append('g')
      .attr('transform', `translate(0, ${alto})`)
      .attr('class', 'ejes')
      .call(
        d3
          .axisBottom(x)
          .ticks(10)
          .tickSize(-alto)
          .tickFormat((d) => d3.format(',d')(d))
      )
      .selectAll('text')
      .attr('transform', 'rotate(-50)')
      .attr('text-anchor', 'end')
      .attr('x', 0)
      .attr('y', 5)

    g.append('g')
      .attr('class', 'ejes')
      .call(d3.axisLeft(y).ticks(20).tickSize(-ancho))

    cuadro()
  })
}

/* Variable para evento mouseover
var xScale = d3.scaleLinear()
          .domain([0, d3.max(datos, function (d) { return d.x + 10; })])
          .range([margin.left, w - margin.right]);  
      var yScale = d3.scaleLinear()
          .domain([0, d3.max(datos, function (d) { return d.y + 10; })])
          .range([margin.top, h - margin.bottom]);  
      var xAxis = d3.svg.axis().scale(xScale).orient("top");
      var yAxis = d3.svg.axis().scale(yScale).orient("left");
      var circleAttrs = {
          cx: function(d) { return xScale(d.cx); },
          cy: function(d) { return yScale(d.cy); },
          r: r
      };*/




function dibujo(datos) {
  yearDisplay.text(year)

  burbujas = g.selectAll('circle').data(datos, (d) => d.cause)

  burbujas
    .enter()
    .append('circle')
    .attr('cx', (d) => x(d.users))
    .attr('cy', (d) => y(d.incidents))
    .attr('r', 0)
    .attr('fill-opacity', 1)
    .attr('fill', function(d, i) { return rainbow(i);})
    .transition()
    .duration(325)
    .attr('r', 100)
    .duration(3000)
    .ease(d3.easeBack)
    .transition()
    .duration(325)
    .attr('r', (d) => r(d.outage))
    .attr('fill', (d) => color(d.cause))
    /*Llamar la Función Mouseover
    .on("mouseover", MouseOver)
    */

  burbujas
    .merge(burbujas)
    .transition()
    .duration(750)
    .attr('cx', (d) => x(d.users))
    .attr('cy', (d) => y(d.incidents))
    .attr('r', (d) => r(d.outage))
    .attr('fill', (d) => color(d.cause))

    .on("mouseover", function(d) { d3.select(this).style("fill", "red")})
    .on('mouseover', function(d) {
      tooltip.transition().duration(200)
                 .style('opacity', .9),
                tooltip.html(d)
                .style('left', (d3.event.pageX -35) + 'px')
                .style('top', (d3.event.pageY -30) + 'px')
    })
    
  burbujas
    .exit()
    .transition()
    .duration(325)
    .attr('r', 125)
    .attr('fill', '#d00')
    .transition()
    .duration(325)
    .attr('r', 0)
    .remove()

}

/* Función Mouseover
function MouseOver(d, i) { 
  d3.select(this).attr({
    fill: "purple",
    r: r * 4
  });
}*/

//



function cuadro() {
  data = d3.filter(allData, (d) => d.year == year)
  dibujo(data)
}

function changeYear(inc) {
  console.log(year)
  year += inc
  console.log(year)

  if (year > maxYear) year = maxYear
  if (year < minYear) year = minYear

  txtYear.attr('value', year)
  cuadro()
}

carga()

txtYear.on('change', () => {
  year = +txtYear.node().value
  // console.log(year)
  cuadro()
})

btnAtras.on('click', () => {
  // year--
  // txtYear.attr('value', year)
  changeYear(-1)
})

btnPlay.on('click', () => {
  corriendo = !corriendo
  if (corriendo) {
    btnPlay.html("<i class='fas fa-pause'></i>")
    btnPlay.classed('btn-danger', true)
    btnPlay.classed('btn-success', false)
    intervalo = d3.interval(() => changeYear(1), 750)
  } else {
    btnPlay.html("<i class='fas fa-play'></i>")
    btnPlay.classed('btn-danger', false)
    btnPlay.classed('btn-success', true)
    intervalo.stop()
  }
})

btnAdelante.on('click', () => {
  // year++
  // txtYear.attr('value', year)
  changeYear(1)
})

//graf.select("svg").selectAll("circle").on("mouseover", function(d) { 

  //d3.select(this)

   //.style('opacity', .5)});

   d3.select("#graf").select("svg").selectAll("circle").on("mouseover", function(d) { d3.select(this).style("fill", "red")});
