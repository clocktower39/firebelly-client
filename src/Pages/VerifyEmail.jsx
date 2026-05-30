// Pages/VerifyEmail.js

import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiFetch } from "../api/client";
import { loginJWT } from "../Redux/actions";

function VerifyEmail() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [statusMessage, setStatusMessage] = useState("Verifying your email...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (token && email) {
      apiFetch(`/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
        auth: false,
      })
        .then((data) => {
          setStatusMessage(data.message || "Email verified successfully!");
          if (data.accessToken) {
            dispatch(loginJWT(data.accessToken));
          }
        })
        .catch(() => {
          setErrorMessage("Failed to verify email. Please try again.");
        });
    } else {
      setErrorMessage("Invalid verification link.");
    }
  }, [dispatch, token, email]);

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
