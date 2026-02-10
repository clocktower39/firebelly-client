import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { loginJWT } from "../Redux/actions";
import Loading from "./Loading";
import Footer from "./Footer";

export const AuthRoute = (props) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  // Receive context from parent
  const context = useOutletContext();

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
    const viewOnly = localStorage.getItem("JWT_VIEW_ONLY") === "true";

    if (accessToken) {
      if (checkTokenExpiry(accessToken)) {
        if (!user._id) {
          dispatch(loginJWT(accessToken)).then(() => setLoading(false));
        } else {
          setLoading(false);
        }
      } else {
        if (refreshToken && !viewOnly) {
          dispatch(loginJWT())
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    } else {
      setLoading(false);
    }
  }, [dispatch, user._id]);

  return loading ? (
      <Loading />
  ) : user._id ? (
    <Outlet context={context} />
  ) : (
    <Navigate to={{ pathname: "/login" }} />
  );
};

export default AuthRoute;
