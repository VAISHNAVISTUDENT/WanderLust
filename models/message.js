const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },

        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        receiver: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Helps when loading messages for a conversation
messageSchema.index({
    conversation: 1,
    createdAt: 1
});

module.exports = mongoose.model("Message", messageSchema);