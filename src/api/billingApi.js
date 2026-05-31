import { apiFetch, authFetch } from "./client";

export const billingApi = {
  getSummary: (payload) =>
    apiFetch("/billing/summary", {
      method: "POST",
      body: payload,
    }),

  listInvoices: (payload) =>
    apiFetch("/invoices/list", {
      method: "POST",
      body: payload,
    }),

  createInvoice: (payload) =>
    apiFetch("/invoices", {
      method: "POST",
      body: payload,
    }),

  updateInvoiceStatus: ({ invoiceId, status }) =>
    apiFetch("/invoices/status", {
      method: "POST",
      body: { invoiceId, status },
    }),

  downloadInvoicePdf: ({ invoiceId }) =>
    authFetch("/invoices/pdf", {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }),

  sendInvoiceEmail: ({ invoiceId, recipientEmail, message }) =>
    apiFetch("/invoices/email", {
      method: "POST",
      body: { invoiceId, recipientEmail, message },
    }),

  listProducts: ({ trainerId, activeOnly = true }) =>
    apiFetch(
      `/products?trainerId=${encodeURIComponent(trainerId)}&activeOnly=${String(activeOnly)}`
    ),

  createProduct: (payload) =>
    apiFetch("/products", {
      method: "POST",
      body: payload,
    }),

  updateProduct: (productId, payload) =>
    apiFetch(`/products/${encodeURIComponent(productId)}`, {
      method: "PUT",
      body: payload,
    }),

  deleteProduct: (productId) =>
    apiFetch(`/products/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    }),

  requestInvoice: ({ trainerId, lineItems }) =>
    apiFetch("/invoices/request", {
      method: "POST",
      body: { trainerId, lineItems },
    }),
};

