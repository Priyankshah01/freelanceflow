// src/services/adminApi.js
// Admin endpoints using the shared smart client.

import { makeClient } from "./http";

const admin = makeClient("admin"); // base: {API_ROOT}/api/admin

/* -------- Admin endpoints -------- */
export const fetchOverview = () => admin.req("/overview");

export const listUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return admin.req(`/users${qs ? `?${qs}` : ""}`);
};

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

export const listProjects = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return admin.req(`/projects${qs ? `?${qs}` : ""}`);
};

export const setProjectStatus = (id, status) =>
  admin.req(`/projects/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const getFinanceSummary = () => admin.req("/finance/summary");

export const listAudits = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return admin.req(`/audits${qs ? `?${qs}` : ""}`);
};

// Optional health check
export const pingAdmin = () => admin.req("/__ping").catch(() => null);
