import mongoose from "mongoose";

const connectDb = async () => {
    try {
        if(!process.env.MONGODB_URL){
            console.error("MONGODB_URL is not defined. Please set it in backend/.env");
        }
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("db connected");
    } catch (error) {
        console.error("db error:", error?.message || error);
        // Optional: surface more details in development
        if (process.env.NODE_ENV !== "production") {
            console.error(error);
        }
    }
};

export default connectDb