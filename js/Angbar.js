// Initialize data
let data = [];

let margin = { top: 40, right: 10, bottom: 60, left: 60 };
let width = 600 - margin.left - margin.right;
let height = 250 - margin.top - margin.bottom;

// SVG drawing area
let svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let y = d3.scaleLinear()
    .range([height, 0]);

let xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`);

svg.append("text")
    .attr("class", "y-axis-label")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .style("font-size", "12px")
    .text("Rating out of 5");

let yAxisGroup = svg.append("g")
    .attr("class", "y-axis");



// Load CSV data
d3.csv("data/Angdata.csv").then(csv => {
    csv.forEach(d => {
        d.stores = +d.stores; // convert to number
    });
    data = csv;
    updateVisualization();
});

let sortAscending = false;

// Sorting button
d3.select("#change-sorting").on("click", () => {
    sortAscending = !sortAscending;
    updateVisualization();
});

function updateVisualization() {
    let selectedOption = document.getElementById("ranking-type2").value;


    data.sort((a, b) => {
        return sortAscending ? a[selectedOption] - b[selectedOption] : b[selectedOption] - a[selectedOption];
    });


    x.domain(data.map(d => d.company));
    y.domain([0, 5]);


    let bars = svg.selectAll(".bar")
        .data(data, d => d.company);


    let barsEnter = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.company))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .style("fill", "steelblue")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);


    barsEnter.merge(bars)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.company))
        .attr("y", d => y(d[selectedOption]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d[selectedOption]));


    bars.exit()
        .transition()
        .duration(500)
        .attr("y", height)
        .attr("height", 0)
        .remove();


    let labels = svg.selectAll(".bar-label")
        .data(data, d => d.company);


    labels.enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.company) + x.bandwidth() / 2)
        .attr("y", d => y(d[selectedOption]) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("opacity", 0) // hide initially
        .text(d => d[selectedOption])
        .merge(labels)
        .transition()
        .duration(1000)
        .attr("x", d => x(d.company) + x.bandwidth() / 2)
        .attr("y", d => y(d[selectedOption]) - 10)
        .text(d => d[selectedOption]);

    labels.exit().remove();

    xAxisGroup.transition().duration(1000).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(y));

    function handleMouseOver(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "orange");


        svg.selectAll(".bar-label")
            .filter(lbl => lbl.company === d.company)
            .transition()
            .duration(200)
            .style("opacity", 1);
    }

    function handleMouseOut(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "steelblue");

        // Hide label for this bar
        svg.selectAll(".bar-label")
            .filter(lbl => lbl.company === d.company)
            .transition()
            .duration(200)
            .style("opacity", 0);
    }
}


d3.select("#ranking-type2").on("change", updateVisualization);


const revealbtn = document.querySelector(".reveal-btn");
const moviedata = document.querySelector(".movie-ratings");
const answerbtns = document.querySelectorAll(".ans-btn");
const descriptions = document.querySelector(".descriptions");
let selectedAnswer = null;

revealbtn.addEventListener("click", () => {
    if (moviedata.style.display === "block") {
        moviedata.style.display = "none";
        revealbtn.textContent = "Reveal Answer";
        return;
    }

    if (!selectedAnswer) {
        if (!document.querySelector(".select-warning")) {
            const selectWarning = document.createElement("p");
            selectWarning.textContent = "Select an answer first!";
            selectWarning.classList.add("select-warning");
            selectWarning.style.color = "orange";
            selectWarning.style.fontWeight = "bold";
            selectWarning.style.marginTop = "10px";
            descriptions.appendChild(selectWarning);

            setTimeout(() => selectWarning.remove(), 2500);
        }
        return;
    }

    moviedata.style.display = "block";
    revealbtn.textContent = "Close";

    const feedback = document.querySelector("#feedback");
    if (selectedAnswer === "Dogs") {
        feedback.textContent = "You are right! Dogs have higher average movie ratings.";
        feedback.style.color = "green";
    } else {
        feedback.textContent = "You are wrong ! Dogs actually have higher average movie ratings.";
        feedback.style.color = "red";
    }
});

answerbtns.forEach(btn => {
    btn.addEventListener("click", () => {
        answerbtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedAnswer = btn.textContent.trim();
    });
});
