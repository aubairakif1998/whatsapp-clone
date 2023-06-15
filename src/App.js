import Sidebar from "./Sidebar";
import Chat from "./Chat";
import "./App.css";
import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "./axios";
import LoginPage from "./LoginPage";
import User from "./models/User";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebase";
import { useStateValue } from "./StateProvider";
import { Alert } from "@mui/material";
import ProfileForm from "./ProfileForm";

function App() {
  const [{ user, chattingWithUser, conversationChannelId }, dispatch] =
    useStateValue();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
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

  useEffect(() => {
    if (conversationChannelId) {
      axios
        .get(`/conversations/${conversationChannelId}/messages`)
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.log(error);
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
  }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(
        "Change Occured in Firebase Auth >>> FirebaseUser = ",
        authUser
      );

      if (authUser === null) {
        dispatch({
          type: "SET_USER",
          user: null,
        });
        dispatch({
          type: "SET_CHATTINGWITH_USER",
          chattingWithUser: null,
        });
        setLoading(false);
      } else {
        console.log("Started mongo work");
        const userObj = {
          _id: authUser._delegate.uid,
          uid: authUser._delegate.uid,
          email: authUser.email,
          createdDate: new Date().toUTCString(),
          name: authUser.email.substring(0, 5),
          photoURL: authUser.photoURL ?? "",
          providedData: authUser.providerData,
          conversations: [],
          firstName: "",
          lastName: "",
          phoneNumber: "",
          profileSetupComplete: false,
          messages: [],
        };
        try {
          axios
            .post(`/users/uid/${authUser.uid}`, userObj)
            .then((response) => {
              const user = new User(response.data);
              dispatch({
                type: "SET_USER",
                user: user,
              });
              console.log(user, "App - active user");
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error creating/getting user in MongoDB:", error);
              setLoading(false); // Update loading state even in case of an error
            });
        } catch (error) {
          return alert(error);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

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

  return (
    <Router>
      <div className="">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.profileSetupComplete ? (
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
