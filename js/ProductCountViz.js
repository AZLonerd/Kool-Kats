const margin = {top: 40, right: 40, bottom: 40, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 420;


let svg = d3.select("#shopping-cart-viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", +svg.attr("width"))
    .attr("height", +svg.attr("height"))
    .attr("fill", "none")
    .attr("stroke", "#bbb")
    .attr("stroke-dasharray", "4 4");


svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top - 20)
    .attr("text-anchor", "middle")
    .text("Trade Amount Count: Cat vs Dog");

const imgSources = [
    "images/image0.png",
    "images/image1.png",
    "images/image2.png",
]

let imgI = 0;

const img = svg.append("image")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width)
    .attr("height", height)
    .attr("href", imgSources[imgI]);

img.style("cursor", "pointer")
    .on("click", () => {
        imgI = (imgI + 1) % imgSources.length;
        img.attr("href", imgSources[imgI]);
    })
