import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Trash2 } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSaveEdit = async () => {
    if (!editingMessage) return;
    if (!editText.trim() && !editingMessage.image) return;

    await editMessage(editingMessage._id, editText.trim());
    setEditingMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (!editingMessage) return;
    if (window.confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(editingMessage._id);
      setEditingMessage(null);
    }
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-1.5">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
              {message.isEdited && !message.isDeleted && (
                <span className="text-xs opacity-60 italic font-normal ml-1">(edited)</span>
              )}
            </div>
            <div
              className={`chat-bubble flex flex-col ${
                message.isDeleted
                  ? "opacity-60 italic text-zinc-400 bg-base-300/40 select-none"
                  : message.senderId === authUser._id
                  ? "cursor-pointer hover:bg-opacity-80 transition-all"
                  : ""
              }`}
              onClick={() => {
                if (message.isDeleted) return;
                if (message.senderId === authUser._id) {
                  setEditingMessage(message);
                  setEditText(message.text || "");
                }
              }}
              title={
                message.isDeleted
                  ? ""
                  : message.senderId === authUser._id
                  ? "Click to edit message"
                  : ""
              }
            >
              {!message.isDeleted && message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <p className="flex items-center gap-1.5">
                  {message.isDeleted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4 opacity-60 inline-block mr-0.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                    </svg>
                  )}
                  {message.text}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />

      {/* Edit Message Modal */}
      {editingMessage && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 border border-base-300 shadow-xl rounded-2xl p-6">
            <h3 className="font-semibold text-lg text-base-content mb-2">Edit Message</h3>
            <p className="text-sm text-zinc-500 mb-4">Update your message below:</p>
            
            <textarea
              className="textarea textarea-bordered w-full h-28 focus:textarea-primary focus:outline-none resize-none text-base-content bg-base-200"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Type your message..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
              }}
            />
            
            <div className="modal-action flex justify-between items-center gap-2 mt-4">
              <button
                className="btn btn-error btn-ghost text-red-500 hover:bg-red-500/10 flex items-center gap-1.5"
                onClick={handleDeleteMessage}
              >
                <Trash2 size={16} />
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost hover:bg-base-200"
                  onClick={() => setEditingMessage(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-6"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() && !editingMessage.image}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={() => setEditingMessage(null)}></div>
        </div>
      )}
    </div>
  );
};
export default ChatContainer;
