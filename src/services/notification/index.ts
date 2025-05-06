import { Server } from "socket.io";
import { server } from "../..";

const io = new Server(server);

io.on("connection", socket => {
    console.log("Naay ning connect");
});