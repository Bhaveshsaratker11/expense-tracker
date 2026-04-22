import mongoose from "mongoose";
import { error } from "node:console";

const connectdb = async () => {
    await mongoose.connect("mongodb+srv://yt-backend:bhavesh_73@cluster0.0qnc8ne.mongodb.net/tracker")
        .then(() => { console.log("db connected") })
        // .catch(error){console.log(error);}
        
}

export default connectdb;