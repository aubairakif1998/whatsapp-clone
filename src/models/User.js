class User {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.createdDate = new Date(data.createdDate);
    this.name = data.name;
    this.photoURL = data.photoURL;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.isOnline = data.isOnline;
    this.lastSeen = data.lastSeen;
    this.phoneNumber = data.phoneNumber;
    this.profileSetupComplete = data.profileSetupComplete;
    this.providedData = data.providedData.map((provider) => ({
      providerId: provider.providerId,
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      photoURL: provider.photoURL,
    }));
    this.conversations = data.conversations.map((conversation) => ({
      conversationId: conversation.conversationId,
      chatWithUserId: conversation.chatWithUserId,
      lastMessage: {
        conversationId: conversation.lastMessage.conversationId,
        content: conversation.lastMessage.content,
        senderId: conversation.lastMessage.senderId,
        receiverId: conversation.lastMessage.receiverId,
        sentAt: new Date(conversation.lastMessage.sentAt),
        seen: conversation.lastMessage.seen,
        received: conversation.lastMessage.received,
        updatedAt: new Date(conversation.lastMessage.updatedAt),
      },
    }));
    this.messages = data.messages;
  }

  getUid() {
    return this.uid;
  }

  getEmail() {
    return this.email;
  }

  getCreatedDate() {
    return this.createdDate;
  }

  getName() {
    return this.name;
  }

  getPhotoURL() {
    return this.photoURL;
  }

  getProvidedData() {
    return this.providedData;
  }

  getConversations() {
    return this.conversations;
  }

  getMessages() {
    return this.messages;
  }
  getLastSeen() {
    return this.lastSeen;
  }

  getIsOnlineStatus() {
    return this.isOnline;
  }
}

export default User;
