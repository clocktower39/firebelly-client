import React, { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarGroup, Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { serverURL } from "../Redux/actions";

const getProfilePictureUrl = (profilePicture) =>
  profilePicture ? `${serverURL}/user/profilePicture/${profilePicture}` : undefined;

const getDisplayName = (user) =>
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Someone";

const getTrainerActorFromStorage = () => {
  const trainerAccess = localStorage.getItem("JWT_TRAINER_AUTH_TOKEN");
  if (!trainerAccess) return null;

  try {
    return jwtDecode(trainerAccess);
  } catch (error) {
    return null;
  }
};

const buildPresenceUser = (user) => {
  if (!user?._id) return null;

  if (user.delegationMode === "trainer_client") {
    const trainer = getTrainerActorFromStorage();
    if (trainer?._id) {
      return {
        userId: trainer._id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        profilePicture: trainer.profilePicture,
        role: "trainer",
        delegationMode: user.delegationMode,
      };
    }
  }

  return {
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture,
    role: user.isTrainer ? "trainer" : "client",
    delegationMode: user.delegationMode || null,
  };
};

export default function PagePresenceAvatars({ socket }) {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [presentUsers, setPresentUsers] = useState([]);

  const pageKey = useMemo(
    () => `${location.pathname}${location.search || ""}`,
    [location.pathname, location.search]
  );
  const presenceUser = useMemo(() => buildPresenceUser(user), [user]);

  useEffect(() => {
    if (!socket || !presenceUser?.userId || !pageKey) {
      setPresentUsers([]);
      return undefined;
    }

    const handlePagePresence = (payload) => {
      if (payload?.pageKey !== pageKey) return;
      setPresentUsers(Array.isArray(payload.users) ? payload.users : []);
    };

    socket.on("pagePresence", handlePagePresence);
    socket.emit("joinPagePresence", { pageKey, user: presenceUser });

    return () => {
      socket.emit("leavePagePresence", { pageKey });
      socket.off("pagePresence", handlePagePresence);
    };
  }, [pageKey, presenceUser, socket]);

  const otherUsers = useMemo(() => {
    if (!presenceUser?.userId) return [];

    const seen = new Set();
    return presentUsers.filter((presentUser) => {
      if (!presentUser?.userId) return false;
      if (presentUser.socketId === socket?.id) return false;
      if (String(presentUser.userId) === String(presenceUser.userId)) return false;
      if (seen.has(presentUser.userId)) return false;
      seen.add(presentUser.userId);
      return true;
    });
  }, [presenceUser?.userId, presentUsers, socket?.id]);

  if (!otherUsers.length) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 12, sm: 20 },
        bottom: { xs: 92, sm: 24 },
        zIndex: (theme) => theme.zIndex.modal + 5,
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.75,
        borderRadius: "999px",
        bgcolor: "rgba(15, 23, 42, 0.86)",
        color: "common.white",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.28)",
        backdropFilter: "blur(10px)",
        pointerEvents: "auto",
      }}
    >
      <Typography variant="caption" sx={{ display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}>
        Also here
      </Typography>
      <AvatarGroup
        max={4}
        sx={{
          "& .MuiAvatar-root": {
            width: 34,
            height: 34,
            borderColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.7)",
            fontSize: 14,
          },
        }}
      >
        {otherUsers.map((presentUser) => (
          <Avatar
            key={presentUser.userId}
            alt={getDisplayName(presentUser)}
            title={`${getDisplayName(presentUser)} is on this page`}
            src={getProfilePictureUrl(presentUser.profilePicture)}
          >
            {getDisplayName(presentUser).charAt(0)}
          </Avatar>
        ))}
      </AvatarGroup>
    </Box>
  );
}
