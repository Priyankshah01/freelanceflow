// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { get } from "../services/api";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // service already has /api
    get("/projects")
      .then((res) => {
        // handle both shapes
        const list = res?.data?.projects || res?.projects || res || [];
        setProjects(list);
      })
      .catch((err) => console.error("Error fetching projects:", err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      {projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p._id || p.id}
              className="bg-white border border-gray-200 rounded-md p-4"
            >
              <h2 className="font-semibold text-gray-900">{p.title}</h2>
              <p className="text-sm text-gray-500">{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
