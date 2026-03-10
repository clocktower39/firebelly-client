import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { serverURL } from "../../Redux/actions";

const defaultForm = {
  itemType: "SESSION",
  name: "",
  description: "",
  price: "",
  currency: "USD",
  taxable: true,
  active: true,
  sessionTypeId: "",
  creditsPerUnit: "",
  deliverableType: "NONE",
  deliverableValue: "",
};

const buildHeaders = () => ({
  "Content-type": "application/json; charset=UTF-8",
  Authorization: `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`,
});

export default function Products() {
  const user = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [sessionTypes, setSessionTypes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState("");
  const [status, setStatus] = useState("");

  const sessionTypeLookup = useMemo(() => {
    const map = new Map();
    sessionTypes.forEach((type) => map.set(type._id, type));
    return map;
  }, [sessionTypes]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${serverURL}/products?trainerId=${user._id}&activeOnly=false`, {
        headers: buildHeaders(),
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (err) {
      setStatus(err.message || "Unable to load products.");
    }
  };

  const loadSessionTypes = async () => {
    try {
      const response = await fetch(`${serverURL}/session-types`, {
        headers: buildHeaders(),
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      setSessionTypes(data.sessionTypes || []);
    } catch (err) {
      setStatus(err.message || "Unable to load session types.");
    }
  };

  useEffect(() => {
    if (!user.isTrainer) return;
    loadProducts();
    loadSessionTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isTrainer]);

  if (!user.isTrainer) {
    return <Typography>You are not a trainer. This page is unavailable.</Typography>;
  }

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "itemType" && value !== "SESSION") {
        next.sessionTypeId = "";
        next.creditsPerUnit = "";
      }
      if (field === "sessionTypeId") {
        const type = sessionTypeLookup.get(value);
        if (type) {
          next.creditsPerUnit = String(type.creditsRequired || 1);
        }
      }
      return next;
    });
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId("");
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      itemType: product.itemType || "CUSTOM",
      name: product.name || "",
      description: product.description || "",
      price: product.price === 0 || product.price ? String(product.price) : "",
      currency: product.currency || "USD",
      taxable: product.taxable !== false,
      active: product.active !== false,
      sessionTypeId: product.sessionTypeId?._id || product.sessionTypeId || "",
      creditsPerUnit:
        product.creditsPerUnit === 0 || product.creditsPerUnit
          ? String(product.creditsPerUnit)
          : "",
      deliverableType: product.deliverableType || "NONE",
      deliverableValue: product.deliverableValue || "",
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setStatus("Name is required.");
      return;
    }
    if (form.itemType === "SESSION" && !form.sessionTypeId) {
      setStatus("Session type is required for session products.");
      return;
    }
    const payload = {
      itemType: form.itemType,
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price === "" ? 0 : Number(form.price),
      currency: form.currency,
      taxable: form.taxable,
      active: form.active,
      sessionTypeId: form.itemType === "SESSION" ? form.sessionTypeId : null,
      creditsPerUnit: form.itemType === "SESSION" ? Number(form.creditsPerUnit) || 0 : 0,
      deliverableType: form.deliverableType,
      deliverableValue: form.deliverableValue,
    };

    try {
      const url = editingId
        ? `${serverURL}/products/${editingId}`
        : `${serverURL}/products`;
      const response = await fetch(url, {
        method: editingId ? "put" : "post",
        headers: buildHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      setStatus("");
      resetForm();
      loadProducts();
    } catch (err) {
      setStatus(err.message || "Unable to save product.");
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`${serverURL}/products/${productId}`, {
        method: "delete",
        headers: buildHeaders(),
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      loadProducts();
    } catch (err) {
      setStatus(err.message || "Unable to delete product.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid container size={12}>
        <Typography variant="h4">Products</Typography>
      </Grid>

      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">
                {editingId ? "Edit Product" : "Add Product"}
              </Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={form.itemType}
                    onChange={(event) => handleChange("itemType", event.target.value)}
                  >
                    <MenuItem value="SESSION">Training Session</MenuItem>
                    <MenuItem value="PROGRAM">Program</MenuItem>
                    <MenuItem value="NUTRITION">Nutrition Plan</MenuItem>
                    <MenuItem value="MERCH">Merchandise</MenuItem>
                    <MenuItem value="CUSTOM">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Description"
                value={form.description}
                onChange={(event) => handleChange("description", event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              {form.itemType === "SESSION" && (
                <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                  <FormControl fullWidth>
                    <InputLabel>Session Type</InputLabel>
                    <Select
                      label="Session Type"
                      value={form.sessionTypeId}
                      onChange={(event) =>
                        handleChange("sessionTypeId", event.target.value)
                      }
                    >
                      <MenuItem value="">Select session type</MenuItem>
                      {sessionTypes.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Credits per unit"
                    type="number"
                    value={form.creditsPerUnit}
                    onChange={(event) =>
                      handleChange("creditsPerUnit", event.target.value)
                    }
                    inputProps={{ min: 0, step: "0.5" }}
                    fullWidth
                  />
                </Stack>
              )}
              {form.itemType === "SESSION" && sessionTypes.length === 0 && (
                <Typography variant="caption" color="text.secondary">
                  No session types found. Create session types in Schedule → Session Types.
                </Typography>
              )}
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <TextField
                  label="Price"
                  type="number"
                  value={form.price}
                  onChange={(event) => handleChange("price", event.target.value)}
                  inputProps={{ min: 0, step: "0.01" }}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    label="Currency"
                    value={form.currency}
                    onChange={(event) => handleChange("currency", event.target.value)}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                <FormControl fullWidth>
                  <InputLabel>Deliverable</InputLabel>
                  <Select
                    label="Deliverable"
                    value={form.deliverableType}
                    onChange={(event) =>
                      handleChange("deliverableType", event.target.value)
                    }
                  >
                    <MenuItem value="NONE">None</MenuItem>
                    <MenuItem value="FILE">File</MenuItem>
                    <MenuItem value="LINK">Link</MenuItem>
                    <MenuItem value="MESSAGE">Message</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Deliverable Value"
                  value={form.deliverableValue}
                  onChange={(event) => handleChange("deliverableValue", event.target.value)}
                  fullWidth
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.taxable}
                      onChange={(event) => handleChange("taxable", event.target.checked)}
                    />
                  }
                  label={form.taxable ? "Taxable" : "Not taxable"}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={(event) => handleChange("active", event.target.checked)}
                    />
                  }
                  label={form.active ? "Active" : "Inactive"}
                />
              </Stack>
              {status && (
                <Typography variant="caption" color="error">
                  {status}
                </Typography>
              )}
            </Stack>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" onClick={handleSave}>
              {editingId ? "Save Changes" : "Add Product"}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>

      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h6">Product Catalog</Typography>
            <Divider sx={{ my: 1 }} />
            {products.length === 0 ? (
              <Typography color="text.secondary">No products yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {products.map((product) => (
                  <Card key={product._id} variant="outlined">
                    <CardContent>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1">{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.itemType}
                          {product.sessionTypeId?.name
                            ? ` • ${product.sessionTypeId.name}`
                            : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.currency} {Number(product.price || 0).toFixed(2)}
                          {product.itemType === "SESSION"
                            ? ` • ${product.creditsPerUnit || 0} credits`
                            : ""}
                        </Typography>
                        {!product.active && (
                          <Typography variant="caption" color="error">
                            Inactive
                          </Typography>
                        )}
                        {product.description && (
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button size="small" variant="outlined" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
