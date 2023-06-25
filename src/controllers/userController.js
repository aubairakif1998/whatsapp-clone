import axios from "../axios";
import User from "../models/User";
import * as firebase from "../firebase.js";
export const getUserInfo = async (
  authUser,
  dispatch,
  setLoading,
  setHasServerError
) => {
  try {
    const userObj = new User(authUser);
    const response = await axios.post(
      `/users/getuserinfo/${userObj.uid}`,
      userObj
    );
    const user = new User(response.data);
    return user; // Return the fetched user object
  } catch (error) {
    console.error("Error creating/getting user from MongoDB:", error);
    setLoading(false);
    setHasServerError({ state: true, errorcode: error.response.status });
    return null;
  } finally {
    setLoading(false);
  }
};

export const resetUserStates = async (dispatch, setLoading) => {
  dispatch(
    {
      type: "SET_USER",
      user: null,
    },
    {
      type: "SET_CHATTINGWITH_USER",
      chattingWithUser: null,
    }
  );

  setLoading(false);
};
export const completeUserProfile = async (
  user,
  photoURL,
  setIsLoading,
  phoneNumber,
  firstName,
  lastName
) => {
  try {
    setIsLoading(true);
    const downloadURL = await firebase.uploadPictureFirebase(
      photoURL,
      user,
      "displayPicture"
    );
    console.log(downloadURL);
    await axios
      .put(`/users/update/uid/${user.uid}`, {
        phoneNumber: phoneNumber,
        photoURL: downloadURL,
        firstName: firstName,
        lastName: lastName,
        profileSetupComplete: true,
      })
      .then(async (res) => {
        await axios
          .post(`/userUpdates/${user.uid}/newupdate`, {})
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.log(error);
          });
      });
  } catch (error) {
    console.log("Error updating user in MongoDB:", error);
  }
};
// import { useEffect, useState } from "react";

// import { nanoid } from "nanoid";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000/");
// function App() {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const userName = nanoid(4);
//   const sendChat = (e) => {
//     e.preventDefault();
// socket.emit("chat", { message, userName });
//     console.log("emitted message", message);
//     setMessage("");
//   };
//   useEffect(() => {
//     socket.on("chat", (payload) => {
//       setChat([...chat, payload]);
//     });
//   }, chat);
//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>Chttty</h1>
//         {chat.map((payload, index) => {
//           return (
//             <p key={index}>
//               {payload.message}:{payload.userName}
//             </p>
//           );
//         })}
//         <form onSubmit={sendChat}>
//           <input
//             type="text"
//             name="chat"
//             placeholder="type message to send"
//             value={message}
//             onChange={(e) => {
//               setMessage(e.target.value);
//             }}
//           />
//           <button type="submit"> Send</button>
//         </form>
//       </header>
//     </div>
//   );
// }

// export default App;
// const connection_url =
//   "mongodb+srv://admin:1234567890@cluster0.fo6njqa.mongodb.net/whatsappdb?retryWrites=true&w=majority";
// mongoose
//   .connect(connection_url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {})
//   .catch((err) => {});
// const db = mongoose.connection;
// db.once("open", () => {
//   console.log("DB connected - Mongo.. - FrontEnd Side");
//   const changeStreamUsers = db
//     .collection("users")
//     .watch([{ $match: { "documentKey._id": user.uid } }]);
//   changeStreamUsers.on("change", (change) => {
//     console.log("change", change);
//   });
// });
