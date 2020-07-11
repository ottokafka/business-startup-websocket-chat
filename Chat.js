const mongoose = require("mongoose");

// ChatSchema Model for chat messages
const ChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "business",
    },
    sender: String, // business or user
    message: String,

    date: {
        type: Date,
        default: Date.now,
    },
});
module.exports = Chat = mongoose.model("chat", ChatSchema);
