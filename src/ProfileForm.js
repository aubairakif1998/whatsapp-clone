import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileForm.css";
import * as userController from "./controllers/userController.js";
import { useStateValue } from "./StateProvider";
import User from "./models/User";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
const ProfileForm = (props) => {
  const navigate = useNavigate();
  const [{ user }, dispatch] = useStateValue();
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userController
        .completeUserProfile(
          user,
          photoURL,
          setIsLoading,
          phoneNumber,
          firstName,
          ""
        )
        .then((res) => {
          window.location.reload(false);
        });
    } catch (error) {
      console.log("Error updating ", error);
    } finally {
      setIsLoading(false);
      navigate("/");
    }
  };

  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
  };

  const handlePhotoURLChange = (e) => {
    const file = e.target.files[0];
    setPhotoURL(file);
  };

  useEffect(() => {
    document.body.classList.add("form-loaded");

    return () => {
      document.body.classList.remove("form-loaded");
    };
  }, []);
  return (
    <div className="background-container">
      <div className="container">
        <h1>Profile setup</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstname">Username:</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phonenumber">Phone Number:</label>
            <PhoneInput
              id="phonenumber"
              name="phonenumber"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="photoURL">Profile Photo:</label>
            <input
              type="file"
              id="photoURL"
              name="photoURL"
              accept="image/*"
              onChange={handlePhotoURLChange}
            />
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
