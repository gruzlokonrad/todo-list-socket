import React, { useEffect, useState } from 'react';
import { socket } from './socket';
import { nanoid } from 'nanoid'

interface ITodo {
  id: string,
  name: string
}

function App() {
  const [todoList, setTodoList] = useState<ITodo[]>([])
  const [todoName, setTodoName] = useState<string>('')

  // const onConnect = () => console.log("Connected to server!")
  // const onDisconnect = () => {}
  const updateTodoList: (list: { id: string, name: string }[]) => void = (list) => setTodoList(list)
  const addTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (todoName) {
      const newTodo = { id: nanoid(), name: todoName };
      setTodoList(todoList => [...todoList, newTodo])
      socket.emit('addTask', newTodo)
    } else {
      alert('Fill in todo name')
    }
    setTodoName('')
  }
  const removeTask = (todo: ITodo) => {
    if (todoList.find(task => task.id === todo.id)) {
      setTodoList(todoList => [...todoList.filter(task => task.id !== todo.id)])
      socket.emit('removeTask', todo)
    }
  }
  const addTodoSocket = (todo: ITodo) => setTodoList(todoList => [...todoList, todo])
  const removeTodoSocket = (todo: ITodo) => setTodoList(todoList => [...todoList.filter(todoElement => todoElement.id !== todo.id)])

  useEffect(() => {
    // socket.on('connect', onConnect)
    socket.open()
    socket.on('updateData', updateTodoList)
    socket.on('addTask', addTodoSocket)
    socket.on('removeTask', removeTodoSocket)
    // socket.on('disconnect', onDisconnect);

    return () => {
      // socket.off('connect', onConnect)
      socket.off('updateData', updateTodoList)
      socket.off('addTask', addTodoSocket)
      socket.off('removeTask', removeTodoSocket)
      // socket.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <div className="App">

      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {todoList.map((todo, index) => (
            <li className="task" key={index}>
              {todo.name}
              <button
                className="btn btn--red"
                onClick={() => removeTask(todo)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={addTodo}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            name='nameTodo'
            value={todoName}
            onChange={e => setTodoName(e.currentTarget.value)}
          />
          <button className="btn" type="submit">Add</button>
        </form>

      </section>
    </div>
  );
}

export default App;
