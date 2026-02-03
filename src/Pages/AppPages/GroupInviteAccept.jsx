import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { serverURL } from "../../Redux/actions";

const useQueryParam = (key) => {
  const { search } = useLocation();
  return new URLSearchParams(search).get(key);
};

export default function GroupInviteAccept() {
  const token = useQueryParam("token");
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [group, setGroup] = useState(null);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadInvite = async () => {
      if (!token) {
        setError("Missing invite token.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${serverURL}/groups/invitations/${token}`);
        const data = await response.json();
        if (data?.error) {
          throw new Error(data.error);
        }
        setInvite(data.invite || null);
        setGroup(data.group || null);
      } catch (err) {
        setError(err.message || "Unable to load invite.");
      } finally {
        setLoading(false);
      }
    };

    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setAccepting(true);
    setError("");
    try {
      const bearer = `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`;
      const response = await fetch(`${serverURL}/groups/invitations/accept`, {
        method: "post",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: bearer,
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data?.error) {
        throw new Error(data.error);
      }
      setSuccess("Invite accepted. Redirecting...");
      setTimeout(() => {
        navigate(`/groups/${data.groupId}`);
      }, 1000);
    } catch (err) {
      setError(err.message || "Unable to accept invite.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Group Invitation</Typography>
            {loading && <Typography>Loading invite...</Typography>}
            {!loading && error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && invite && (
              <>
                <Typography variant="body1">
                  You have been invited to join <strong>{group?.name || "a group"}</strong>.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {invite.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Invite email: {invite.email}
                </Typography>
                {user?.email &&
                  invite.email &&
                  user.email.toLowerCase() !== invite.email.toLowerCase() && (
                    <Alert severity="warning">
                      You are logged in as {user.email}. This invite is for {invite.email}.
                    </Alert>
                  )}
                {invite.status !== "PENDING" && (
                  <Alert severity="warning">
                    This invite is {invite.status.toLowerCase()}.
                  </Alert>
                )}
                {success && <Alert severity="success">{success}</Alert>}
                {user?.email ? (
                  <Button
                    variant="contained"
                    onClick={handleAccept}
                    disabled={accepting || invite.status !== "PENDING"}
                  >
                    {accepting ? "Accepting..." : "Accept Invite"}
                  </Button>
                ) : (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <Button variant="contained" onClick={() => navigate("/login")}>Log in</Button>
                    <Button variant="outlined" onClick={() => navigate("/signup")}>Sign up</Button>
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
