import { useState } from "react";

function TodoForm({ addTodo }) {

    const [task, setTask] = useState("");

    function handleSubmit(e) {

        e.preventDefault();

        if (task.trim() === "") return;

        addTodo(task);

        setTask("");
    }

    return (

        <form onSubmit={handleSubmit}>

            <input
                type="text"
                placeholder="Enter Task"
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />

            <button>Add</button>

        </form>

    );

}

export default TodoForm;