import mongoose from "mongoose";

const connectDB=async()=>{
    await mongoose.connect(process.env.CONNECTION)
    .then(()=> console.log("DB connected successfully"))
    .catch((error)=> console.log("failed to connect DB becuase :",error.message))
}
export default connectDB;