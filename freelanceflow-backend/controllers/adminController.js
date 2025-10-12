// controllers/adminController.js
const User = require("../models/User");
const Project = require("../models/Project");

let Payment = null;
try {
  // your file is models/Payments.js
  Payment = require("../models/Payments");
} catch (_) {
  // leave null if not present
}

/* ---------------- Helpers ---------------- */
const toInt = (v, d = 1) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) || n <= 0 ? d : n;
};

/* ---------------- Overview ---------------- */
exports.getOverview = async (req, res) => {
  try {
    const [users, projects] = await Promise.all([
      User.countDocuments({}),
      Project.countDocuments({}),
    ]);

    // 7-day project creation trend
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trend7d = await Project.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // revenue/payouts (use Payments if available)
    let revenue = [{ _id: "paid", total: 0, count: 0 }];
    let payouts = [{ _id: "sent", total: 0, count: 0 }];

    if (Payment) {
      const payAgg = await Payment.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      revenue = payAgg;
      // If you add a real payouts source later, replace this:
      payouts = [{ _id: "sent", total: 0, count: 0 }];
    }

    return res.json({
      counts: { users, projects },
      revenue,
      payouts,
      trend7d,
    });
  } catch (err) {
    console.error("admin.getOverview error:", err);
    res.status(500).json({ error: "Failed to load overview" });
  }
};

/* ---------------- Users ---------------- */
exports.listUsers = async (req, res) => {
  try {
    const { q = "", role, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status; // e.g., "active" / "suspended"

    const _page = toInt(page, 1);
    const _limit = toInt(limit, 20);
    const skip = (_page - 1) * _limit;

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_limit)
        .select("-password")
        .lean()
        .exec(),
      User.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: _page,
      pages: Math.max(1, Math.ceil(total / _limit)),
    });
  } catch (err) {
    console.error("admin.listUsers error:", err);
    res.status(500).json({ error: "Failed to list users" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "client", "freelancer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    )
      .select("-password")
      .lean()
      .exec();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("admin.updateUserRole error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // "active" | "suspended"
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .select("-password")
      .lean()
      .exec();

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("admin.updateUserStatus error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

/* ---------------- Projects ---------------- */
// IMPORTANT: NO populate calls here to avoid StrictPopulateError.
// Add only the exact paths your schema has later, if needed.
exports.listProjects = async (req, res) => {
  try {
    const { status, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (typeof status === "string" && status.trim()) {
      filter.status = status.trim();
    }

    const _page = toInt(page, 1);
    const _limit = toInt(limit, 12);
    const skip = (_page - 1) * _limit;

    const [items, total] = await Promise.all([
      Project.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(_limit)
        .lean()
        .exec(),
      Project.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: _page,
      pages: Math.max(1, Math.ceil(total / _limit)),
    });
  } catch (err) {
    console.error("admin.listProjects error:", err);
    res.status(500).json({ error: "Failed to list projects" });
  }
};

exports.setProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "open",
      "in_progress",
      "completed",
      "archived",
      "flagged",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .lean()
      .exec();

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (err) {
    console.error("admin.setProjectStatus error:", err);
    res.status(500).json({ error: "Failed to update project status" });
  }
};

/* ---------------- Finance ---------------- */
exports.financeSummary = async (req, res) => {
  try {
    if (Payment) {
      const invoices = await Payment.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]);
      return res.json({
        invoices,
        payouts: [{ _id: "sent", total: 0, count: 0 }],
      });
    }

    return res.json({
      invoices: [{ _id: "paid", total: 0, count: 0 }],
      payouts: [{ _id: "sent", total: 0, count: 0 }],
    });
  } catch (err) {
    console.error("admin.financeSummary error:", err);
    res.status(500).json({ error: "Failed to load finance summary" });
  }
};

/* ---------------- Audits ---------------- */
// If you don't have an Audit model yet, return an empty paginated list.
exports.listAudits = async (req, res) => {
  return res.json({ items: [], total: 0, page: 1, pages: 1 });
};
