const Conversation = require("../models/conversation.js");
const Message = require("../models/message.js");
const Listing = require("../models/listing.js");


// ==========================================
// CREATE / GET CONVERSATION
// ==========================================

module.exports.startConversation = async (req, res) => {

    const { listingId } = req.params;

    const listing =
        await Listing.findById(listingId)
            .populate("owner");


    if (!listing) {

        req.flash(
            "error",
            "Listing does not exist"
        );

        return res.redirect("/listings");

    }


    if (!listing.owner) {

        req.flash(
            "error",
            "This listing has no owner"
        );

        return res.redirect(
            `/listings/${listingId}`
        );

    }


    if (
        listing.owner._id.equals(
            req.user._id
        )
    ) {

        req.flash(
            "error",
            "You cannot start a chat with yourself"
        );

        return res.redirect(
            `/listings/${listingId}`
        );

    }


    const ownerId =
        listing.owner._id;

    const userId =
        req.user._id;


    let conversation =
        await Conversation.findOne({

            listing: listingId,

            participants: {
                $all: [
                    userId,
                    ownerId
                ]
            }

        });


    if (!conversation) {

        conversation =
            await Conversation.create({

                participants: [
                    userId,
                    ownerId
                ],

                listing: listingId

            });

    }


    res.redirect(
        `/chat/${conversation._id}`
    );

};


// ==========================================
// CHAT PAGE
// ==========================================

module.exports.showChat = async (req, res) => {

    const { conversationId } =
        req.params;


    const conversation =
        await Conversation.findById(
            conversationId
        )
        .populate("participants")
        .populate("listing")
        .populate("lastMessage");


    if (!conversation) {

        req.flash(
            "error",
            "Conversation does not exist"
        );

        return res.redirect("/chat");

    }


    const isParticipant =
        conversation.participants.some(
            user =>
                user._id.equals(
                    req.user._id
                )
        );


    if (!isParticipant) {

        req.flash(
            "error",
            "You are not allowed to access this conversation"
        );

        return res.redirect("/chat");

    }


    const messages =
        await Message.find({
            conversation: conversationId
        })
        .populate("sender")
        .populate("receiver")
        .sort({
            createdAt: 1
        });


    await Message.updateMany(

        {
            conversation: conversationId,

            receiver: req.user._id,

            read: false
        },

        {
            $set: {
                read: true
            }
        }

    );


    res.render(
        "chat/show.ejs",
        {
            conversation,
            messages
        }
    );

};


// ==========================================
// SEND MESSAGE
// ==========================================

module.exports.sendMessage = async (req, res) => {

    const { conversationId } =
        req.params;

    const { content } =
        req.body;


    // Validate message

    if (
        !content ||
        !content.trim()
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Message cannot be empty"

        });

    }


    // Find conversation

    const conversation =
        await Conversation.findById(
            conversationId
        );


    if (!conversation) {

        return res.status(404).json({

            success: false,

            message:
                "Conversation does not exist"

        });

    }


    // Check participant

    const isParticipant =
        conversation.participants.some(
            id =>
                id.equals(
                    req.user._id
                )
        );


    if (!isParticipant) {

        return res.status(403).json({

            success: false,

            message:
                "You are not a participant in this conversation"

        });

    }


    // Find receiver

    const receiver =
        conversation.participants.find(
            id =>
                !id.equals(
                    req.user._id
                )
        );


    if (!receiver) {

        return res.status(400).json({

            success: false,

            message:
                "Receiver not found"

        });

    }


    // Save message

    const message =
        await Message.create({

            conversation:
                conversationId,

            sender:
                req.user._id,

            receiver,

            content:
                content.trim()

        });


    // Update conversation

    conversation.lastMessage =
        message._id;

    conversation.updatedAt =
        new Date();

    await conversation.save();


    // Populate sender and receiver

    const populatedMessage =
        await Message.findById(
            message._id
        )
        .populate("sender")
        .populate("receiver");


    // ==========================================
    // REAL-TIME SOCKET.IO EMISSION
    // ==========================================

    const io =
        req.app.get("io");


    io.to(
        `conversation:${conversationId}`
    ).emit(
        "newMessage",
        populatedMessage
    );


    // ==========================================
    // RESPONSE TO SENDER
    // ==========================================

    res.status(201).json({

        success: true,

        message:
            populatedMessage

    });

};


// ==========================================
// ALL CONVERSATIONS
// ==========================================

module.exports.index = async (req, res) => {

    const conversations =
        await Conversation.find({

            participants:
                req.user._id

        })
        .populate("participants")
        .populate("listing")
        .populate("lastMessage")
        .sort({
            updatedAt: -1
        });


    res.render(
        "chat/index.ejs",
        {
            conversations
        }
    );

};


// ==========================================
// MARK CONVERSATION AS READ
// ==========================================

module.exports.markAsRead = async (req, res) => {

    const { conversationId } =
        req.params;


    const conversation =
        await Conversation.findById(
            conversationId
        );


    if (!conversation) {

        return res.status(404).json({

            success: false,

            message:
                "Conversation does not exist"

        });

    }


    const isParticipant =
        conversation.participants.some(
            id =>
                id.equals(
                    req.user._id
                )
        );


    if (!isParticipant) {

        return res.status(403).json({

            success: false,

            message:
                "Not authorized"

        });

    }


    await Message.updateMany(

        {
            conversation: conversationId,

            receiver:
                req.user._id,

            read: false

        },

        {
            $set: {
                read: true
            }
        }

    );


    res.json({

        success: true

    });

};