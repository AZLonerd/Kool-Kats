(function () {
    const TOTAL = 5430000000;
    const ANSWER_CATS = 1500000000;

    const slider = document.getElementById("revenue-guess-slider");
    const catsEl = document.getElementById("revenue-guess-cats");
    const dogsEl = document.getElementById("revenue-guess-dogs");
    const submitBtn = document.getElementById("revenue-guess-submit");
    const resultBox = document.getElementById("revenue-guess-result");
    const diffEl = document.getElementById("revenue-guess-diff");

    if (!slider) return;

    function fmtBillions(n, color) {
        return `<b style="color:${color}">$${(n / 1000000000).toFixed(2)} Billion</b>`;
    }

    function updateReadout() {
        const cats = TOTAL * (Number(slider.value) / 100);
        const dogs = TOTAL - cats;
        catsEl.innerHTML = fmtBillions(cats, "orange");
        dogsEl.innerHTML = fmtBillions(dogs, "#5457ff");
    }

    slider.addEventListener("input", updateReadout);
    updateReadout();

    function updateSliderColor() {
        const value = slider.value;
        slider.style.background = `linear-gradient(
            90deg,
            orange ${value}%,
            #5457ff ${value}%
        )`;
    }

    slider.addEventListener("input", () => {
        updateReadout();
        updateSliderColor();
    });

    // initialize on load
    updateSliderColor();

    submitBtn.addEventListener("click", () => {
        slider.disabled = true;
        submitBtn.disabled = true;

        const error = (Math.abs(ANSWER_CATS - TOTAL * (Number(slider.value) / 100)) / 1000000000).toFixed(2);

        resultBox.hidden = false;
        setTimeout(() => resultBox.classList.add("visible"), 10);

        diffEl.innerHTML = `
            Looks like you were off by about <b>$${error} billion</b>.<br><br>
            <b>What this means:</b> among the <b>top 15 highest-grossing films</b> featuring either a cat or a dog,<br>
            <b style="color:#5457ff;">dog-centered movies</b> collectively earned about 
            <b style="color:#5457ff;">$2.43 billion</b> more than 
            <b style="color:orange;">cat-centered ones</b>!
        `;
    });
})();
