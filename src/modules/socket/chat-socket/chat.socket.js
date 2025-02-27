import { Server } from "socket.io";
import { authSocket } from "../../../middleWare/authentication.middleware.js";
import { sendMessage } from "./chat.service.js";

let io;

const runIo = (server) => {

    io = new Server(server, { cors: { origin: "*" } });

    io.use(authSocket)
    io.on("connection", async (socket) => {
        console.log(`User connected`)
        socket.on("sendMessage", sendMessage(socket, io))

    });
};
export default runIo;

export const getIo=()=>{
    return io;
}