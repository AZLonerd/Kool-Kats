import { renderMovieRevenueViz } from "./MovieRevenueViz.js";
import { renderAnimalPairViz } from "./RenderAnimalPairViz.js";

renderMovieRevenueViz();
renderAnimalPairViz();

window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    const fadeStart = 0;
    const fadeEnd = 200;
    const scrollTop = window.scrollY;
    let opacity = 1 - (scrollTop - fadeStart) / (fadeEnd - fadeStart);
    opacity = Math.max(opacity, 0);
    opacity = Math.min(opacity, 1);
    header.style.opacity = opacity;
});