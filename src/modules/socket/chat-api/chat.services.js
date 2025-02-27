import Chat from "../../../DB/model/chat.model.js";



export const getChat = async (req, res,next) => {
    const { userId } = req.params;
    const chat = await Chat.findOne({
        $or: [
            { senderId: req.user._id, receiverId: userId },
            { senderId: userId, receiverId: req.user._id }
        ]
    }).populate([
        {path:"senderId"},
        {path:"message.senderId"}
    ]);
    if(!chat)return next(new Error("chat not found", { cause: 404 }));
    return res.status(200).json({success:true,chat})
}