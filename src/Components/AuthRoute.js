import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Import jwtDecode library
import { loginJWT } from "../Redux/actions";
import Loading from "./Loading";

export const AuthRoute = (props) => {
  const { socket } = props;

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  const checkTokenExpiry = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Get current time in seconds
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("JWT_AUTH_TOKEN");
    const refreshToken = localStorage.getItem("JWT_REFRESH_TOKEN");

    if (accessToken && refreshToken) {
      if (checkTokenExpiry(accessToken)) {
        if (!user._id) {
          dispatch(loginJWT(accessToken)).then(()=> setLoading(false));
        } else {
            setLoading(false);
        }
      } else {
        // Try to refresh the access token
        dispatch(loginJWT(refreshToken))
          .then(() => setLoading(false))
          .catch(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [dispatch, user._id]);

  return loading ? (
    <Loading />
  ) : user.email ? (
    <Outlet socket={socket} />
  ) : (
    <Navigate to={{ pathname: "/login" }} />
  );
};

export default AuthRoute;
