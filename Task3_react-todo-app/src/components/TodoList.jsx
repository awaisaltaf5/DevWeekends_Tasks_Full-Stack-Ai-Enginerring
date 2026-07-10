function TodoList({ todos, deleteTodo }) {

    return (

        <>

            {todos.length === 0 ? (

                <h3>No Tasks Available</h3>

            ) : (

                <ul>

                    {todos.map((todo) => (

                        <li key={todo.id}>

                            {todo.text}

                            <button
                                onClick={() => deleteTodo(todo.id)}
                            >
                                Delete
                            </button>

                        </li>

                    ))}

                </ul>

            )}

        </>

    );

}

export default TodoList;