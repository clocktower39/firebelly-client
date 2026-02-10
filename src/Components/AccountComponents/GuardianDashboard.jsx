import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginJWT, serverURL } from "../../Redux/actions";

const GuardianDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [status, setStatus] = useState("");
  const [emailByChild, setEmailByChild] = useState({});
  const [consentScopeByChild, setConsentScopeByChild] = useState({});
  const [childForm, setChildForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    pin: "",
    dateOfBirth: "",
    email: "",
    consentScope: "collection_only",
    consentChecked: false,
  });

  const authHeaders = {
    "Content-type": "application/json; charset=UTF-8",
    Authorization: `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`,
  };

  const loadChildren = async () => {
    setStatus("");
    try {
      const response = await fetch(`${serverURL}/guardian/children`, {
        headers: authHeaders,
      });
      const data = await response.json();
      setChildren(data.children || []);
    } catch (err) {
      setStatus("Unable to load children.");
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleCreateChild = async () => {
    setStatus("");
    const response = await fetch(`${serverURL}/guardian/child`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        firstName: childForm.firstName,
        lastName: childForm.lastName,
        username: childForm.username,
        pin: childForm.pin,
        dateOfBirth: childForm.dateOfBirth,
        email: childForm.email || undefined,
      }),
    });
    const data = await response.json();
    if (data.error) {
      setStatus(data.error?.username || data.error?.email || data.error || "Unable to create child.");
      return;
    }

    if (childForm.consentChecked && data.child?.ageBand === "u13") {
      await fetch(`${serverURL}/guardian/child/consent`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          childId: data.child._id,
          scope: childForm.consentScope,
          method: "guardian_dashboard",
        }),
      });
    }

    setChildForm({
      firstName: "",
      lastName: "",
      username: "",
      pin: "",
      dateOfBirth: "",
      email: "",
      consentScope: "collection_only",
      consentChecked: false,
    });
    await loadChildren();
  };

  const handleViewAsChild = async (childId) => {
    const response = await fetch(`${serverURL}/guardian/child/token`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ childId }),
    });
    const data = await response.json();
    if (!data.accessToken) {
      setStatus(data.error || "Unable to enter child view.");
      return;
    }

    const currentAccess = localStorage.getItem("JWT_AUTH_TOKEN");
    const currentRefresh = localStorage.getItem("JWT_REFRESH_TOKEN");
    if (currentAccess) localStorage.setItem("JWT_GUARDIAN_AUTH_TOKEN", currentAccess);
    if (currentRefresh) localStorage.setItem("JWT_GUARDIAN_REFRESH_TOKEN", currentRefresh);

    localStorage.setItem("JWT_AUTH_TOKEN", data.accessToken);
    localStorage.setItem("JWT_VIEW_ONLY", "true");
    dispatch(loginJWT(data.accessToken));
    navigate("/");
  };

  const handleConsent = async (childId) => {
    const scope = consentScopeByChild[childId] || "collection_only";
    const response = await fetch(`${serverURL}/guardian/child/consent`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ childId, scope, method: "guardian_dashboard" }),
    });
    const data = await response.json();
    if (data.error) {
      setStatus(data.error || "Unable to record consent.");
      return;
    }
    await loadChildren();
  };

  const handleAddEmail = async (childId) => {
    const email = (emailByChild[childId] || "").trim();
    if (!email) {
      setStatus("Please enter an email address.");
      return;
    }
    const response = await fetch(`${serverURL}/guardian/child/add-email`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ childId, email }),
    });
    const data = await response.json();
    if (data.error) {
      setStatus(data.error?.email || data.error || "Unable to add email.");
      return;
    }
    setStatus("Verification email sent.");
    await loadChildren();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Family & Guardian Access
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Create Child Account
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                value={childForm.firstName}
                onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                value={childForm.lastName}
                onChange={(e) => setChildForm({ ...childForm, lastName: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Username"
                value={childForm.username}
                onChange={(e) => setChildForm({ ...childForm, username: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="PIN"
                type="password"
                value={childForm.pin}
                onChange={(e) => setChildForm({ ...childForm, pin: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={childForm.dateOfBirth}
                onChange={(e) => setChildForm({ ...childForm, dateOfBirth: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email (optional)"
                value={childForm.email}
                onChange={(e) => setChildForm({ ...childForm, email: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Parental Consent Scope"
                value={childForm.consentScope}
                onChange={(e) => setChildForm({ ...childForm, consentScope: e.target.value })}
                fullWidth
              >
                <MenuItem value="collection_only">Collection only</MenuItem>
                <MenuItem value="collection_and_disclosure">Collection and disclosure</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant={childForm.consentChecked ? "contained" : "outlined"}
                onClick={() =>
                  setChildForm({
                    ...childForm,
                    consentChecked: !childForm.consentChecked,
                  })
                }
              >
                {childForm.consentChecked
                  ? "Parental consent will be recorded for under-13"
                  : "Record parental consent for under-13"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button variant="contained" onClick={handleCreateChild}>
            Create Child
          </Button>
        </CardActions>
      </Card>

      <Divider sx={{ mb: 2 }} />

      <Typography variant="h6" gutterBottom>
        Your Children
      </Typography>
      {status && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {status}
        </Typography>
      )}
      <Grid container spacing={2}>
        {children.map((child) => (
          <Grid item xs={12} md={6} key={child._id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">
                  {child.firstName} {child.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Username: {child.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age Band: {child.ageBand || "unknown"} | COPPA: {child.coppaStatus || "n/a"}
                </Typography>
                <TextField
                  label="Add Email"
                  value={emailByChild[child._id] || ""}
                  onChange={(e) =>
                    setEmailByChild({ ...emailByChild, [child._id]: e.target.value })
                  }
                  fullWidth
                  sx={{ mt: 2 }}
                />
                {child.ageBand === "u13" && child.coppaStatus !== "consented" && (
                  <TextField
                    select
                    label="Consent Scope"
                    value={consentScopeByChild[child._id] || "collection_only"}
                    onChange={(e) =>
                      setConsentScopeByChild({
                        ...consentScopeByChild,
                        [child._id]: e.target.value,
                      })
                    }
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    <MenuItem value="collection_only">Collection only</MenuItem>
                    <MenuItem value="collection_and_disclosure">
                      Collection and disclosure
                    </MenuItem>
                  </TextField>
                )}
              </CardContent>
              <CardActions>
                <Button variant="outlined" onClick={() => handleViewAsChild(child._id)}>
                  View Activity
                </Button>
                <Button variant="outlined" onClick={() => handleAddEmail(child._id)}>
                  Send Email Verify
                </Button>
                {child.ageBand === "u13" && child.coppaStatus !== "consented" && (
                  <Button variant="contained" onClick={() => handleConsent(child._id)}>
                    Record Consent
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GuardianDashboard;
