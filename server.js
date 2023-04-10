import express from "express";
import cors from "cors"
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { createServer } from "http";

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
let todoList = [
  { id: '1', name: 'Shopping' },
  { id: '2', name: 'Go out with a dog' },
  { id: '3', name: 'Make dinner' }
]

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'client/build')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'))
})

const server = createServer(app)
const io = new Server(server, {
  allowEIO3: true,
  cors: {
    origin: "http://localhost:3000"
  }
})

io.on('connection', socket => {
  console.log(`New client: ${socket.id}`)
  io.to(socket.id).emit('updateData', todoList)

  socket.on('addTask', (todo) => {
    todoList.push(todo)
    socket.broadcast.emit('addTask', todo)
  })

  socket.on('removeTask', (todo) => {
    todoList = todoList.filter(task => task.id !== todo.id)
    socket.broadcast.emit('removeTask', todo)
    // socket.broadcast.emit('updateData', todoList)
  })
  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} is disconnect :(`)
  })
})

server.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on port: 8000`)
})