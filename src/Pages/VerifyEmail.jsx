// Pages/VerifyEmail.js

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../Redux/actions"; // Adjust the import based on your project structure

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [statusMessage, setStatusMessage] = useState("Verifying your email...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (token && email) {
      axios
        .get(`${serverURL}/verify-email`, {
          params: { token, email },
        })
        .then((response) => {
          setStatusMessage(response.data.message || "Email verified successfully!");
          // Optionally redirect the user after verification
          // setTimeout(() => {
          //   navigate("/login");
          // }, 3000);
        })
        .catch((error) => {
          setErrorMessage(
            error.response?.data?.error || "Failed to verify email. Please try again."
          );
        });
    } else {
      setErrorMessage("Invalid verification link.");
    }
  }, [token, email]);

  return (
    <div className="verification-container">
      {errorMessage ? (
        <div className="error-message">{errorMessage}</div>
      ) : (
        <div className="status-message">{statusMessage}</div>
      )}
    </div>
  );
}

export default VerifyEmail;
