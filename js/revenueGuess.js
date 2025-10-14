(function () {
    const TOTAL = 5430000000;
    const ANSWER_CATS = 1500000000;
    const ANSWER_DOGS = 393000000;

    const slider = document.getElementById("revenue-guess-slider");
    const catsEl = document.getElementById("revenue-guess-cats");
    const dogsEl = document.getElementById("revenue-guess-dogs");
    const submitBtn = document.getElementById("revenue-guess-submit");
    const resultBox = document.getElementById("revenue-guess-result");
    const diffEl = document.getElementById("revenue-guess-diff");

    if (!slider) return;

    function fmtBillions(n) {
        return `$${(n / 1000000000).toFixed(2)}B`;
    }

    function updateReadout() {
        const cats = TOTAL * (Number(slider.value) / 100);
        const dogs = TOTAL - cats;
        catsEl.textContent = fmtBillions(cats);
        dogsEl.textContent = fmtBillions(dogs);
    }

    slider.addEventListener("input", updateReadout);
    updateReadout();

    submitBtn.addEventListener("click", () => {
        slider.disabled = true;
        submitBtn.disabled = true;

        const error = (Math.abs(ANSWER_CATS - TOTAL * (Number(slider.value) / 100)) / 1000000000).toFixed(2);

        resultBox.hidden = false;
        setTimeout(() => resultBox.classList.add("visible"), 10);

        diffEl.textContent = `Looks like you were off by about $${error} billion. But hey, cats and dogs both steal the show!`;
    });
})();
v