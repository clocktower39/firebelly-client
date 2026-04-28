import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarGroup, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { serverURL } from "../Redux/actions";

const getProfilePictureUrl = (profilePicture) =>
  profilePicture ? `${serverURL}/user/profilePicture/${profilePicture}` : undefined;

const getDisplayName = (user) =>
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Someone";

const POSITION_STORAGE_KEY = "pagePresenceAvatars.position";
const SCREEN_MARGIN = 10;

const readStoredPosition = () => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!stored) return null;
    const position = JSON.parse(stored);
    if (Number.isFinite(position?.x) && Number.isFinite(position?.y)) {
      return position;
    }
  } catch (error) {
    return null;
  }

  return null;
};

const saveStoredPosition = (position) => {
  if (typeof window === "undefined" || !position) return;
  window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
  const [position, setPosition] = useState(readStoredPosition);
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef(null);
  const dragRef = useRef(null);
  const positionRef = useRef(position);

  const pageKey = useMemo(
    () => `${location.pathname}${location.search || ""}`,
    [location.pathname, location.search]
  );
  const presenceUser = useMemo(() => buildPresenceUser(user), [user]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const getConstrainedPosition = useCallback((nextPosition) => {
    if (typeof window === "undefined") return nextPosition;

    const rect = widgetRef.current?.getBoundingClientRect();
    const widgetWidth = rect?.width || 72;
    const widgetHeight = rect?.height || 72;
    const maxX = Math.max(SCREEN_MARGIN, window.innerWidth - widgetWidth - SCREEN_MARGIN);
    const maxY = Math.max(SCREEN_MARGIN, window.innerHeight - widgetHeight - SCREEN_MARGIN);

    return {
      x: clamp(nextPosition.x, SCREEN_MARGIN, maxX),
      y: clamp(nextPosition.y, SCREEN_MARGIN, maxY),
    };
  }, []);

  useEffect(() => {
    if (!presentUsers.length || typeof window === "undefined") return undefined;

    const handleResize = () => {
      setPosition((currentPosition) => {
        if (!currentPosition) return currentPosition;
        const constrained = getConstrainedPosition(currentPosition);
        positionRef.current = constrained;
        saveStoredPosition(constrained);
        return constrained;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getConstrainedPosition, presentUsers.length]);

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

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = widgetRef.current?.getBoundingClientRect();
    const currentPosition = positionRef.current || {
      x: rect?.left || window.innerWidth - 82,
      y: rect?.top || window.innerHeight - 112,
    };

    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - currentPosition.x,
      offsetY: event.clientY - currentPosition.y,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    const dragState = dragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const nextPosition = getConstrainedPosition({
      x: event.clientX - dragState.offsetX,
      y: event.clientY - dragState.offsetY,
    });
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const handlePointerUp = (event) => {
    const dragState = dragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
    setIsDragging(false);
    saveStoredPosition(positionRef.current);
  };

  const isStacked = otherUsers.length > 1;

  return (
    <Box
      ref={widgetRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      sx={{
        position: "fixed",
        left: position ? `${position.x}px` : "auto",
        top: position ? `${position.y}px` : "auto",
        right: position ? "auto" : { xs: 12, sm: 20 },
        bottom: position ? "auto" : { xs: 92, sm: 24 },
        zIndex: (theme) => theme.zIndex.modal + 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: isStacked ? "auto" : 62,
        height: 62,
        minWidth: isStacked ? 70 : 62,
        px: isStacked ? 0.9 : 0,
        py: 0,
        borderRadius: "999px",
        background:
          "linear-gradient(145deg, rgba(12, 18, 34, 0.96), rgba(28, 40, 68, 0.92))",
        color: "common.white",
        boxShadow:
          "0 14px 34px rgba(15, 23, 42, 0.34), inset 0 0 0 1px rgba(255, 255, 255, 0.16)",
        backdropFilter: "blur(14px)",
        pointerEvents: "auto",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        transition: isDragging ? "none" : "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: isDragging ? "none" : "translateY(-2px)",
          boxShadow:
            "0 18px 40px rgba(15, 23, 42, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: 5,
          bottom: 5,
          width: 13,
          height: 13,
          borderRadius: "50%",
          bgcolor: "#22c55e",
          border: "2px solid rgba(15, 23, 42, 0.96)",
          boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.22)",
        },
      }}
    >
      <AvatarGroup
        max={4}
        sx={{
          "& .MuiAvatar-root": {
            width: 46,
            height: 46,
            borderColor: "rgba(255, 255, 255, 0.92)",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.22)",
            fontSize: 16,
            fontWeight: 700,
            bgcolor: "primary.main",
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
