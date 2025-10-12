const router = require("express").Router();
const ctrl = require("../controllers/adminController");

// Health check
router.get("/__ping", (req, res) => res.json({ ok: true, scope: "admin" }));

// Overview / metrics
router.get("/overview", ctrl.getOverview);

// Users management
router.get("/users", ctrl.listUsers);
router.patch("/users/:id/role", ctrl.updateUserRole);
router.patch("/users/:id/status", ctrl.updateUserStatus);

// Projects moderation
router.get("/projects", ctrl.listProjects);
router.patch("/projects/:id/status", ctrl.setProjectStatus);

// Finance summary
router.get("/finance/summary", ctrl.financeSummary);

// Audit logs (stub for now)
router.get("/audits", ctrl.listAudits);

module.exports = router;
