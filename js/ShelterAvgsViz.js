const width1 = 800;
const height1 = 450; //breaks if just height bc i made width a global in petownership hehe
//fix ? not the end of the world to have horrible naming convention right...

//setting up svg which we're calling meow
const meow = d3.select("#shelter-viz") //same thing w svg hehehe
    .append("svg")
    .attr("width", width1)
    .attr("height", height1);

//loading and converting data
d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
    .then(topology => {
        const states = topojson.feature(topology, topology.objects.states);

        const projection = d3.geoAlbersUsa()
            .fitSize([width1, height1], states);

        const path = d3.geoPath().projection(projection);

        //drawing the states
        meow.append("g")
            .selectAll("path")
            .data(states.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "rgba(255,165,0,0.7)")
            .attr("stroke", "white")
            .attr("stroke-width", 1.5);
    });