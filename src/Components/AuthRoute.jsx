import React, { useState, useEffect } from "react";
import { getAccessToken, requestAccessTokenFromOpenTab } from "../api/client";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { loginJWT } from "../Redux/actions";
import Loading from "./Loading";

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
    let active = true;
    const viewOnly = localStorage.getItem("JWT_VIEW_ONLY") === "true";
    const delegatedSession = Boolean(localStorage.getItem("JWT_DELEGATED_SESSION"));

    const finishLoading = () => {
      if (active) setLoading(false);
    };

    const resumeSession = async () => {
      const hydrateAccessToken = async (accessToken) => {
        if (!accessToken || !checkTokenExpiry(accessToken)) return false;
        if (!user._id) {
          await dispatch(loginJWT(accessToken));
        }
        return true;
      };

      if (await hydrateAccessToken(getAccessToken())) {
        finishLoading();
        return;
      }

      if (await hydrateAccessToken(await requestAccessTokenFromOpenTab())) {
        finishLoading();
        return;
      }

      if (!viewOnly && !delegatedSession) {
        await dispatch(loginJWT(undefined, { clearOnFailure: Boolean(user._id) }));
      }
      finishLoading();
    };

    resumeSession().catch(finishLoading);

    return () => {
      active = false;
    };
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
