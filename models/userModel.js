
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        require: true

    }
});

const userModel = mongoose.model("user",userSchema);
export default userModel;