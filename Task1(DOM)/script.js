// Closure Example
function taskCounter() {
    let count = 0;

    return function () {
        count++;
        document.getElementById("count").textContent = count;
    };
}

const increaseCount = taskCounter();

const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

addBtn.addEventListener("click", function () {

    const task = taskInput.value.trim();

    if (task === "") {
        alert("Please enter a task");
        return;
    }

    const li = document.createElement("li");

    li.innerHTML = `
        ${task}
        <button class="delete">Delete</button>
    `;

    taskList.appendChild(li);

    increaseCount();

    taskInput.value = "";

    li.querySelector(".delete").addEventListener("click", function () {
        li.remove();
    });
});