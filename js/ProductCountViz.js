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

    const nCols = 7, nRows = 6;
    const cellW = 50, cellH = 50;
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


    svg.append("text")
        .attr("x", outerW / 2 + 25)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .style("font-weight", "bold")
        .text("Pet Product Trade Amount - drop and play!");

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
        .tickValues([0, 333, 667, 1000]);

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
        .attr("x", gridW + 120 + gridW / 2)
        .attr("y", gridH + 28)
        .attr("text-anchor", "middle")
        .text("Dogs");

    const handleHeight = 45;
    const inset = 25;
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

        for (let c = 1; c < nCols; c++) {
            g.append("line")
                .attr("x1", x).attr("y1", y + c * cellW)
                .attr("x2", x + w).attr("y2", y + c * cellW)
                .attr("stroke", "#999").attr("stroke-width", .5);
        }
        for (let r = 1; r < nRows; r++) {
            g.append("line")
                .attr("x1", x).attr("y1", y + r * cellH)
                .attr("x2", x + w).attr("y2", y + r * cellH)
                .attr("stroke", "#999").attr("stroke-width", 0.5);
        }
    }

    function valueToRowCount(v) {
        const p = Math.max(0, Math.min(1, v/maxValue));
        return Math.round(p * nRows);
    }

    function dropIntoGrid(a) {
        if (a === "cat") {
            catViz = true;
            const rowfill = valueToRowCount(catValue);
            catCircles = buildCircles(rowfill);
            renderCircles("#cat-grid", catCircles, "#f4a261");
        }
        else {
            dogViz = true;
            const rowfill = valueToRowCount(dogValue);
            dogCircles = buildCircles(rowfill);
            renderCircles("#dog-grid", dogCircles, "#457b9d");
        }
    }

    function buildCircles(rowfill) {
        const data = [];
        for (let r = 0; r < rowfill; r++) {
            for (let c = 0; c < nCols; c++) {
                data.push({
                    cx: c * cellW + cellW / 2,
                    cy: (nRows - 1 - r) * cellH + cellH / 2
                });
            }
        }
        return data;
    }

    function renderCircles(gridSelect, data, color) {
        const circles = d3.select(gridSelect)
            .selectAll("circle.filled")
            .data(data, (d, i) => i);
        circles.exit().remove();

        const enter = circles.enter()
            .append("circle")
            .attr("class", "filled")
            .attr("cx", d => d.cx)
            .attr("cy", 0)
            .attr("r", 0)
            .attr("fill", color)
            .attr("fill-opacity", .9);

        enter.transition()
            .duration(400)
            .attr("cy", d => d.cy)
            .attr("r", cellW / 2 - 4);
        circles.transition()
            .duration(300)
            .attr("cx", d => d.cx)
            .attr("cy", d => d.cy)
            .attr("r", cellW / 2 - 4)
            .attr("fill", color);
    }

    function resetGrids() {
        d3.select("#cat-grid").selectAll("circle.filled").remove();
        d3.select("#dog-grid").selectAll("circle.filled").remove();
        catCircles = [];
        dogCircles = [];
        dogViz = false;
        catViz = false;
    }
}

export default ProductCountViz
