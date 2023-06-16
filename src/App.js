import Sidebar from "./Sidebar";
import Chat from "./Chat";
import ServerErrorPage from "./ServerErrorPage";
import "./App.css";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "./axios";
import LoginPage from "./LoginPage";
import User from "./models/User";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import { useStateValue } from "./StateProvider";
import ProfileForm from "./ProfileForm";
function App() {
  const [hasServerError, setHasServerError] = useState(false);
  const [{ user, chattingWithUser, conversationChannelId }, dispatch] =
    useStateValue();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (conversationChannelId) {
      axios
        .get(`/conversations/${conversationChannelId}/messages`)
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.log(error);
          setHasServerError(true);
        });
    }
  }, [conversationChannelId]);
  useEffect(() => {
    if (conversationChannelId) {
      var pusher = new Pusher("9be80fad10efd4fded17", {
        cluster: "ap2",
      });
      var channel = pusher.subscribe(conversationChannelId);
      channel.bind("insert", function (data) {
        setMessages((prevMessages) => [...prevMessages, data]);
        console.log(messages);
      });
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [messages, conversationChannelId]);
  useEffect(() => {
    if (user) {
      var pusher = new Pusher("9be80fad10efd4fded17", {
        cluster: "ap2",
      });
      var channel = pusher.subscribe(user.uid);
      channel.bind("insert", function (data) {
        const updatedCurrentUser = new User(data);
        dispatch({
          type: "SET_USER",
          user: updatedCurrentUser,
        });
        console.log("current user updated:", updatedCurrentUser);
      });
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [user]);
  useEffect(() => {
    const subscribeFirebaseAuth = auth.onAuthStateChanged((authUser) => {
      console.log("Firebase Auth >>> FirebaseUser = ", authUser);
      if (authUser !== null) {
        console.log("Logged in userId :", authUser.uid);
        try {
          axios
            .post(`/users/uid/${authUser.uid}`, authUser)
            .then((response) => {
              const user = new User(response.data);
              dispatch({
                type: "SET_USER",
                user: user,
              });
              console.log("App - active user", user);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error creating/getting user in MongoDB:", error);
              setLoading(false); // Update loading state even in case of an error
              setHasServerError(true);
            });
        } catch (error) {
          return alert(error);
        }
      } else {
        dispatch({
          type: "SET_USER",
          user: null,
        });
        dispatch({
          type: "SET_CHATTINGWITH_USER",
          chattingWithUser: null,
        });
        setLoading(false);
      }
    });

    return () => {
      subscribeFirebaseAuth();
    };
  }, [dispatch]);

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
  if (hasServerError) {
    return <ServerErrorPage />;
  }

  return (
    <Router>
      <div className="">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                hasServerError ? (
                  <ServerErrorPage />
                ) : user.profileSetupComplete ? (
                  <>
                    <div className="appheader"></div>
                    <div className="app">
                      <div className="app__body">
                        <Sidebar />
                        {chattingWithUser && conversationChannelId ? (
                          <Chat messages={messages} />
                        ) : (
                          <></>
                        )}
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
