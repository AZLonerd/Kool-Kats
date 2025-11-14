function ProductCountViz2() {
    d3.csv("data/ProductTradeAmount.csv").then(data => {
        data.forEach(d => {
            d.AverageTradeAmount = +d.AverageTradeAmount;
        });

        const catAvg = data.find(d => d.Animal === "Cat").AverageTradeAmount;
        const dogAvg = data.find(d => d.Animal === "Dog").AverageTradeAmount;
        const maxVal = Math.max(catAvg, dogAvg);

        const margin = {top: 70, right: 30, bottom: 60, left: 60};
        const height = 267;
        const width = 1000;

        const svg = d3.select("#trade-bars-viz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "600")
            .text("Cats vs Dog Products: Average Number of Products Bought");


        const x = d3.scaleLinear()
            .domain([-maxVal, maxVal])
            .range([margin.left, width - margin.right]);
        const barY = height / 2 - 30;
        const barH = 60;

        svg.append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", margin.top)
            .attr("y2", height - margin.bottom)
            .attr("stroke", "#aaa")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4");
        svg.append("text")
            .attr("x", x(0))
            .attr("y", margin.top - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text("Even");

        const catFinalX = x(-catAvg);
        const catFinalW = x(0) - catFinalX;
        const dogFinalX = x(0);
        const dogFinalW = x(dogAvg) - x(0);


        const catRect = svg.append("rect")
            .attr("x", x(0))
            .attr("y", barY)
            .attr("width", 0)
            .attr("height", barH)
            .attr("fill", "#f4a261");

        const dogRect = svg.append("rect")
            .attr("x", x(0))
            .attr("y", barY)
            .attr("width", 0)
            .attr("height", barH)
            .attr("fill", "#457b9d");

        const catLabelGroup = svg.append('g')
            .style("opacity", 0);

        catLabelGroup.append('text')
            .attr("x", catFinalX - 10)
            .attr("y", barY + barH / 2 - 6)
            .attr("text-anchor", "end")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .text("Cats");
        catLabelGroup.append("text")
            .attr("x", catFinalX - 10)
            .attr("y", barY + barH / 2 + 12)
            .attr("text-anchor", "end")
            .style("font-size", "11px")
            .text(`${catAvg.toFixed(0)} avg`);

        const dogLabelGroup = svg.append("g")
            .style("opacity", 0);
        dogLabelGroup.append("text")
            .attr("x", dogFinalX + dogFinalW + 10)
            .attr("y", barY + barH / 2 - 6)
            .attr("text-anchor", "start")
            .style("font-size", "13px")
            .style("font-weight", "600")
            .text("Dogs");
        dogLabelGroup.append("text")
            .attr("x", dogFinalX + dogFinalW + 10)
            .attr("y", barY + barH / 2 + 12)
            .attr("text-anchor", "start")
            .style("font-size", "11px")
            .text(`${dogAvg.toFixed(0)} avg`);

        const axis = d3.axisBottom(x)
            .tickFormat(d => Math.abs(d))
            .ticks(5);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(axis);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text("Average Trade Amount (higher = stronger pull)");

        let hasAnimated = false;

        function spreadViz() {
            if (hasAnimated) return;
            hasAnimated = true;
            catRect.transition()
                .duration(1000)
                .attr("x", catFinalX)
                .attr("width", catFinalW);
            dogRect.transition()
                .duration(1000)
                .delay(150)
                .attr("width", dogFinalW);
            catLabelGroup.transition()
                .delay(900)
                .duration(400)
                .style("opacity", 1);
            dogLabelGroup.transition()
                .delay(900)
                .duration(400)
                .style("opacity", 1);
        }

        if ("IntersectionObserver" in window) {
            const containerNode = d3.select("#trade-bars-viz").node();
            const observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            spreadViz();
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {threshold: 1}
            );
            observer.observe(containerNode);
        }
        else {
            spreadViz();
        }
    });
}
export default ProductCountViz2
