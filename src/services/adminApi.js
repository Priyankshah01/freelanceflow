// src/services/adminApi.js
// Admin endpoints using the shared smart client.

import { makeClient } from './http';

// Base client: {API_ROOT}/admin
const admin = makeClient('admin');

// Helper to build query strings
const toQS = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return qs ? `?${qs}` : '';
};

/* -------- Overview -------- */
export const fetchOverview = () => admin.req('overview');

/* -------- Users -------- */
export const listUsers = (params = {}) => admin.req(`users${toQS(params)}`);

export const updateUserRole = (id, role) =>
  admin.req(`users/${id}/role`, {
    method: 'PATCH',
    body: { role },
  });

export const updateUserStatus = (id, status) =>
  admin.req(`users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });

/* -------- Projects -------- */
export const listProjects = (params = {}) =>
  admin.req(`projects${toQS(params)}`);

export const setProjectStatus = (id, status) =>
  admin.req(`projects/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });

/* -------- Finance -------- */
export const getFinanceSummary = () => admin.req('finance/summary');

/* -------- Audits -------- */
export const listAudits = (params = {}) =>
  admin.req(`audits${toQS(params)}`);

/* -------- Settings & Health -------- */
export const getAdminSettings = () => admin.req('settings');

export const updateAdminSettings = (payload) =>
  admin.req('settings', {
    method: 'PATCH',
    body: payload,
  });

export const getSystemHealth = () => admin.req('health');

/* -------- Revenue: Invoices -------- */
export const listInvoices = (params = {}) =>
  admin.req(`finance/invoices${toQS(params)}`);

export const updateInvoiceStatus = (id, status) =>
  admin.req(`finance/invoices/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });

/* -------- Revenue: Payouts -------- */
export const listPayouts = (params = {}) =>
  admin.req(`finance/payouts${toQS(params)}`);

export const updatePayoutStatus = (id, status) =>
  admin.req(`finance/payouts/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  export const deleteProject = (id) =>
  admin.req(`projects/${id}`, {
    method: "DELETE",
  });

  export const deleteUser = (id) =>
  admin.req(`users/${id}`, {
    method: "DELETE",
  });

export const getUserDetails = (id) =>
  admin.req(`users/${id}`);



/* -------- Optional Ping -------- */
export const pingAdmin = () => admin.req('__ping').catch(() => null);
