import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import dayjs from "dayjs";
import {
  createSessionPurchase,
  requestClients,
  requestSessionPurchases,
  requestSessionSummary,
} from "../../Redux/actions";

export default function SessionCounter() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);
  const sessionSummary = useSelector((state) => state.sessionSummary);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [sessionsPurchased, setSessionsPurchased] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");
  const [purchaseList, setPurchaseList] = useState([]);

  useEffect(() => {
    if (user.isTrainer) {
      dispatch(requestClients());
    }
  }, [dispatch, user.isTrainer]);

  useEffect(() => {
    if (user.isTrainer && selectedClientId) {
      dispatch(requestSessionSummary(user._id, selectedClientId));
    }
  }, [dispatch, selectedClientId, user._id, user.isTrainer]);

  useEffect(() => {
    if (user.isTrainer && selectedClientId) {
      dispatch(
        requestSessionPurchases({
          trainerId: user._id,
          clientId: selectedClientId,
          activeOnly: false,
        })
      ).then((purchases) => {
        if (Array.isArray(purchases)) {
          setPurchaseList(purchases);
        }
      });
    }
  }, [dispatch, selectedClientId, user._id, user.isTrainer]);

  if (!user.isTrainer) {
    return <Typography>You are not a trainer. This page is unavailable.</Typography>;
  }

  const scopeKey = `${user._id}:${selectedClientId || "all"}`;
  const summary = sessionSummary?.[scopeKey];
  const selectedClient = clients.find((clientRel) => clientRel.client?._id === selectedClientId);
  const canSubmit = selectedClientId && Number(sessionsPurchased) > 0;

  const handleCreatePurchase = async () => {
    if (!canSubmit) return;
    await dispatch(
      createSessionPurchase({
        clientId: selectedClientId,
        sessionsPurchased: Number(sessionsPurchased),
        expiresAt: expiresAt ? dayjs(expiresAt).toISOString() : null,
        notes: notes.trim(),
      })
    );
    setSessionsPurchased("");
    setExpiresAt("");
    setNotes("");
    dispatch(requestSessionSummary(user._id, selectedClientId));
    dispatch(
      requestSessionPurchases({
        trainerId: user._id,
        clientId: selectedClientId,
        activeOnly: false,
      })
    ).then((purchases) => {
      if (Array.isArray(purchases)) {
        setPurchaseList(purchases);
      }
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid container size={12}>
        <Typography variant="h4">Session Counter</Typography>
      </Grid>

      <Grid container size={12}>
        <FormControl fullWidth>
          <InputLabel>Client</InputLabel>
          <Select
            label="Client"
            value={selectedClientId}
            onChange={(event) => setSelectedClientId(event.target.value)}
          >
            {clients
              .filter((clientRel) => clientRel.accepted)
              .map((clientRel) => (
                <MenuItem key={clientRel.client._id} value={clientRel.client._id}>
                  {clientRel.client.firstName} {clientRel.client.lastName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Grid>

      {selectedClient && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">
                  {selectedClient.client.firstName} {selectedClient.client.lastName}
                </Typography>
                {summary ? (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`Purchased: ${summary.purchasedSessions}`} color="primary" />
                      <Chip label={`Completed: ${summary.completedAppointments}`} />
                      <Chip
                        label={`Remaining: ${summary.remainingSessions}`}
                        color={summary.remainingSessions === 0 ? "warning" : "success"}
                      />
                      {summary.dueForPayment && (
                        <Chip label="Due for payment" color="warning" />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Updated {dayjs().format("MMM D, h:mm A")}
                    </Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">Select a client to load summary.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {selectedClient && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Add Purchase</Typography>
                <TextField
                  label="Sessions purchased"
                  type="number"
                  value={sessionsPurchased}
                  onChange={(event) => setSessionsPurchased(event.target.value)}
                  inputProps={{ min: 1 }}
                  fullWidth
                />
                <TextField
                  label="Expires at (optional)"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Notes (optional)"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  fullWidth
                />
                <Button variant="contained" onClick={handleCreatePurchase} disabled={!canSubmit}>
                  Save Purchase
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {selectedClient && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="h6">Purchase History</Typography>
              <Divider sx={{ my: 1 }} />
              {purchaseList.length === 0 ? (
                <Typography color="text.secondary">No purchases yet.</Typography>
              ) : (
                <List disablePadding>
                  {purchaseList.map((purchase) => (
                    <ListItem key={purchase._id} divider>
                      <ListItemText
                        primary={`${purchase.sessionsPurchased} sessions`}
                        secondary={`Purchased ${dayjs(purchase.purchasedAt).format(
                          "MMM D, YYYY"
                        )}${
                          purchase.expiresAt
                            ? ` • Expires ${dayjs(purchase.expiresAt).format("MMM D, YYYY")}`
                            : ""
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
