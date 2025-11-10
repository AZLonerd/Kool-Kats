class TopStatesBarChart {
    constructor(parentElement, shelterData) {
        this.parentElement = parentElement;
        this.shelterData = shelterData;
        this.currentView = 'cats'; // default view

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 60, right: 40, bottom: 60, left: 120 };
        vis.width = 900 - vis.margin.left - vis.margin.right;
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.titleGroup = vis.svg.append('g')
            .attr('class', 'title');

        vis.title = vis.titleGroup.append('text')
            .attr('x', vis.width / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', '#000395');

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);

        vis.yScale = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.15);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(8);
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis");

        vis.xAxisLabel = vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + 45)
            .attr("text-anchor", "middle")
            .style("font-size", "13px")
            .style("font-weight", "500");

        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y", -80)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .style("font-size", "13px")
            .style("font-weight", "500")
            .text("State");

        vis.barTooltip = d3.select("body").append('div')
            .attr('class', "tooltip bar-chart-tooltip")
            .attr('id', 'barChartTooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.shelterData
            .map(d => ({
                state: d.State,
                value: vis.currentView === 'cats' ? +d['Average Cat Adoptions'] :
                    vis.currentView === 'dogs' ? +d['Average Dog Adoptions'] :
                        +d['ratio (Cat:Dog)']
            }))
            .filter(d => !isNaN(d.value))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const titles = {
            cats: 'Top 10 States - Cat Adoptions',
            dogs: 'Top 10 States - Dog Adoptions',
            ratio: 'Top 10 States - Cat:Dog Ratio'
        };
        vis.title.text(titles[vis.currentView]);

        const labels = {
            cats: 'Average Cat Adoptions',
            dogs: 'Average Dog Adoptions',
            ratio: 'Cat:Dog Ratio'
        };
        vis.xAxisLabel.text(labels[vis.currentView]);

        // FIXED: match colors of others
        const colors = {
            cats: '#f4a261',
            dogs: '#457b9d',
            ratio: '#df65b0'
        };
        const barColor = colors[vis.currentView];

        vis.xScale.domain([0, d3.max(vis.displayData, d => d.value) * 1.1]);
        vis.yScale.domain(vis.displayData.map(d => d.state));

        vis.xAxisGroup
            .transition()
            .duration(500)
            .call(vis.xAxis);

        vis.yAxisGroup
            .transition()
            .duration(500)
            .call(vis.yAxis);

        const bars = vis.svg.selectAll('.bar')
            .data(vis.displayData, d => d.state);

        bars.exit()
            .transition()
            .duration(400)
            .attr('width', 0)
            .remove();

        bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('fill', barColor)
            .attr('y', d => vis.yScale(d.state))
            .attr('height', vis.yScale.bandwidth())
            .attr('x', 0)
            .attr('width', 0)
            .merge(bars)
            .transition()
            .duration(800)
            .attr('fill', barColor)
            .attr('y', d => vis.yScale(d.state))
            .attr('height', vis.yScale.bandwidth())
            .attr('width', d => vis.xScale(d.value));

        const valueLabels = vis.svg.selectAll('.value-label')
            .data(vis.displayData, d => d.state);

        valueLabels.exit()
            .transition()
            .duration(400)
            .style('opacity', 0)
            .remove();

        valueLabels.enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('y', d => vis.yScale(d.state) + vis.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('x', 5)
            .style('opacity', 0)
            .merge(valueLabels)
            .transition()
            .duration(500)
            .attr('y', d => vis.yScale(d.state) + vis.yScale.bandwidth() / 2)
            .attr('x', d => vis.xScale(d.value) + 5)
            .style('font-size', '11px')
            .style('fill', '#333')
            .style('font-weight', '500')
            .style('opacity', 1)
            .text(d => d.value.toFixed(vis.currentView === 'ratio' ? 2 : 0));
    }

    changeView(view) {
        this.currentView = view;
        this.wrangleData();
    }
}