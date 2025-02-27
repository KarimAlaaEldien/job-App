import Chat from "../../../DB/model/chat.model.js";
import User from "../../../DB/model/user.model.js";
import { jobRole } from "../../../utils/enum/enum.values.js";


export const sendMessage = function (socket, io) {
    return async (userId, content) => {
        const userExist = await User.findById(userId);
        if (!userExist) {
            socket.emit("error", { message: "User not found...!" })
            return
        };

        const chatExist = await Chat.findOne({
            $or: [
                { senderId: req.user._id, receiverId: userId },
                { senderId: userId, receiverId: req.user._id }
            ]
        });

        let message={
            message:content,
            senderId:socket.user._id
        };
        
        if (!chatExist) {
            if (socket.user.jobRole == jobRole.HR || socket.user.jobRole == jobRole.companyOwner) {
                let chat = new Chat({
                    senderId: socket.user._id,
                    receiverId: userId,
                    messages: [message]
                });

                await chat.save();

                io.to(userId).emit("message", {
                    sender: socket.user._id,
                    message: content,
                    timestamp: new Date().toISOString()
                });
            }else{
                socket.emit("error", { message: "only HR or company owner can kick off this conversation." })
            }
        }else{

            chatExist.messages.push(message);
            await chatExist.save();

            io.to(userId).emit("message", {
                sender: socket.user._id,
                message: content,
                timestamp: new Date().toISOString()
            });
        }
    }
};