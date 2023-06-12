export const initialState = {
  user: null,
  conversationChannelId: null,
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
        conversationChannelId: action.conversationChannelId,
      };
    default:
      return state;
  }
};

export default reducer;
