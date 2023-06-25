class User {
  constructor(data = {}) {
    this._id = data._id || data.uid;
    this.uid = data.uid || ""; // string
    this.email = data.email || ""; // string
    this.createdDate = data.createdDate
      ? new Date(data.createdDate)
      : new Date(); // Date object
    this.name = data.name || ""; // string
    this.photoURL = data.photoURL || ""; // string
    this.firstName = data.firstName || ""; // string
    this.lastName = data.lastName || ""; // string
    this.isOnline = data.isOnline || true; // boolean
    this.lastSeen = data.lastSeen || new Date(); // string (assuming it represents a timestamp)
    this.phoneNumber = data.phoneNumber || ""; // string
    this.profileSetupComplete = data.profileSetupComplete || false; // boolean
    this.providedData = (data.providedData || []).map((provider) => ({
      providerId: provider.providerId || "", // string
      uid: provider.uid || "", // string
      displayName: provider.displayName || "", // string
      email: provider.email || "", // string
      phoneNumber: provider.phoneNumber || "", // string
      photoURL: provider.photoURL || "", // string
    }));
    this.conversations = (data.conversations || []).map((conversation) => ({
      conversationId: conversation.conversationId || "", // string
    }));
  }

  // Getters

  getUid() {
    return this.uid; // string
  }

  getEmail() {
    return this.email; // string
  }

  getCreatedDate() {
    return this.createdDate; // Date object
  }

  getName() {
    return this.name; // string
  }

  getPhotoURL() {
    return this.photoURL; // string
  }

  getProvidedData() {
    return this.providedData; // array of objects
  }

  getConversations() {
    return this.conversations; // array of objects
  }

  getLastSeen() {
    return this.lastSeen; // string
  }

  getIsOnlineStatus() {
    return this.isOnline; // boolean
  }

  printAttributes() {
    const userJson = {
      uid: this.uid,
      email: this.email,
      createdDate: this.createdDate,
      name: this.name,
      photoURL: this.photoURL,
      firstName: this.firstName,
      lastName: this.lastName,
      isOnline: this.isOnline,
      lastSeen: this.lastSeen,
      phoneNumber: this.phoneNumber,
      profileSetupComplete: this.profileSetupComplete,
      providedData: this.providedData,
      conversations: this.conversations,
      messages: this.messages,
    };
    console.log("printting end");

    console.log(JSON.stringify(userJson, null, 2));
  }
}

export default User;
