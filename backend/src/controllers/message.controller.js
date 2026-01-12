import prisma from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;
    
    // Get all users except the logged in user
    const filteredUsers = await prisma.user.findMany({
      where: {
        id: { not: loggedInUserId },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get unread counts and last message for each user
    const usersWithDetails = await Promise.all(
      filteredUsers.map(async (user) => {
        // Count unread messages from this user
        const unreadCount = await prisma.message.count({
          where: {
            senderId: user.id,
            receiverId: loggedInUserId,
            read: false,
          },
        });

        // Get last message between logged in user and this user
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: loggedInUserId, receiverId: user.id },
              { senderId: user.id, receiverId: loggedInUserId },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          _id: user.id,
          email: user.email,
          fullName: user.fullName,
          profilePic: user.profilePic,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          unreadCount,
          lastMessageTime: lastMessage?.createdAt || null,
        };
      })
    );

    // Sort by last message time (most recent first)
    usersWithDetails.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.status(200).json(usersWithDetails);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Map to match frontend expected format
    const formattedMessages = messages.map((msg) => ({
      _id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      image: msg.image,
      read: msg.read,
      createdAt: msg.createdAt,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: imageUrl,
      },
    });

    // Format response to match frontend expected format
    const formattedMessage = {
      _id: newMessage.id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      text: newMessage.text,
      image: newMessage.image,
      read: newMessage.read,
      createdAt: newMessage.createdAt,
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", formattedMessage);
    }

    res.status(201).json(formattedMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user.id;

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user.id;

    // Find the message first
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow the sender to delete their own message
    if (message.senderId !== userId) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    // Notify the receiver via socket that message was deleted
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
