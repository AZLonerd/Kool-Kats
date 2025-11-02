function ProductCountViz2() {
    d3.csv("data/ProductTradeAmount.csv").then(data => {
        data.forEach(d => {
            d.AverageTradeAmount = +d.AverageTradeAmount;
        });
        const outerW = 1000, outerH = 500;
        const margin = {top: 70, right: 30, bottom: 60, left: 60};
        const height = 700;
        const width = 1000;

        const svg = d3.select("#trade-bars-viz")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const x = d3.scaleBand()
            .domain(data.map(d => d.Animal))
            .range([margin.left, width - margin.right])
            .padding(.3);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.AverageTradeAmount)])
            .nice()
            .range([height - margin.bottom, margin.top]);


        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.Animal))
            .range(["#f4a261", "#457b9d"]);

        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "6px")
            .style("border", "1px solid black")
            .style("pointer-events", "none")
            .style('font-size', '12px')
            .style("display", "none");

        svg.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Animal))
            .attr("y", d => y(d.AverageTradeAmount))
            .attr('width', x.bandwidth())
            .attr("height", d => y(0) - y(d.AverageTradeAmount))
            .attr("fill", d => color(d.Animal))
            .on("mouseover", (event, d) => {
                tooltip.style("display", "block")
                    .html(`${d.Animal}<br>${d.AverageTradeAmount}`);
                d3.select(event.currentTarget)
                    .attr("fill", d3.color(color(d.Animal)).darker(.5));
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", (event, d) => {
                tooltip.style("display", "none");
                d3.select(event.currentTarget)
                    .attr("fill", color(d.Animal));
            })


        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x));
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", 20)
            .text("Cats vs Dog Products: Average Trade Amount");
    });
}


export default ProductCountViz2
