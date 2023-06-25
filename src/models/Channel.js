import Conversation from "./Conversation";
import User from "./User";

class Channel {
  constructor(data = {}) {
    this.conversation = data.conversation || new Conversation();
    this.users = data.users || [];
  }
}

export default Channel;
