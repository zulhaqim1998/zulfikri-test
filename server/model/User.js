import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    username: String,
    files: [{
        filename: String,
        date: {
            type: Date,
            default: new Date()
        }
    }]
});

const User = mongoose.model("User", fileSchema);
export default User;
