import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { requestMyTrainers, serverURL } from "../../Redux/actions";

const buildHeaders = () => ({
  "Content-type": "application/json; charset=UTF-8",
  Authorization: `Bearer ${localStorage.getItem("JWT_AUTH_TOKEN")}`,
});

export default function TrainerStore() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const myTrainers = useSelector((state) => state.myTrainers);
  const trainerId = searchParams.get("trainer");
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [status, setStatus] = useState("");

  const trainerLabel = useMemo(() => {
    const trainer = myTrainers.find((item) => item.trainer === trainerId);
    if (!trainer) return "Trainer";
    return `${trainer.firstName} ${trainer.lastName}`.trim();
  }, [myTrainers, trainerId]);

  useEffect(() => {
    dispatch(requestMyTrainers());
  }, [dispatch]);

  useEffect(() => {
    if (!trainerId) return;
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${serverURL}/products?trainerId=${trainerId}&activeOnly=true`,
          { headers: buildHeaders() }
        );
        const data = await response.json();
        if (data?.error) throw new Error(data.error);
        setProducts(data.products || []);
      } catch (err) {
        setStatus(err.message || "Unable to load products.");
      }
    };
    fetchProducts();
  }, [trainerId]);

  if (!trainerId) {
    return (
      <Typography color="text.secondary">
        Select a trainer to view available sessions.
      </Typography>
    );
  }

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const cartItems = products
    .map((product) => ({
      product,
      quantity: Number(quantities[product._id]) || 0,
    }))
    .filter((entry) => entry.quantity > 0);

  const handlePurchase = async () => {
    if (cartItems.length === 0) {
      setStatus("Add at least one item to purchase.");
      return;
    }
    try {
      const response = await fetch(`${serverURL}/invoices/request`, {
        method: "post",
        headers: buildHeaders(),
        body: JSON.stringify({
          trainerId,
          lineItems: cartItems.map(({ product, quantity }) => ({
            productId: product._id,
            quantity,
          })),
        }),
      });
      const data = await response.json();
      if (data?.error) throw new Error(data.error);
      setStatus("Purchase request sent to trainer.");
      setQuantities({});
    } catch (err) {
      setStatus(err.message || "Unable to request purchase.");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid container size={12}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button component={Link} to="/account/trainers" size="small" variant="outlined">
            Back to Trainers
          </Button>
          <Typography variant="h4">{trainerLabel} Store</Typography>
        </Stack>
      </Grid>

      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h6">Available Items</Typography>
            <Divider sx={{ my: 1 }} />
            {products.length === 0 ? (
              <Typography color="text.secondary">No items available.</Typography>
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
                        {product.description && (
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <TextField
                        label="Qty"
                        type="number"
                        value={quantities[product._id] || ""}
                        onChange={(event) =>
                          handleQuantityChange(product._id, event.target.value)
                        }
                        inputProps={{ min: 0, step: "1" }}
                        sx={{ width: 120 }}
                      />
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid container size={12}>
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h6">Checkout</Typography>
            <Divider sx={{ my: 1 }} />
            {cartItems.length === 0 ? (
              <Typography color="text.secondary">No items selected.</Typography>
            ) : (
              <Stack spacing={1}>
                {cartItems.map(({ product, quantity }) => (
                  <Typography key={product._id} variant="body2">
                    {quantity} × {product.name}
                  </Typography>
                ))}
              </Stack>
            )}
            {status && (
              <Typography variant="caption" color="text.secondary">
                {status}
              </Typography>
            )}
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="contained" onClick={handlePurchase}>
              Request Purchase
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}
