#!/usr/bin/env node
/**
 * Module dependencies.
 */
import debug from 'debug';
import http from 'http';
import app from '../app';
/**
 * Normalize a port into a number, string, or false.
 */
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
};

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3011');
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */



const onError = error => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        alert(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        alert(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  };
  
/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
};
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  console.log(`listening on port ${port} ...... `)});
server.on('error', onError);
server.on('listening', onListening);

let rawPayLoad
let properJson
let regex1 =  /\(.*\)/g;
let regex2 =   /[CDEFGAB]+\#?/g
let found
let initialNote = ''
let counter = 0
let bool = false
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});
io  
  .on("connection", (socket) => {
    console.log("New player")
    socket.emit("welcome", {message:"Bienvenido captura de datos en tiempo real!"})

    socket.on("joinRoom", (id_player) => {
      console.log(id_player)
      socket.join(id_player)
      return socket.emit("success", {message:"Se a unido a su room personal"} )
    })
    socket.on("message", (payload) => {
      console.log(payload)
      properJson = JSON.parse(payload)
      rawPayLoad = properJson.data;
      found = rawPayLoad.match(regex1);
      found = found[0].match(regex2);
      bool = found === null ? false : true;
      if(bool && initialNote === found[0] && found[0] !== 'F' && found[0] !== 'F#' && found[0] !== 'G'){
        counter++
        if(counter === 40){
          console.log('Se mantuvo la nota musical: ')
          console.log(found[0])
          socket.to(properJson.id_player).emit("message", {message: "1"})
          counter = 0
        }
      }
      else{
        initialNote = !bool ? '' : found[0]
      }
      
      //socket.to(payload.id_player).emit("message", payload.data)

    })
    socket.on("leaveRoom", (room) => {
      socket.leave(room)
      return socket.emit("success", "Se ha salido de su room personal")
    })
  })
app.locals.io = io