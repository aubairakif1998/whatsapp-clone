export const initialState = {
  user: null,
  selectedChannel: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        user: action.user,
      };
    case "SET_CHANNEL":
      return {
        ...state,
        selectedChannel: action.selectedChannel,
      };
    // case "SET_CHATTINGWITH_USER":
    //   return {
    //     ...state,
    //     chattingWithUser: action.chattingWithUser,
    //   };
    // case "SET_CONVERSATION_CHANNEL_LIST_USER":
    //   return {
    //     ...state,
    //     listOfConversations: action.listOfConversations,
    //   };
    default:
      return state;
  }
};

export default reducer;
