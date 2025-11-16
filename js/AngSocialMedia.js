
const margin = { top: 50, right: 50, bottom: 50, left: 180 };
const svgWidth = 900;
const svgHeight = 500;


class SocialMediaCharts {
    constructor(data) {
        this.width = 500;
        this.height = 300;
        this.radius = Math.min(this.width, this.height) / 2;

        this.youtubeData = data.filter(d => d.platform === "YouTube");
        this.tiktokData = data.filter(d => d.platform === "TikTok");
        this.instagramData = data.filter(d => d.platform === "Instagram");

        const youtubeTotal = this.youtubeData[0].count + this.youtubeData[1].count;
        const tiktokTotal = this.tiktokData[0].count + this.tiktokData[1].count;
        const instagramTotal = this.instagramData[0].count + this.instagramData[1].count;

        this.donutData = {
            "Cats (YouTube)": this.youtubeData.find(d => d.type === "Cats").count / youtubeTotal,
            "Dogs (YouTube)": this.youtubeData.find(d => d.type === "Dogs").count / youtubeTotal,
            "Cats (TikTok)": this.tiktokData.find(d => d.type === "Cats").count / tiktokTotal,
            "Dogs (TikTok)": this.tiktokData.find(d => d.type === "Dogs").count / tiktokTotal,
            "Cats (Instagram)": this.instagramData.find(d => d.type === "Cats").count / instagramTotal,
            "Dogs (Instagram)": this.instagramData.find(d => d.type === "Dogs").count / instagramTotal
        };

        this.colorScale = d3.scaleOrdinal()
            .domain(["Cats", "Dogs"])
            .range(["#FFB6C1", "#87CEFA"]);

        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("padding", "6px")
            .style("background", "rgba(0,0,0,0.9)")
            .style("color", "white")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    initChart(label, value, container) {
        const self = this;
        let total = 0;

        d3.select(container).html("");

        const svg = d3.select(container)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height + 60)
            .append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2 + 30})`);

        const [type, platformPart] = label.split(" ");
        const platform = platformPart.slice(1, -1);

        if (platform === "YouTube") {
            total = this.youtubeData[0].count + this.youtubeData[1].count;
        } else if (platform === "TikTok") {
            total = this.tiktokData[0].count + this.tiktokData[1].count;
        } else if (platform === "Instagram") {
            total = this.instagramData[0].count + this.instagramData[1].count;
        }





        let typeKey;
        if (type === "Cats") {
            typeKey = "Cats";
        } else {
            typeKey = "Dogs";
        }


        const emojiMap = { Cats: "🐱", Dogs: "🐶" };
        const emoji = emojiMap[typeKey];
        const actualCount = this.donutData[`${typeKey} (${platform})`] * total;

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(this.radius * 0.5).outerRadius(this.radius);

        const data = [
            { label: label, value: value },
            { label: "Rest", value: 1 - value }
        ];

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", -this.radius - 15)
            .attr("font-size", "14px")
            .attr("font-weight", "bold")
            .style("fill", "#333")
            .text(`${(value * 100).toFixed(1)}% ${emoji} are ${type.toLowerCase()} videos out of total cats + dogs on ${platform}`);

        const arcs = svg.selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g");

        function showtt(event, d) {
            self.tooltip
                .style("opacity", 1)
                .html(`${emoji} ${type}: ${(value * 100).toFixed(1)}%<br>(${Math.round(actualCount).toLocaleString()} views)`)
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 28 + "px");
        }


        function hidett() {
            self.tooltip.style("opacity", 0);
        }

        arcs.append("path")
            .attr("fill", (d, i) => i === 0 ? (type === "Cats" ? "#FFB6C1" : "#87CEFA") : "#eee")
            .each(function (d) {
                this._current = { startAngle: 0, endAngle: 0 };
            })
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(1);
                return t => arc(interpolate(t));
            })
            .on("end", function () {
                d3.select(this)
                    .on("mouseover", showtt)
                    .on("mouseout", hidett);
            });

        const text = svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "16px");

        text.transition()
            .duration(2000)
            .tween("text", function () {
                const i = d3.interpolate(0, value * 100);
                return t => text.text(`${i(t).toFixed(1)}%`);
            });

        document.getElementById("donut-description").innerHTML =
            "As you can see, dogs are more popular than cats on popular social media platforms like TikTok and Instagram.";
    }

    buildTree() {
        const treeData = {
            name: "Popular Social Media",
            children: [
                { name: "TikTok", children: this.tiktokData.map(d => ({ name: d.type, value: d.count })) },
                { name: "Instagram", children: this.instagramData.map(d => ({ name: d.type, value: d.count })) }
            ]
        };

        const treeWidth = svgWidth - margin.left - margin.right;
        const treeHeight = svgHeight - margin.top - margin.bottom;

        const svgTree = d3.select("#tree-chart")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const treeLayout = d3.tree().size([treeHeight, treeWidth - 160]);
        const root = d3.hierarchy(treeData).sum(d => d.value);
        treeLayout(root);

        const leafValues = [
            ...this.tiktokData.map(d => d.count),
            ...this.instagramData.map(d => d.count)
        ];

        const sizeScale = d3.scaleSqrt()
            .domain([d3.min(leafValues), d3.max(leafValues)])
            .range([8, 25]);

        const totals = {
            TikTok: this.tiktokData[0].count + this.tiktokData[1].count,
            Instagram: this.instagramData[0].count + this.instagramData[1].count
        };

        svgTree.selectAll(".link")
            .data(root.links())
            .enter()
            .append("line")
            .attr("x1", d => d.source.y)
            .attr("y1", d => d.source.x)
            .attr("x2", d => d.target.y)
            .attr("y2", d => d.target.x)
            .attr("stroke", "gray")
            .attr("stroke-width", 2);

        const nodes = svgTree.selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", d => `translate(${d.y},${d.x})`);

        nodes.append("circle")
            .attr("r", d => {
                if (d === root) return 4; // 👈 very small root node
                if (d.data.name === "TikTok" || d.data.name === "Instagram") {
                    return sizeScale(totals[d.data.name]);
                } else {
                    return sizeScale(d.data.value);
                }
            })
            .attr("fill", d => {
                if (d === root) return "#ddd"; // light gray root circle
                return d.children ? "#fff" : this.colorScale(d.data.name);
            })
            .attr("stroke", d => d === root ? "#999" : d.children ? "#000" : "#333")
            .attr("stroke-width", d => (d === root ? 1 : 1.5))
            .style("cursor", d => (!d.children && d.parent) ? "pointer" : "default")
            .on("mouseover", (event, d) => {
                if (d === root) return;

                if (!d.children && d.parent) {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr("fill", d3.color(this.colorScale(d.data.name)).darker(0.8));

                    this.tooltip
                        .style("opacity", 1)
                        .html(`${d.data.name}: ${d.data.value.toString()} views`)
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                }

                else if (d.data.name === "TikTok" || d.data.name === "Instagram") {
                    const platform = d.data.name;
                    const total = totals[platform];
                    this.tooltip
                        .style("opacity", 1)
                        .html(`<strong>${platform}</strong><br>Total: ${total.toLocaleString()} views`)
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                }
            })
            .on("mouseout", (event, d) => {
                this.tooltip.style("opacity", 0);


                if (!d.children && d.parent) {
                    d3.select(event.currentTarget)
                        .transition()
                        .duration(200)
                        .attr("fill", this.colorScale(d.data.name));
                }
            })

            .on("click", (event, d) => {
                if (!d.children && d.parent) {
                    const key = `${d.data.name} (${d.parent.data.name})`;
                    d3.select("#donut-charts").style("display", "flex");
                    d3.select("#charts").style("display", "none");

                    const container = d3.select("#donut-charts").html("");
                    this.initChart(key, this.donutData[key], container.node());
                }
            });

        nodes.append("text")
            .attr("dy", d => (d === root ? -7 : 5))
            .attr("x", d => {
                if (d === root) return 0;
                return d.children ? -20 : sizeScale(d.data.value) + 10;
            })
            .attr("dx", d => {
                if (d === root) return 0;
                return d.children ? -35 : sizeScale(d.data.value) + 10
            })
            .attr("text-anchor", d => {
                if (d === root) return "end";
                return d.children ? "end" : "start";
            })
            .text(d => d.data.name)
            .attr("font-size", d => (d === root ? "18px" : d.children ? "16px" : "14px"))
            .attr("font-weight", d => (d === root ? "bold" : "normal"));
    }

}


d3.csv("data/social_media_pets.csv").then(data => {
    data.forEach(d => d.count = +d.count);

    const charts = new SocialMediaCharts(data);
    charts.buildTree();
});
