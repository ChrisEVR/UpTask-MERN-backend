import express from "express"
import dotenv from 'dotenv'
import cors from 'cors'
import { Server } from "socket.io"
import conectarDB from "./config/db.js"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import proyectoRoutes from "./routes/proyectoRoutes.js"

const app = express()

dotenv.config()

conectarDB()

const whitelist = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOptions))

//Routing
app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)

const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})

// Socket.io

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

io.on('connection', socket => {
    socket.on('abrir proyecto', proyecto => {
        socket.join(proyecto)
    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})