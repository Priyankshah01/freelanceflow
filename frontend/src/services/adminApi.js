// src/services/adminApi.js
// Admin endpoints using the shared smart client.

import { makeClient } from "./http";

// Base client: {API_ROOT}/api/admin
const admin = makeClient("admin");

// Small helper to build query strings safely
const toQS = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return qs ? `?${qs}` : "";
};

/* -------- Overview -------- */
export const fetchOverview = () => admin.req("/overview");

/* -------- Users -------- */
export const listUsers = (params = {}) => admin.req(`/users${toQS(params)}`);

export const updateUserRole = (id, role) =>
  admin.req(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const updateUserStatus = (id, status) =>
  admin.req(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

/* -------- Projects -------- */
export const listProjects = (params = {}) =>
  admin.req(`/projects${toQS(params)}`);

export const setProjectStatus = (id, status) =>
  admin.req(`/projects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

/* -------- Finance -------- */
export const getFinanceSummary = () => admin.req("/finance/summary");

/* -------- Audits -------- */
export const listAudits = (params = {}) =>
  admin.req(`/audits${toQS(params)}`);

/* -------- Settings & Health -------- */
export const getAdminSettings = () => admin.req("/settings");

export const updateAdminSettings = (payload) =>
  admin.req("/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getSystemHealth = () => admin.req("/health");

/* -------- Revenue: Invoices -------- */
export const listInvoices = (params = {}) =>
  admin.req(`/finance/invoices${(() => {
    const qs = new URLSearchParams(params).toString();
    return qs ? `?${qs}` : "";
  })()}`);

export const updateInvoiceStatus = (id, status) =>
  admin.req(`/finance/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

/* -------- Revenue: Payouts -------- */
export const listPayouts = (params = {}) =>
  admin.req(`/finance/payouts${(() => {
    const qs = new URLSearchParams(params).toString();
    return qs ? `?${qs}` : "";
  })()}`);

export const updatePayoutStatus = (id, status) =>
  admin.req(`/finance/payouts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });


/* -------- Optional Ping (only if you created this route) -------- */
export const pingAdmin = () => admin.req("/__ping").catch(() => null);
