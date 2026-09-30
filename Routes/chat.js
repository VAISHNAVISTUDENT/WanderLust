const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

const chatController = require("../controllers/chat.js");


// All chat functionality requires login
router.use(isLoggedIn);


// ==========================================
// ALL CONVERSATIONS
// ==========================================

router.get(
    "/",
    wrapAsync(chatController.index)
);


// ==========================================
// START / GET CONVERSATION FOR A LISTING
// ==========================================

router.get(
    "/listing/:listingId",
    wrapAsync(chatController.startConversation)
);


// ==========================================
// OPEN CONVERSATION
// ==========================================

router.get(
    "/:conversationId",
    wrapAsync(chatController.showChat)
);


// ==========================================
// SEND MESSAGE
// ==========================================

router.post(
    "/:conversationId/message",
    wrapAsync(chatController.sendMessage)
);


// ==========================================
// MARK MESSAGES AS READ
// ==========================================

router.put(
    "/:conversationId/read",
    wrapAsync(chatController.markAsRead)
);


module.exports = router;