function ProductCountViz() {
    d3.csv("data/ProductTradeAmount.csv").then(data => {
        const catRow = data.find(d => d.Animal === "Cat");
        const dogRow = data.find(d => d.Animal === "Dog");
        const catValue = +catRow.TradeAmountCount;
        const dogValue = +dogRow.TradeAmountCount;
        buildViz(catValue, dogValue);
    });
}

function buildViz(catValue, dogValue) {
    const outerW = 1000, outerH = 500;
    const margin = {top: 70, right: 30, bottom: 60, left: 60};

    const nCols = 8, nRows = 6;
    const cellW = 45, cellH = 45;
    const gridW = nCols * cellW;
    const gridH = nRows * cellH;

    const gridSpacing = 140;
    const totalGridWidth = gridW * 2 + gridSpacing + 50;
    const gridsOffsetX = (outerW - totalGridWidth) / 2 + 50;
    const gridsOffsetY = margin.top + 50;


    let dogViz = false;
    let catViz = false;

    let catCircles = [], dogCircles = [];

    const maxValue = 1000;

    const container = d3.select("#shopping-cart-viz")
        .style("position", "relative");
    const svg = container.append("svg")
        .attr("width", outerW)
        .attr("height", outerH);

    const tooltip = container
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("padding", "4px 8px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
        .style("opacity", 0);
    const containerNode = container.node();

    const catSim = d3.forceSimulation()
        .alphaDecay(0.02)
        .velocityDecay(0.4)
        .stop();
    const dogSim = d3.forceSimulation()
        .alphaDecay(0.02)
        .velocityDecay(0.4)
        .stop();


    svg.append("text")
        .attr("x", outerW / 2 + 25)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .style("font-weight", "bold")
        .text("Pet Products: Number of Options");

    const buttonG = svg.append("g")
        .attr("transform", `translate(${outerW / 2}, ${margin.top})`)
        .attr("text-anchor", "middle");
    const catButt = buttonG.append("g")
        .attr("transform", `translate(-275, 25)`)
        .style("cursor", "pointer")
        .on("click", () => dropIntoGrid("cat"));

    catButt.append("circle")
        .attr("r", 15)
        .attr("fill", "#f4a261");
    catButt.append("text")
        .attr("x", 75)
        .attr("y", 5)
        .text(">>drop cats<<")
        .style("font-size", "15px");

    const dogButt = buttonG.append("g")
        .attr("transform", `translate(225, 25)`)
        .style("cursor", "pointer")
        .on("click", () => dropIntoGrid("dog"));

    dogButt.append("circle")
        .attr("r", 15)
        .attr("fill", "#457b9d");
    dogButt.append("text")
        .attr("x", 75)
        .attr("y", 5)
        .text(">>drop dogs<<")
        .style("font-size", "15px");

    const resetB = buttonG.append("g")
        .attr("transform", `translate(0, 0)`)
        .attr("cursor", "pointer")
        .on("click", resetGrids);
    resetB.append("rect")
        .attr("x", 0)
        .attr("y", -5)
        .attr("width", 50)
        .attr("height", 25)
        .attr("rx", 5)
        .attr("fill", "#eee")
        .attr("stroke", "#888");
    resetB.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 25)
        .attr("y", 12)
        .style("font-size", "12px")
        .text("reset");

    const scaleY = d3.scaleLinear()
        .domain([0, maxValue])
        .range([gridH, 0]);
    const axisY = d3.axisLeft(scaleY)
        .tickValues([0, 200, 400, 600, 800, 1000]);

    svg.append("g")
        .attr("transform", `translate(${gridsOffsetX - 40}, ${gridsOffsetY})`)
        .call(axisY);

    const gridsG = svg.append("g")
        .attr("transform", `translate(${gridsOffsetX}, ${gridsOffsetY})`);
    const catGridG = gridsG.append("g")
        .attr("id", "cat-grid");
    catGridG.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", gridW).attr("height", gridH)
        .attr("fill", "transparent")
        .style("pointer-events", "all");
    const dogGridG = gridsG.append("g")
        .attr("id", "dog-grid")
        .attr("transform", `translate(${gridW + gridSpacing}, 0)`);
    dogGridG.append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", gridW).attr("height", gridH)
        .attr("fill", "transparent")
        .style("pointer-events", "all");
    drawGrid(catGridG, 0, 0, gridW, gridH);
    drawGrid(dogGridG, 0, 0, gridW, gridH);

    catGridG
        .on("mousemove", (event) => {
            if (catViz) {
                const rect = containerNode.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                tooltip
                    .style("opacity", 1)
                    .html(`Cats: ${catValue}`)
                    .style("left", (x + 12) + "px")
                    .style("top",  (y - 28) + "px");
            } else {
                tooltip.style("opacity", 0);
            }
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });
    dogGridG
        .on("mousemove", (event) => {
            if (dogViz) {
                const rect = containerNode.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                tooltip
                    .style("opacity", 1)
                    .html(`Dogs: ${dogValue}`)
                    .style("left", (x + 12) + "px")
                    .style("top",  (y - 28) + "px");
            }
            else {
                tooltip.style("opacity", 0);
            }
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });

    gridsG.append("text")
        .attr("x", gridW / 2)
        .attr("y", gridH + 28)
        .attr("text-anchor", "middle")
        .text("Cats");
    gridsG.append("text")
        .attr("x", gridW + 140 + gridW / 2)
        .attr("y", gridH + 28)
        .attr("text-anchor", "middle")
        .text("Dogs");


    const handleHeight = 50;
    const inset = 75;
    const cornerRadius = 10;
    const catBaseY = gridsOffsetY - 5;
    const catGridLeft = gridsOffsetX;
    const catGridRight = gridsOffsetX + gridW;

    const catLeftX = catGridLeft + inset;
    const catRightX = catGridRight - inset;
    const catTopY = catBaseY - handleHeight;

    const catRectPath = `
      M ${catLeftX} ${catBaseY}
      L ${catLeftX} ${catTopY + cornerRadius}
      Q ${catLeftX} ${catTopY} ${catLeftX + cornerRadius} ${catTopY}
      L ${catRightX - cornerRadius} ${catTopY}
      Q ${catRightX} ${catTopY} ${catRightX} ${catTopY + cornerRadius}
      L ${catRightX} ${catBaseY}
    `;

    svg.append("path")
        .attr("d", catRectPath)
        .attr("fill", "none")
        .attr("stroke", "#222")
        .attr("stroke-width", 7)
        .attr("stroke-linecap", "round");

    const dogGridLeft = gridsOffsetX + gridW + gridSpacing;
    const dogGridRight = dogGridLeft + gridW;

    const dogLeftX = dogGridLeft + inset;
    const dogRightX = dogGridRight - inset;
    const dogTopY = catTopY;

    const dogRectPath = `
      M ${dogLeftX} ${catBaseY}
      L ${dogLeftX} ${dogTopY + cornerRadius}
      Q ${dogLeftX} ${dogTopY} ${dogLeftX + cornerRadius} ${dogTopY}
      L ${dogRightX - cornerRadius} ${dogTopY}
      Q ${dogRightX} ${dogTopY} ${dogRightX} ${dogTopY + cornerRadius}
      L ${dogRightX} ${catBaseY}
    `;

    svg.append("path")
        .attr("d", dogRectPath)
        .attr("fill", "none")
        .attr("stroke", "#222")
        .attr("stroke-width", 7)
        .attr("stroke-linecap", "round");


    function drawGrid(g, x, y, w, h) {
        g.append("rect")
            .attr("x", x).attr("y", y).attr("width", w).attr("height", h)
            .attr("fill", "none")
            .attr("stroke", "#222")
            .attr("stroke-width", 5)
            .attr("rx", 4)
            .attr("ry", 4);

        for (let r = 1; r < nRows; r++) {
            const yLine = y + r * cellH;
            g.append("line")
                .attr("class", "basket-gridlines")
                .attr("x1", x)
                .attr("y1", yLine)
                .attr("x2", x + w)
                .attr("y2", yLine)
                .attr("stroke", "#aaa")
                .attr("stroke-width", 0.8)
                .attr("stroke-opacity", 0.6);

            const yMid = yLine - cellH / 2;
            g.append("line")
                .attr("class", "basket-gridlines")
                .attr("x1", x)
                .attr("y1", yMid)
                .attr("x2", x + w)
                .attr("y2", yMid)
                .attr("stroke", "#ccc")
                .attr("stroke-width", 0.8)
                .attr("stroke-opacity", 0.6);
        }

        const weaveCount = nCols * 2;
        for (let i = 1; i < weaveCount; i++) {
            const vx = x + (i * w) / weaveCount;
            g.append("line")
                .attr("class", "basket-gridlines")
                .attr("x1", vx)
                .attr("y1", y)
                .attr("x2", vx)
                .attr("y2", y + h)
                .attr("stroke", i % 2 === 0 ? "#aaa" : "#ccc")
                .attr("stroke-width", 0.8)
                .attr("stroke-opacity", 0.6);
        }
    }

    function valueToRowCount(v) {
        const p = Math.max(0, Math.min(1, v / maxValue));
        return Math.round(p * nRows);
    }

    function dropIntoGrid(a) {
        if (a === "cat") {
            catViz = true;
            const nodes = buildCircles(
                catValue,
                0,
                0,
                gridW,
                gridH,
                "#f4a261"
            );

            catCircles = nodes;
            renderCircles("#cat-grid", nodes);
            startBasketSim(catSim, nodes, gridW, gridH);
        } else {
            dogViz = true;
            const nodes = buildCircles(
                dogValue,
                0,
                0,
                gridW,
                gridH,
                "#457b9d"
            );
            dogCircles = nodes;
            renderCircles("#dog-grid", nodes);
            startBasketSim(dogSim, nodes, gridW, gridH);
        }

        svg.selectAll(".basket-gridlines").raise();
    }

    function buildCircles(value, basketX, basketY, basketW, basketH, color) {
        const p = Math.max(0, Math.min(1, value / maxValue));
        const maxBalls = 150;
        const count = Math.max(20, Math.round(p * maxBalls));
        const r = Math.min(cellW, cellH) / 2 - 11;

        return d3.range(count).map(i => ({
            x: basketX + Math.random() * basketW,
            y: basketY - 60 - Math.random() * 80,
            vy: 0,
            r,
            color
        }));
    }

    function renderCircles(gridSelect, nodes) {
        const g = d3.select(gridSelect);

        const circles = g.selectAll("circle.filled")
            .data(nodes);

        circles.exit().remove();

        const enter = circles.enter()
            .append("circle")
            .attr("class", "filled")
            .attr("r", d => d.r)
            .attr("fill", d => d.color)
            .merge(circles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function startBasketSim(sim, nodes, basketW, basketH) {
        const r = Math.min(cellW, cellH) / 2 - 4;

        sim.nodes(nodes)
            .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(2))
            .force("gravity", d3.forceY(basketH - r - 2).strength(0.06))
            .force("x", d3.forceX(basketW / 2).strength(0.02))
            .on("tick", () => {
                nodes.forEach(n => {
                    if (n.y > basketH - n.r - 2) n.y = basketH - n.r - 2;
                    if (n.y < n.r) n.y = n.r;
                    if (n.x < n.r) n.x = n.r;
                    if (n.x > basketW - n.r) n.x = basketW - n.r;
                });

                d3.selectAll("#cat-grid circle.filled, #dog-grid circle.filled")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            })
            .alpha(1)
            .restart();
    }

    function resetGrids() {
        d3.select("#cat-grid").selectAll("circle.filled").remove();
        d3.select("#dog-grid").selectAll("circle.filled").remove();
        catCircles = [];
        dogCircles = [];
        dogViz = false;
        catViz = false;
        catSim.stop();
        dogSim.stop();
        tooltip.style("opacity", 0);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    dropIntoGrid("cat")
                    dropIntoGrid("dog");
                    observer.unobserve(containerNode);
                }
            });
        }, {
            threshold: 1
        });
        observer.observe(containerNode);
    }
}

export default ProductCountViz
