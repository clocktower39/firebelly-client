import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import dayjs from "dayjs";
import { requestClients, serverURL } from "../../Redux/actions";

const buildAuthHeaders = () => ({
  "Content-type": "application/json; charset=UTF-8",
  Authorization: `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`,
});

const defaultLineItem = () => ({
  description: "",
  quantity: 1,
  unitPrice: "",
  sessionCredits: "",
});

export default function Invoices() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const clients = useSelector((state) => state.clients);

  const [billToType, setBillToType] = useState("CLIENT");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [groups, setGroups] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [invoiceList, setInvoiceList] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [error, setError] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [billToEmail, setBillToEmail] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [currency, setCurrency] = useState("USD");
  const [dueAt, setDueAt] = useState("");
  const [tax, setTax] = useState("");
  const [discount, setDiscount] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [lineItems, setLineItems] = useState([defaultLineItem()]);

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState(null);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (user.isTrainer) {
      dispatch(requestClients());
    }
  }, [dispatch, user.isTrainer]);

  useEffect(() => {
    if (!user.isTrainer) return;
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${serverURL}/groups`, {
          headers: buildAuthHeaders(),
        });
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        setGroups(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load groups.");
      }
    };
    fetchGroups();
  }, [user.isTrainer]);

  const targetId = billToType === "CLIENT" ? selectedClientId : selectedGroupId;

  const refreshSummary = async () => {
    if (!targetId) return;
    setLoadingSummary(true);
    setError("");
    try {
      const payload = {
        trainerId: user._id,
        clientId: billToType === "CLIENT" ? targetId : null,
        groupId: billToType === "GROUP" ? targetId : null,
      };
      const response = await fetch(`${serverURL}/billing/summary`, {
        method: "post",
        dataType: "json",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setBillingSummary(data);
    } catch (err) {
      setError(err.message || "Unable to load billing summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const refreshInvoices = async () => {
    if (!targetId) return;
    setLoadingInvoices(true);
    setError("");
    try {
      const payload = {
        trainerId: user._id,
        clientId: billToType === "CLIENT" ? targetId : null,
        groupId: billToType === "GROUP" ? targetId : null,
      };
      const response = await fetch(`${serverURL}/invoices/list`, {
        method: "post",
        dataType: "json",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setInvoiceList(data.invoices || []);
    } catch (err) {
      setError(err.message || "Unable to load invoices.");
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    if (user.isTrainer && targetId) {
      refreshSummary();
      refreshInvoices();
    } else {
      setBillingSummary(null);
      setInvoiceList([]);
    }
  }, [billToType, targetId, user.isTrainer]);

  if (!user.isTrainer) {
    return <Typography>You are not a trainer. This page is unavailable.</Typography>;
  }

  const selectedClient = clients.find((clientRel) => clientRel.client?._id === selectedClientId);
  const selectedGroup = groups.find((entry) => entry.group?._id === selectedGroupId);

  const totals = useMemo(() => {
    const items = lineItems.map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(item.unitPrice) || 0;
      const sessionCredits = Number(item.sessionCredits) || 0;
      return {
        lineTotal: unitPrice * quantity,
        sessionCreditsTotal: sessionCredits * quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const sessionCreditsTotal = items.reduce((sum, item) => sum + item.sessionCreditsTotal, 0);
    const taxValue = Number(tax) || 0;
    const discountValue = Number(discount) || 0;
    return {
      subtotal,
      sessionCreditsTotal,
      taxValue,
      discountValue,
      total: subtotal + taxValue - discountValue,
    };
  }, [lineItems, tax, discount]);

  const remainingByInvoice = useMemo(() => {
    const remainingMap = {};
    if (!billingSummary) return remainingMap;
    let remainingDebits = Number(billingSummary.debits || 0);
    const creditInvoices = [...invoiceList]
      .filter((invoice) => invoice.status === "PAID")
      .sort(
        (a, b) =>
          new Date(a.issuedAt || a.createdAt || 0) - new Date(b.issuedAt || b.createdAt || 0)
      );
    creditInvoices.forEach((invoice) => {
      const credits = Number(invoice.sessionCreditsTotal || 0);
      const used = Math.min(credits, remainingDebits);
      remainingDebits -= used;
      remainingMap[invoice._id] = Math.max(credits - used, 0);
    });
    return remainingMap;
  }, [invoiceList, billingSummary]);

  const handleLineItemChange = (index, field, value) => {
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, defaultLineItem()]);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setInvoiceNumber("");
    setBillToEmail("");
    setStatus("DRAFT");
    setCurrency("USD");
    setDueAt("");
    setTax("");
    setDiscount("");
    setNotes("");
    setTerms("");
    setLineItems([defaultLineItem()]);
  };

  const handleCreateInvoice = async () => {
    if (!targetId) return;
    const normalizedLineItems = lineItems
      .map((item) => ({
        description: String(item.description || "").trim(),
        quantity: Math.max(1, Number(item.quantity) || 1),
        unitPrice: Number(item.unitPrice) || 0,
        sessionCredits: Number(item.sessionCredits) || 0,
      }))
      .filter((item) => item.description);

    if (normalizedLineItems.length === 0) {
      setError("Add at least one line item with a description.");
      return;
    }

    try {
      const payload = {
        billToType,
        clientId: billToType === "CLIENT" ? targetId : null,
        groupId: billToType === "GROUP" ? targetId : null,
        billToEmail: billToType === "GROUP" ? billToEmail.trim() : null,
        invoiceNumber: invoiceNumber.trim() || null,
        status,
        currency,
        dueAt: dueAt || null,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        notes: notes.trim(),
        terms: terms.trim(),
        lineItems: normalizedLineItems,
      };
      const response = await fetch(`${serverURL}/invoices`, {
        method: "post",
        dataType: "json",
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      resetForm();
      refreshInvoices();
      refreshSummary();
    } catch (err) {
      setError(err.message || "Unable to create invoice.");
    }
  };

  const handleStatusUpdate = async (invoiceId, nextStatus) => {
    try {
      const response = await fetch(`${serverURL}/invoices/status`, {
        method: "post",
        dataType: "json",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ invoiceId, status: nextStatus }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      refreshInvoices();
      refreshSummary();
    } catch (err) {
      setError(err.message || "Unable to update invoice.");
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      const response = await fetch(`${serverURL}/invoices/pdf`, {
        method: "post",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ invoiceId: invoice._id }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Unable to download PDF.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to download PDF.");
    }
  };

  const openEmailDialog = (invoice) => {
    setEmailInvoice(invoice);
    setEmailRecipient(invoice.billToEmail || "");
    setEmailMessage("");
    setEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!emailInvoice) return;
    if (!emailRecipient.trim()) {
      setError("Recipient email is required.");
      return;
    }
    setSendingEmail(true);
    try {
      const response = await fetch(`${serverURL}/invoices/email`, {
        method: "post",
        dataType: "json",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          invoiceId: emailInvoice._id,
          recipientEmail: emailRecipient.trim(),
          message: emailMessage.trim(),
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setEmailDialogOpen(false);
    } catch (err) {
      setError(err.message || "Unable to send invoice email.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid container size={12}>
        <Typography variant="h4">Invoices</Typography>
      </Grid>

      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Billing Target</Typography>
              <FormControl fullWidth>
                <InputLabel>Bill To</InputLabel>
                <Select
                  label="Bill To"
                  value={billToType}
                  onChange={(event) => {
                    setBillToType(event.target.value);
                    setSelectedClientId("");
                    setSelectedGroupId("");
                    setBillToEmail("");
                  }}
                >
                  <MenuItem value="CLIENT">Client</MenuItem>
                  <MenuItem value="GROUP">Group</MenuItem>
                </Select>
              </FormControl>
              {billToType === "CLIENT" ? (
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
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Group</InputLabel>
                  <Select
                    label="Group"
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                  >
                    {groups.map((entry) => (
                      <MenuItem key={entry.group?._id} value={entry.group?._id}>
                        {entry.group?.name || "Group"}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {targetId && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">
                  {billToType === "CLIENT"
                    ? `${selectedClient?.client?.firstName || ""} ${selectedClient?.client?.lastName || ""}`
                    : selectedGroup?.group?.name || "Group"}
                </Typography>
                {loadingSummary ? (
                  <Typography color="text.secondary">Loading summary...</Typography>
                ) : billingSummary ? (
                  <>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`Credits: ${billingSummary.credits}`} color="primary" />
                      <Chip label={`Debits: ${billingSummary.debits}`} />
                      <Chip
                        label={`Remaining: ${billingSummary.remainingSessions}`}
                        color={billingSummary.remainingSessions <= 0 ? "warning" : "success"}
                      />
                      {billingSummary.dueForPayment && (
                        <Chip label="Due for payment" color="warning" />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Updated{" "}
                      {billingSummary.lastEntryAt
                        ? dayjs(billingSummary.lastEntryAt).format("MMM D, h:mm A")
                        : dayjs().format("MMM D, h:mm A")}
                    </Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">No billing summary yet.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {targetId && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Create Invoice</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Invoice # (optional)"
                    value={invoiceNumber}
                    onChange={(event) => setInvoiceNumber(event.target.value)}
                    fullWidth
                  />
                  {billToType === "GROUP" && (
                    <TextField
                      label="Bill To Email (optional)"
                      value={billToEmail}
                      onChange={(event) => setBillToEmail(event.target.value)}
                      fullWidth
                    />
                  )}
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <MenuItem value="DRAFT">Draft</MenuItem>
                      <MenuItem value="SENT">Sent</MenuItem>
                      <MenuItem value="PAID">Paid</MenuItem>
                      <MenuItem value="PAST_DUE">Past Due</MenuItem>
                      <MenuItem value="VOID">Void</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      label="Currency"
                      value={currency}
                      onChange={(event) => setCurrency(event.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="JPY">JPY</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Due date"
                    type="date"
                    value={dueAt}
                    onChange={(event) => setDueAt(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Line Items</Typography>
                  {lineItems.map((item, idx) => (
                    <Stack key={idx} spacing={1}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                        <TextField
                          label="Description"
                          value={item.description}
                          onChange={(event) =>
                            handleLineItemChange(idx, "description", event.target.value)
                          }
                          fullWidth
                        />
                        <TextField
                          label="Qty"
                          type="number"
                          value={item.quantity}
                          onChange={(event) =>
                            handleLineItemChange(idx, "quantity", event.target.value)
                          }
                          inputProps={{ min: 1 }}
                          fullWidth
                        />
                        <TextField
                          label="Unit Price"
                          type="number"
                          value={item.unitPrice}
                          onChange={(event) =>
                            handleLineItemChange(idx, "unitPrice", event.target.value)
                          }
                          inputProps={{ min: 0, step: "0.01" }}
                          fullWidth
                        />
                        <TextField
                          label="Session Credits (per unit)"
                          type="number"
                          value={item.sessionCredits}
                          onChange={(event) =>
                            handleLineItemChange(idx, "sessionCredits", event.target.value)
                          }
                          inputProps={{ min: 0, step: "1" }}
                          fullWidth
                        />
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveLineItem(idx)}
                          disabled={lineItems.length === 1}
                        >
                          Remove Line
                        </Button>
                      </Stack>
                      <Divider />
                    </Stack>
                  ))}
                  <Button variant="outlined" onClick={handleAddLineItem}>
                    Add Line Item
                  </Button>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <TextField
                    label="Tax"
                    type="number"
                    value={tax}
                    onChange={(event) => setTax(event.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    fullWidth
                  />
                  <TextField
                    label="Discount"
                    type="number"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    inputProps={{ min: 0, step: "0.01" }}
                    fullWidth
                  />
                </Stack>

                <Stack spacing={1}>
                  <TextField
                    label="Notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Terms"
                    value={terms}
                    onChange={(event) => setTerms(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>

                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Totals</Typography>
                      <Typography variant="body2">Subtotal: {totals.subtotal.toFixed(2)}</Typography>
                      <Typography variant="body2">Tax: {totals.taxValue.toFixed(2)}</Typography>
                      <Typography variant="body2">
                        Discount: {totals.discountValue.toFixed(2)}
                      </Typography>
                      <Typography variant="body1">
                        Total: {totals.total.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Session Credits: {totals.sessionCreditsTotal}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Button variant="contained" onClick={handleCreateInvoice}>
                  Create Invoice
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}

      {targetId && (
        <Grid container size={12}>
          <Card sx={{ width: "100%" }}>
            <CardContent>
              <Typography variant="h6">Invoice History</Typography>
              <Divider sx={{ my: 1 }} />
              {loadingInvoices ? (
                <Typography color="text.secondary">Loading invoices...</Typography>
              ) : invoiceList.length === 0 ? (
                <Typography color="text.secondary">No invoices yet.</Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Issued</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell align="right">Credits</TableCell>
                      <TableCell align="right">Remaining</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceList.map((invoice) => (
                      <TableRow key={invoice._id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.status}</TableCell>
                        <TableCell>
                          {invoice.issuedAt ? dayjs(invoice.issuedAt).format("MMM D, YYYY") : "—"}
                        </TableCell>
                        <TableCell align="right">{Number(invoice.total || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {Number(invoice.balanceDue || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">{invoice.sessionCreditsTotal || 0}</TableCell>
                        <TableCell align="right">
                          {invoice.status === "PAID"
                            ? remainingByInvoice[invoice._id] !== undefined
                              ? remainingByInvoice[invoice._id]
                              : invoice.sessionCreditsTotal || 0
                            : "—"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleDownloadPdf(invoice)}
                            >
                              PDF
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => openEmailDialog(invoice)}
                            >
                              Email
                            </Button>
                            {invoice.status !== "PAID" && invoice.status !== "VOID" && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleStatusUpdate(invoice._id, "PAID")}
                              >
                                Mark Paid
                              </Button>
                            )}
                            {invoice.status !== "VOID" && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleStatusUpdate(invoice._id, "VOID")}
                              >
                                Void
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {error && (
        <Grid container size={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}

      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Invoice</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Recipient email"
              value={emailRecipient}
              onChange={(event) => setEmailRecipient(event.target.value)}
              fullWidth
            />
            <TextField
              label="Message (optional)"
              value={emailMessage}
              onChange={(event) => setEmailMessage(event.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendEmail} disabled={sendingEmail}>
            {sendingEmail ? "Sending..." : "Send Email"}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
