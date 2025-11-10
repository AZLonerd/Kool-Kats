class ShelterStatsViz {
    constructor(parentElement, geoData, shelterData, barChart) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.shelterData = shelterData;
        this.barChart = barChart;
        this.currentView = 'cats'; // default will be cats

        // continous color scales. not sure if i *love* the colors
        this.colorSchemes = {
            cats: {
                name: 'Average Cat Adoptions by State',
                colors: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
                dataKey: 'Average Cat Adoptions'
            },
            dogs: {
                name: 'Average Dog Adoptions by State',
                colors: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
                dataKey: 'Average Dog Adoptions'
            },
            ratio: {
                name: 'Cat:Dog Adoption Ratio by State',
                colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', ' #c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
                dataKey: 'ratio (Cat:Dog)'
            }
        };

        this.initVis();
    }

    changeView(view) {
        let vis = this;
        vis.currentView = view;
        vis.wrangleData();
        if (vis.barChart) {
            vis.barChart.changeView(view);
        }
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 60, right: 20, bottom: 60, left: 20 };
        vis.width = 900 - vis.margin.left - vis.margin.right;
        vis.height = 550 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

        // title
        vis.titleGroup = vis.svg.append('g')
            .attr('class', 'title')
            .attr('transform', `translate(${(vis.width + vis.margin.left + vis.margin.right) / 2}, 30)`);

        vis.title = vis.titleGroup.append('text')
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .style('fill', '#000395');

        // map
        vis.mapGroup = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.margin.top})`);

        vis.states = topojson.feature(vis.geoData, vis.geoData.objects.states);
        vis.projection = d3.geoAlbersUsa()
            .fitSize([vis.width, vis.height], vis.states);
        vis.path = d3.geoPath().projection(vis.projection);

        //tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'shelterTooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', '1px solid #ddd')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)');

        // legend
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(${(vis.width + vis.margin.left + vis.margin.right) / 2 - 100}, ${vis.height + vis.margin.top + 25})`); // FIXED: rlly close
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.shelterDataMap = {};
        vis.shelterData.forEach(d => {
            vis.shelterDataMap[d.State] = {
                state: d.State,
                catAdoptions: +d['Average Cat Adoptions'],
                dogAdoptions: +d['Average Dog Adoptions'],
                ratio: +d['ratio (Cat:Dog)']
            };
        });

        //get color scheme
        vis.currentScheme = vis.colorSchemes[vis.currentView];

        //get data
        let values = vis.shelterData.map(d => {
            if (vis.currentView === 'cats') return +d['Average Cat Adoptions'];
            if (vis.currentView === 'dogs') return +d['Average Dog Adoptions'];
            return +d['ratio (Cat:Dog)'];
        }).filter(v => !isNaN(v));

        //make a color scale
        vis.colorScale = d3.scaleQuantize()
            .domain([d3.min(values), d3.max(values)])
            .range(vis.currentScheme.colors);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.title.text(vis.currentScheme.name);

        const states = vis.mapGroup.selectAll('.state')
            .data(vis.states.features);

        states.enter()
            .append('path')
            .attr('class', 'state')
            .merge(states)
            .transition()
            .duration(500)
            .attr('d', vis.path)
            .attr('fill', d => {
                const stateName = d.properties.name;
                const stateData = vis.shelterDataMap[stateName];
                if (!stateData) return '#ccc';

                let value;
                if (vis.currentView === 'cats') value = stateData.catAdoptions;
                else if (vis.currentView === 'dogs') value = stateData.dogAdoptions;
                else value = stateData.ratio;

                return isNaN(value) ? '#ccc' : vis.colorScale(value);
            });

        vis.mapGroup.selectAll('.state')
            .attr('stroke', 'black') // FIX: not the biggest fan of this...
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                const stateName = d.properties.name;
                const stateData = vis.shelterDataMap[stateName];

                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 2);

                if (stateData) {
                    let displayValue, label;
                    if (vis.currentView === 'cats') {
                        displayValue = stateData.catAdoptions.toFixed(0);
                        label = 'Avg Cat Adoptions';
                    } else if (vis.currentView === 'dogs') {
                        displayValue = stateData.dogAdoptions.toFixed(0);
                        label = 'Avg Dog Adoptions';
                    } else {
                        displayValue = stateData.ratio.toFixed(2);
                        label = 'Cat:Dog Ratio';
                    }

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", (event.pageX + 15) + "px")
                        .style("top", (event.pageY - 28) + "px")
                        .html(`
                            <strong>${stateName}</strong><br/>
                            ${label}: <strong>${displayValue}</strong>
                        `);
                }
            })
            .on('mousemove', function(event) {
                vis.tooltip
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1);

                vis.tooltip.style("opacity", 0);
            });

        states.exit().remove();

        vis.updateLegend();
    }

    updateLegend() {
        let vis = this;

        vis.legend.selectAll('*').remove();

        const legendWidth = 200;
        const legendHeight = 15;

        //gradient !
        const defs = vis.svg.select('defs').empty() ?
            vis.svg.append('defs') : vis.svg.select('defs');

        defs.selectAll('linearGradient').remove();

        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient');

        vis.currentScheme.colors.forEach((color, i) => {
            gradient.append('stop')
                .attr('offset', `${(i / (vis.currentScheme.colors.length - 1)) * 100}%`)
                .attr('stop-color', color);
        });

        // legend stuff this is the title
        vis.legend.append('text')
            .attr('x', legendWidth / 2)
            .attr('y', -8)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .style('fill', '#000')
            .text('Value Range');

        //little rect for it
        vis.legend.append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)')
            .attr('stroke', '#000')
            .attr('stroke-width', 1);

        //labels - get actual data extent
        let values = vis.shelterData.map(d => {
            if (vis.currentView === 'cats') return +d['Average Cat Adoptions'];
            if (vis.currentView === 'dogs') return +d['Average Dog Adoptions'];
            return +d['ratio (Cat:Dog)'];
        }).filter(v => !isNaN(v));

        const minValue = d3.min(values);
        const maxValue = d3.max(values);

        vis.legend.append('text')
            .attr('x', 0)
            .attr('y', legendHeight + 18)
            .style('font-size', '13px')
            .style('fill', '#000')
            .style('font-weight', 'bold')
            .text(minValue.toFixed(vis.currentView === 'ratio' ? 2 : 0));

        vis.legend.append('text')
            .attr('x', legendWidth)
            .attr('y', legendHeight + 18)
            .attr('text-anchor', 'end')
            .style('font-size', '13px')
            .style('fill', '#000')
            .style('font-weight', 'bold')
            .text(maxValue.toFixed(vis.currentView === 'ratio' ? 2 : 0));
    }
}

let shelterViz;
let barChart;

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),
    d3.csv("data/ShelterStats.csv")
]).then(([geoData, shelterData]) => {
    barChart = new TopStatesBarChart('bar-chart-viz', shelterData);
    shelterViz = new ShelterStatsViz('shelter-viz', geoData, shelterData, barChart);

    //make sure we listen to the buttons
    d3.selectAll('input[name="shelter-metric"]').on('change', function() {
        const selectedValue = d3.select(this).property('value');
        let viewType;

        if (selectedValue === 'avgCat') {
            viewType = 'cats';
        } else if (selectedValue === 'avgDog') {
            viewType = 'dogs';
        } else if (selectedValue === 'ratio') {
            viewType = 'ratio';
        }

        console.log('View changed to:', viewType); // FIX: debuging bc this isn't working asklfha
        if (shelterViz && viewType) {
            shelterViz.changeView(viewType);
        }
    });
});