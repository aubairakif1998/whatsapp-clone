class Conversation {
  constructor(data = {}) {
    this.participants = data.participants || [];
    this.conversationId = data.conversationId || "";
    this.channelName = data.channelName || "";
    this.messages = data.messages || [
      {
        content: "",
        senderId: "",
        receiverId: "",
        mediaURL: "",
        isMediaAttached: false,
        sentAt: new Date(),
        seen: false,
        received: false,
        updatedAt: new Date(),
      },
    ];
    this.lastMessage = data.lastMessage || {
      content: "",
      senderId: "",
      receiverId: "",
      sentAt: new Date(),
      mediaURL: "",
      isMediaAttached: false,
      seen: false,
      received: false,
      updatedAt: new Date(),
    };
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }
}

export default Conversation;
