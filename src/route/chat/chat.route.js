import express from "express";
import { createConversation, sendMessage, getMessages, getConversations, markMessagesAsRead } from "../../controllers/chat.controller";

const router = express.Router();

router.post("/conversations", createConversation);
router.post("/messages", sendMessage);
router.get("/messages/:conversation_id", getMessages);
router.get("/conversations", getConversations);
router.put("/messages/read/:conversation_id", markMessagesAsRead);

export default router;