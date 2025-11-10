export function renderAnimalPairViz(containerId = "#animal-pairs-viz") {
    const c = d3.select(containerId)
    c.style("position", "relative")

    const rect = c.node().getBoundingClientRect()
    const W = rect.width || 800, H = rect.height || 520
    const m = { top: 20, right: 20, bottom: 20, left: 20 }
    const w = W - m.left - m.right, h = H - m.top - m.bottom

    const svg = c.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("background", "#f5f5f5")

    const g = svg.append("g")
        .attr("transform", `translate(${m.left},${m.top})`)

    const defs = svg.append("defs")
    const f = defs.append("filter").attr("id", "gold-glow")
    f.append("feDropShadow")
        .attr("dx", 0)
        .attr("dy", 0)
        .attr("stdDeviation", 4)
        .attr("flood-color", "gold")
        .attr("flood-opacity", 0.9)

    const caption = c.append("div")
        .style("position", "absolute")
        .style("left", "50%")
        .style("top", "70%")
        .style("transform", "translate(-50%,-50%)")
        .style("text-align", "center")
        .style("font-weight", "700")
        .style("font-size", "18px")
        .style("color", "#222")
        .style("pointer-events", "none")

    const tooltip = c.append("div")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("background", "rgba(0,0,0,.85)")
        .style("color", "#fff")
        .style("padding", "6px 8px")
        .style("border-radius", "6px")
        .style("font-size", "12px")
        .style("opacity", 0)

    const clearBtn = c.append("button")
        .text("Clear All")
        .style("position", "absolute")
        .style("bottom", "10px")
        .style("right", "15px")
        .style("padding", "5px 10px")
        .style("font-size", "12px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("background", "#fff")
        .style("cursor", "pointer")
        .on("mouseover", function () { d3.select(this).style("background", "#eee") })
        .on("mouseout", function () { d3.select(this).style("background", "#fff") })

    const cats = [
        { name: "Animal Toys", cat: 10271, dog: 11573 },
        { name: "Supplements", cat: 9561, dog: 9052 },
        { name: "Snack", cat: 9446, dog: 9867 },
        { name: "Medicine", cat: 11087, dog: 10024 },
        { name: "Housing", cat: 10679, dog: 8506 },
        { name: "Grooming", cat: 9999, dog: 8580 },
        { name: "Food", cat: 9222, dog: 9424 },
        { name: "Equipment", cat: 9478, dog: 9884 },
        { name: "Clothes", cat: 9533, dog: 9474 },
        { name: "Bedding", cat: 8757, dog: 10057 },
        { name: "Accessory", cat: 9094, dog: 8464 }
    ]

    const N = cats.length, R = 40, SR = Math.min(w, h) / 3.7, gap = Math.min(160, w * 0.22)
    const cy = h / 2, cxCat = w / 2 - gap / 2, cxDog = w / 2 + gap / 2

    const img = 120
    g.append("image").attr("href", "../images/catprod.png")
        .attr("x", cxCat - img / 2)
        .attr("y", cy - img / 2)
        .attr("width", img).attr("height", img)
        .style("pointer-events", "none")

    g.append("image").attr("href", "../images/dogprod.png")
        .attr("x", cxDog - img / 2)
        .attr("y", cy - img / 2)
        .attr("width", img).attr("height", img)
        .style("pointer-events", "none")

    const ang = d3.range(-Math.PI / 2, Math.PI / 2 + 1e-6, Math.PI / (N - 1))
    const sides = [
        { k: "cat", cx: cxCat, dir: -1, base: "#f4a261", sel: "#d67227" },
        { k: "dog", cx: cxDog, dir: 1, base: "#457b9d", sel: "#2f5c7b" }
    ]

    const pts = sides.flatMap(s => ang.map((a, i) => {
        const r = SR + (i % 2 ? -R : R)
        return {
            id: i, side: s.k, label: cats[i].name, val: cats[i][s.k],
            cx: s.cx + s.dir * Math.cos(a) * r,
            cy: cy + Math.sin(a) * r,
            base: s.base, sel: s.sel
        }
    }))

    const fmt = d3.format(",")
    const picked = new Set()
    let catSum = 0, dogSum = 0

    const maxSum = d3.sum(cats, d => d.cat) * 1.2
    const yScale = d3.scaleLinear().domain([0, maxSum]).range([0, h * 0.9])

    const barW = 30
    const barGroup = g.append("g")

    const catBar = barGroup.append("rect")
        .attr("x", 0)
        .attr("y", h / 2 + 250)
        .attr("width", barW)
        .attr("height", 0)
        .attr("fill", "#f4a261aa")

    const dogBar = barGroup.append("rect")
        .attr("x", w - barW)
        .attr("y", h / 2 + 250)
        .attr("width", barW)
        .attr("height", 0)
        .attr("fill", "#457b9daa")

    const catLabel = barGroup.append("text")
        .attr("x", barW / 2)
        .attr("y", h / 2 - 10 + 250)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#d67227")
        .text("$0")

    const dogLabel = barGroup.append("text")
        .attr("x", w - barW / 2)
        .attr("y", h / 2 - 10 + 250)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#2f5c7b")
        .text("$0")

    function updateVisuals() {
        const diff = catSum - dogSum, sign = diff > 0 ? "+" : diff < 0 ? "-" : ""
        caption.html(
            `<div style='color:#d67227'>Cats: $${fmt(catSum)}</div>` +
            `<div style='color:#457b9d'>Dogs: $${fmt(dogSum)}</div>` +
            `<div style='color:#555'>Diff: ${sign}$${fmt(Math.abs(diff))}</div>`
        )

        catBar.transition().duration(600)
            .attr("y", h / 2 - yScale(catSum) + 250)
            .attr("height", yScale(catSum))

        dogBar.transition().duration(600)
            .attr("y", h / 2 - yScale(dogSum) + 250)
            .attr("height", yScale(dogSum))

        catLabel.transition().duration(600)
            .attr("y", h / 2 - yScale(catSum) - 10 + 250)
            .on("end", () => catLabel.text(`$${fmt(catSum)}`))

        dogLabel.transition().duration(600)
            .attr("y", h / 2 - yScale(dogSum) - 10 + 250)
            .on("end", () => dogLabel.text(`$${fmt(dogSum)}`))
    }

    const circles = g.selectAll("circle")
        .data(pts).enter().append("circle")
        .attr("cx", d => d.cx)
        .attr("cy", d => d.cy)
        .attr("r", R)
        .attr("fill", d => d.base)
        .attr("opacity", .96)
        .style("cursor", "pointer")
        .on("mousemove", (e, d) => {
            const box = c.node().getBoundingClientRect()
            tooltip.style("left", e.clientX - box.left + 10 + "px")
                .style("top", e.clientY - box.top + 10 + "px")
                .style("opacity", 1)
                .html(`<b>${d.label}</b><div>Cat: ${fmt(cats[d.id].cat)}</div><div>Dog: ${fmt(cats[d.id].dog)}</div>`)
        })
        .on("mouseleave", () => tooltip.style("opacity", 0))
        .on("click", (_, d) => {
            const i = d.id, pair = g.selectAll("circle").filter(p => p.id === i)
            if (picked.has(i)) {
                picked.delete(i)
                catSum -= cats[i].cat
                dogSum -= cats[i].dog
                pair.attr("filter", null).attr("fill", p => p.base)
            } else {
                picked.add(i)
                catSum += cats[i].cat
                dogSum += cats[i].dog
                pair.attr("filter", "url(#gold-glow)")
                    .attr("fill", p => d3.color(p.sel).darker(0.5))
            }
            updateVisuals()
        })

    g.selectAll("text.lbl")
        .data(pts).enter().append("text")
        .attr("x", d => d.cx)
        .attr("y", d => d.cy + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "700")
        .style("fill", "#fff")
        .style("pointer-events", "none")
        .text(d => d.label.length > 12 ? d.label.slice(0, 11) + "…" : d.label)

    clearBtn.on("click", () => {
        picked.clear()
        catSum = 0
        dogSum = 0
        circles.attr("filter", null).attr("fill", d => d.base)
        updateVisuals()
    })
}
