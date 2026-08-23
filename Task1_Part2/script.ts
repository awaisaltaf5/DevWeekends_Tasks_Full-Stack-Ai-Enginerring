const quoteBtn = document.getElementById("quoteBtn");
const quoteText = document.getElementById("quote");

// Hoisting Example
showMessage();

function showMessage() {
    console.log("Function Hoisting Demonstrated");
}

// Closure Example
function quoteCounter() {
    let count = 0;

    return function () {
        count++;
        console.log(`Quotes Generated: ${count}`);
    };
}

const countQuotes = quoteCounter();

const quotes = [
    "Success is the sum of small efforts.",
    "Stay hungry, stay foolish.",
    "Code never lies, comments sometimes do.",
    "Learning never exhausts the mind.",
    "Practice makes a developer perfect."
];

// Promise Example
function fetchQuote() {

    return new Promise((resolve, reject) => {

        setTimeout(() => {

            const random =
                quotes[Math.floor(Math.random() * quotes.length)];

            if (random) {
                resolve(random);
            } else {
                reject("No quote found");
            }

        }, 1000);
    });
}

quoteBtn.addEventListener("click", () => {

    quoteText.textContent = "Loading...";

    fetchQuote()
        .then((quote) => {
            quoteText.textContent = quote;
            countQuotes();
        })
        .catch((error) => {
            quoteText.textContent = error;
        });

});