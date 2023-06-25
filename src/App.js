import "./App.css";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import ServerErrorPage from "./ServerErrorPage";
import Pusher from "pusher-js";
import axios from "./axios";
import LoginPage from "./LoginPage";
import { useEffect, useState } from "react";
import User from "./models/User";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { useStateValue } from "./StateProvider";
import ProfileForm from "./ProfileForm";
import { getUserInfo, resetUserStates } from "./controllers/userController";
function App() {
  const [hasServerError, setHasServerError] = useState({
    state: false,
    errorcode: 201,
  });
  const [{ user, selectedChannel }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (selectedChannel) {
      axios
        .get(
          `/conversations/${selectedChannel.conversation.conversationId}/messages`
        )
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.log(error);
          setHasServerError({ state: true, errorcode: 500 });
        });
    }
  }, [selectedChannel]);
  useEffect(() => {
    if (selectedChannel) {
      var pusher = new Pusher("b623a3c3694d8f48b21c", {
        cluster: "ap2",
      });
      var channel = pusher.subscribe(
        selectedChannel.conversation.conversationId
      );
      channel.bind("insert", function (data) {
        setMessages((prevMessages) => [...prevMessages, data]);
        console.log("Data", messages);
      });
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [messages, selectedChannel]);
  useEffect(() => {
    const handleAuthStateChanged = async (authUser) => {
      console.log("Firebase Auth >>> FirebaseUser =", authUser);
      if (authUser !== null) {
        const currentUser = await getUserInfo(
          authUser,
          dispatch,
          setLoading,
          setHasServerError
        );
        dispatch({
          type: "SET_USER",
          user: currentUser,
        });
      } else {
        await resetUserStates(dispatch, setLoading);
      }
    };
    const unsubscribe = auth.onAuthStateChanged(handleAuthStateChanged);
    setSocketException(false);

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  useEffect(() => {
    console.log("App updated current User", user);
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-wrapper">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  if (hasServerError.state) {
    return <ServerErrorPage errorcode={hasServerError.errorcode} />;
  }

  return (
    <Router>
      <div className="">
        <Routes>
          <Route
            path="/"
            element={
              user !== null ? (
                hasServerError.state ? (
                  <ServerErrorPage errorcode={hasServerError.errorcode} />
                ) : user.profileSetupComplete ? (
                  <>
                    <div className="appheader"></div>
                    <div className="app">
                      <div className="app__body">
                        <Sidebar />
                        {selectedChannel ? <Chat messages={messages} /> : <></>}
                      </div>
                    </div>
                  </>
                ) : (
                  <ProfileForm />
                )
              ) : (
                <LoginPage />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

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
//     socket.emit("chat", { message, userName });
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
