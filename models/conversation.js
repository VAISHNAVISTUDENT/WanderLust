const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },

        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    },
    {
        timestamps: true
    }
);

// A conversation should normally have exactly 2 users
conversationSchema.path("participants").validate(function (value) {
    return value.length === 2;
}, "A conversation must have exactly 2 participants.");

module.exports = mongoose.model("Conversation", conversationSchema);