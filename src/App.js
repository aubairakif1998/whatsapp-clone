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

function App() {
  // User state
  const [{ user }, dispatch] = useStateValue();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  // useEffect(() => {
  //   axios
  //     .get("/messages/sync")
  //     .then((response) => {
  //       setMessages(response.data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }, []);

  // useEffect(() => {
  //   var pusher = new Pusher("9be80fad10efd4fded17", {
  //     cluster: "ap2",
  //   });
  //   var channel = pusher.subscribe("messages");
  //   channel.bind("insert", function (data) {
  //     setMessages((prevMessages) => [...prevMessages, data]);
  //     console.log(messages);
  //   });
  //   return () => {
  //     channel.unbind_all();
  //     channel.unsubscribe();
  //   };
  // }, [messages]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      console.log(
        "Change Occured in Firebase Auth >>> FirebaseUser = ",
        authUser
      );
      dispatch({
        type: "SET_USER",
        user: null,
      });
      if (authUser === null) {
        setLoading(false);
      } else {
        axios
          .post(`/users/uid/${authUser.uid}`)
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
            console.log(error.response.status);
            if (error.response.status === 404) {
              const userObj = {
                _id: authUser._delegate.uid,
                uid: authUser._delegate.uid,
                email: authUser.email,
                createdDate: new Date().toUTCString(),
                name: authUser.email.substring(0, 5),
                photoURL: authUser.photoURL ?? "",
                providedData: authUser.providerData,
                conversations: [],
                messages: [],
              };
              axios
                .post("/users/new", userObj)
                .then((response) => {
                  dispatch({
                    type: "SET_USER",
                    user: userObj,
                  });
                  console.log("User created in MongoDB successfully:");
                  console.log(user, "App - active user");
                  setLoading(false);
                })
                .catch((error) => {
                  console.error("Error creating user in MongoDB:", error);
                });
            } else {
              alert(
                "Reload the page please. There is some network problem happened."
              );
            }
          });
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
                <>
                  <div className="appheader"></div>
                  <div className="app">
                    <div className="app__body">
                      <Sidebar />
                      <Chat messages={messages} />
                    </div>
                  </div>
                </>
              ) : (
                <LoginPage />
              )
            }
          />
          {/* <Route path="/login" element={<LoginPage />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
