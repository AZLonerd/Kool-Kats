
let data = [];

let margin = { top: 40, right: 10, bottom: 60, left: 60 };
let width = 600 - margin.left - margin.right;
let height = 450 - margin.top - margin.bottom;


let svg = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

let y = d3.scaleLinear().range([height, 0]);

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

let yAxisGroup = svg.append("g").attr("class", "y-axis");


d3.csv("data/Angdata.csv").then(csv => {
    csv.forEach(d => { d.stores = +d.stores; });
    data = csv;
    updateVisualization();
});

let sortAscending = false;


d3.select("#change-sorting").on("click", () => {
    sortAscending = !sortAscending;
    updateVisualization();
});

let defs = svg.append("defs");
let repeatCount = 10;


let catPattern = defs.append("pattern")
    .attr("id", "catPattern")
    .attr("width", 35 * repeatCount)
    .attr("height", 20)
    .attr("patternUnits", "userSpaceOnUse");

for (let i = 0; i < repeatCount; i++) {
    catPattern.append("text")
        .attr("x", 10 + i * 35)
        .attr("y", 15)
        .style("font-size", "18px")
        .attr("class", "cat-emoji")
        .text("🐱");
}

let dogPattern = defs.append("pattern")
    .attr("id", "dogPattern")
    .attr("width", 35 * repeatCount)
    .attr("height", 20)
    .attr("patternUnits", "userSpaceOnUse");

for (let i = 0; i < repeatCount; i++) {
    dogPattern.append("text")
        .attr("x", 5 + i * 35)
        .attr("y", 15)
        .style("font-size", "18px")
        .attr("class", "dog-emoji")
        .text("🐶");
}

function updateVisualization() {
    let selectedOption = document.getElementById("ranking-type2").value;

    data.sort((a, b) => {
        return sortAscending ? a[selectedOption] - b[selectedOption] : b[selectedOption] - a[selectedOption];
    });

    x.domain(data.map(d => d.company));
    y.domain([0, 5]);

    let bars = svg.selectAll(".bar").data(data, d => d.company);

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
        .transition().duration(1000)
        .attr("x", d => x(d.company))
        .attr("y", d => y(d[selectedOption]))
        .attr("height", d => height - y(d[selectedOption]))
        .attr("width", x.bandwidth());

    bars.exit().transition().duration(500)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    let labels = svg.selectAll(".bar-label").data(data, d => d.company);

    labels.enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", d => x(d.company) + x.bandwidth() / 2)
        .attr("y", d => y(d[selectedOption]) - 10)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .style("opacity", 0)
        .text(d => d[selectedOption])
        .merge(labels)
        .transition().duration(1000)
        .attr("y", d => y(d[selectedOption]) - 10)
        .text(d => d[selectedOption]);

    labels.exit().remove();

    xAxisGroup.transition().duration(1000).call(d3.axisBottom(x));
    yAxisGroup.transition().duration(1000).call(d3.axisLeft(y));

    function handleMouseOver(event, d) {
        if (d.company === "Movies without prominent animals") {
            d3.select(this).transition().duration(200).style("fill", null);
            const otherEmojis = ["🎬", "🍿", "🎥", "⭐", "🌟"];
            const repeatCount = 10;

            const patternId = "randomPattern";
            let pattern = defs.select(`#${patternId}`);
            if (!pattern.empty()) { pattern.remove() };

            pattern = defs.append("pattern")
                .attr("id", patternId)
                .attr("width", 35 * repeatCount)
                .attr("height", 20)
                .attr("patternUnits", "userSpaceOnUse");

            for (let i = 0; i < repeatCount; i++) {
                pattern.append("text")
                    .attr("x", 5 + i * 35)
                    .attr("y", 15)
                    .style("font-size", "18px")
                    .text(otherEmojis[Math.floor(Math.random() * otherEmojis.length)]);
            }

            d3.select(this).transition().duration(200).style("fill", `url(#${patternId})`);


            svg.selectAll(".bar-label")
                .filter(lbl => lbl.company === d.company)
                .transition().duration(200)
                .style("opacity", 1);

            return;
        }


        const isCat = d.company.toLowerCase().includes("cat");
        const pattern = isCat ? "url(#catPattern)" : "url(#dogPattern)";
        const animClass = isCat ? "cat-emoji-anim" : "dog-emoji-anim";

        d3.select(this).transition().duration(200).style("fill", pattern);
        d3.selectAll(isCat ? ".cat-emoji" : ".dog-emoji").classed(animClass, true);

        svg.selectAll(".bar-label")
            .filter(lbl => lbl.company === d.company)
            .transition().duration(200)
            .style("opacity", 1);
    }

    function handleMouseOut(event, d) {
        d3.select(this).transition().duration(200).style("fill", "steelblue");

        const isCat = d.company.toLowerCase().includes("cat");
        const isDog = d.company.toLowerCase().includes("dog");

        if (isCat) {
            d3.selectAll(".cat-emoji").classed("cat-emoji-anim", false);
        } else if (isDog) {
            d3.selectAll(".dog-emoji").classed("dog-emoji-anim", false);
        }

        svg.selectAll(".bar-label")
            .filter(lbl => lbl.company === d.company)
            .transition().duration(200)
            .style("opacity", 0);
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
                const warn = document.createElement("p");
                warn.textContent = "Select an answer first!";
                warn.classList.add("select-warning");
                warn.style.color = "orange";
                warn.style.fontWeight = "bold";
                warn.style.marginTop = "10px";
                descriptions.appendChild(warn);
                setTimeout(() => warn.remove(), 2500);
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
            feedback.textContent = "You are wrong! Dogs actually have higher movie ratings.";
            feedback.style.color = "red";
        }
        svg.selectAll(".bar")
            .attr("y", height)
            .attr("height", 0)
            .transition()
            .duration(1000)
            .attr("y", d => y(d.stores))
            .attr("height", d => height - y(d.stores));
    });

    answerbtns.forEach(btn => {
        btn.addEventListener("click", () => {
            answerbtns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedAnswer = btn.textContent.trim();
        });
    });

}

//trigger change