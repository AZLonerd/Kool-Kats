let margin = {top: 40, right: 40, bottom: 80, left: 80};

let width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom; //bad way of doing this hehe -> change to the better ver

let svg = d3.select("#ownership-viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.2);

let y = d3.scaleLinear()
    .range([height, 0])

let xAxis = d3.axisBottom(x);
let yAxis = d3.axisLeft(y);

let xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + height + ")");

let yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("class", "axis-label")
    .style("text-anchor", "middle")
    .text("Count (millions)");

let data = [];

d3.select("#ranking-type").on("change", function() {
    updateVisualization();
});

loadData();

function loadData() {
    d3.csv("data/PetOwnership.csv").then(csv => {
        csv.forEach(function(d) {
            d.households = +d.households;
            d.total = +d.total;
        });
        data = csv;
        updateVisualization();
    });
}

function getColor(pet) {
    if (pet === "Cat") {
        return "rgba(255,165,0,0.7)";
    } else if (pet === "Dog") {
        return "rgba(84,87,255,0.7)";
    }
}

function updateVisualization() {
    let selection = d3.select("#ranking-type").property("value");

    //change y names
    let yLabel = selection === "households" ?
        "Number of Households (millions)" : "Total Number of Pets (millions)";
    svg.select(".axis-label").text(yLabel);

    data.sort(function(a, b) {
        return b[selection] - a[selection];
    });

    x.domain(data.map(d => d.pet));
    y.domain([0, d3.max(data, d => d[selection])]);

    let bars = svg.selectAll(".bar")
        .data(data, d => d.pet);

    //enter update exit pattern
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.pet))
        .attr("width", x.bandwidth())
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", d => getColor(d.pet)) //dog should be blue cat orange
        .merge(bars)
        .transition()
        .duration(500)
        .attr("x", d => x(d.pet))
        .attr("y", d => y(d[selection]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[selection]))
        .attr("fill", d => getColor(d.pet));

    bars.exit()
        .transition()
        .duration(500)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    xAxisGroup.transition()
        .duration(500)
        .call(xAxis);

    yAxisGroup.transition()
        .duration(500)
        .call(yAxis);
}