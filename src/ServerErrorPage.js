import React from "react";
import "./ServerErrorPage.css"; // Import the CSS file

const ServerErrorPage = (props) => {
  return props.errorcode === 404 ? (
    <div className="server-error-page">
      <h1>404 Error</h1>
      <p>Data not found</p>
    </div>
  ) : (
    <div className="server-error-page">
      <h1>500 Server Error</h1>
      <p>Sorry, something went wrong on the server.</p>
    </div>
  );
};

export default ServerErrorPage;
