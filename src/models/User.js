class User {
  constructor(data) {
    this.uid = data.uid;
    this.email = data.email;
    this.createdDate = new Date(data.createdDate);
    this.name = data.name;
    this.photoURL = data.photoURL;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
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
    this.conversations = data.conversations;
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
}

export default User;
