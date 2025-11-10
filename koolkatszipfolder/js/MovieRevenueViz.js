export function renderMovieRevenueViz(containerId = "#movie-ratings-viz") {

    // CONSTS
    const container = d3.select(containerId);
    const rect = container.node().getBoundingClientRect();
    const outerW = rect.width || 600;
    const outerH = rect.height || 400;
    const margin = { top: 16, right: 24, bottom: 24, left: 24 };
    const width = outerW - margin.left - margin.right;
    const height = outerH - margin.top - margin.bottom;
    const CAT_BIG_R = Math.min(width, height) / 4;
    const DOG_BIG_R = Math.min(width, height) / 3;
    const GAP = Math.min(width / 3, 170);
    const PADDING = 5;
    const tooltip = container.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("user-select", "none")
        .style("pointer-events", "none")
        .style("pointer-events", "none");
    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("background-color", "#f5f5f5");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const caption = container.append("div")
        .attr("class", "caption")
        .style("position", "absolute")
        .style("bottom", "65px")
        .style("width", "100%")
        .style("text-align", "center")
        .style("font-weight", "700")
        .style("font-size", "16px")
        .style("user-select", "none")
        .style("pointer-events", "none")
        .style("color", "#222");
    caption.text("Click any circle to see its revenue!");
    const categories = [
        { label: "Movies Featuring Cats", x: width / 2 - GAP, color: "#f4a261", selected: "#d67227", bigR: CAT_BIG_R },
        { label: "Movies Featuring Dogs", x: width / 2 + GAP, color: "#457b9d", selected: "#2f5c7b", bigR: DOG_BIG_R },
    ];

    d3.csv("../data/MovieRevenue.csv", d => ({
        category: d.Category,
        title: d.Title,
        revenue: +d.Revenue,
        description: d.Description
    })).then(data => {
        const cat = data.filter(d => d.category === "Cat");
        const dog = data.filter(d => d.category === "Dog");
        const allMovies = [...cat, ...dog];
        const revenueDomain = d3.extent(allMovies, d => d.revenue);
        const radiusScale = d3.scalePow().exponent(0.5).domain(revenueDomain).range([20, 40]);

        // Draw big circles
        g.selectAll(".big")
            .data(categories)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", height / 2)
            .attr("r", d => d.bigR)
            .attr("fill", d => d.color)
            .attr("opacity", 0.15);

        // Category labels
        g.selectAll(".label")
            .data(categories)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => d.x)
            .attr("y", 60)
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .text(d => d.label);

        // Source text
        g.append("text")
            .attr("x", - margin.left/2)
            .attr("y", height + margin.bottom/2)
            .attr("text-anchor", "start")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .style("font-size", "9px")
            .style("fill", "#757575")
            .text("Source: Kaggle's \"Movie Dataset\" and IMDbPro's \"Box Office Mojo\"");

        // Total for Cats
        g.append("text")
            .attr("class", "totalRevenues")
            .attr("x", categories[0].x)
            .attr("y", height / 2 + categories[0].bigR - 8)
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .style("font-size", "10px")
            .style("fill", "#666666")
            .text("Total: $1.50B");

        // Total for dogs
        g.append("text")
            .attr("class", "totalRevenues")
            .attr("x", categories[1].x)
            .attr("y", height / 2 + categories[1].bigR - 8)
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .style("font-size", "10px")
            .style("fill", "#666666FF")
            .text("Total: $3.93B");

        // Catto circles
        const catNodes = cat.map(m => ({ ...m, r: radiusScale(m.revenue) + PADDING, group: 0 }));
        d3.packSiblings(catNodes);
        catNodes.forEach(n => { n.x += categories[0].x; n.y += height / 2; });

        // Doggo circles
        const dogNodes = dog.map(m => ({ ...m, r: radiusScale(m.revenue) + PADDING, group: 1 }));
        d3.packSiblings(dogNodes);
        dogNodes.forEach(n => { n.x += categories[1].x; n.y += height / 2; });

        const nodes = [...catNodes, ...dogNodes];
        const pins = g.selectAll(".movie-circle")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "movie-circle")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // Circles
        pins.append("circle")
            .attr("r", d => d.r - PADDING)
            .attr("fill", d => categories[d.group].color)
            .attr("opacity", 0.92);

        // Text
        pins.append("text")
            .attr("dy", 1)
            .attr("text-anchor", "middle")
            .style("font-size", "9px")
            .style("fill", "#ffffff")
            .style("user-select", "none")
            .style("pointer-events", "none")
            .text(d => truncateText(d.title, d.r * 1.59));

        let selected = null;

        // Tooltip
        pins.on("mouseenter", function (evt, d) {
            tooltip.style("opacity", 1).text(d.title);
            positionTooltip(evt);
        }).on("mousemove", positionTooltip)
            .on("mouseleave", () => tooltip.style("opacity", 0));

        // Click behavior
        pins.on("click", function (evt, d) {
            const current = d3.select(this);
            const circle = current.select("circle");
            const text = current.select("text");
            const c = categories[d.group];

            if (selected && selected !== d) {
                const prevSel = pins.filter(p => p === selected);
                const prevC = categories[selected.group];
                prevSel.select("circle").attr("fill", prevC.color).attr("stroke", "none");
                prevSel.select("text").text(truncateText(selected.title, selected.r * 1.6));
                selected.showingRevenue = false;
            }

            if (!d.showingRevenue) {
                circle.attr("fill", c.selected).attr("stroke", "black").attr("stroke-width", 1);
                text.text(`${Math.floor(d.revenue / 1_000_000)}M`);
                caption.html(`
                  <div style="font-weight:700; color:#111; font-size:16px;">
                    ${d.title} — $${Math.floor(d.revenue / 1_000_000)} Million
                  </div>
                  <div style="font-size:12px; color:#555; font-weight:400; max-width:600px; margin:4px auto; line-height:1.3;">
                    ${d.description || "No description available."}
                  </div>
                `);
                d.showingRevenue = true;
                selected = d;
            } else {
                circle.transition().duration(160).attr("fill", c.color).attr("stroke", "none");
                text.text(truncateText(d.title, d.r * 1.6));
                caption.text("Click any circle to see its revenue!");
                d.showingRevenue = false;
                selected = null;
            }
        });

        // Turn long titles into "..."
        function truncateText(text, maxWidth) {
            const temp = d3.select("body").append("svg").append("text")
                .style("font-size", "10px").text(text);
            let t = text;
            while (t.length > 3 && temp.node().getComputedTextLength() > maxWidth) {
                t = t.slice(0, -1);
                temp.text(t + "…");
            }
            temp.remove();
            return t.length < text.length ? t + "…" : text;
        }

        // Tooltip position
        function positionTooltip(evt) {
            tooltip.style("left", evt.offsetX + 5 + "px")
                .style("top", evt.offsetY - 20 + "px");
        }
    });
}

