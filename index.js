import express from "express";
import bootStrap from "./src/app.controller.js";
import runIo from "./src/modules/socket/chat-socket/chat.socket.js";



const app=express();
await bootStrap(app,express);
const port=process.env.PORT||3000
const server=app.listen(port,()=>{
    console.log(`server is running on port: ${process.env.PORT}`);
});
runIo(server)