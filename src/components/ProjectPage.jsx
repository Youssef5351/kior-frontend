import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Capture token from URL once
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // remove ?token=... from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  // ✅ Fetch project using stored token
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error("Failed to fetch project");

        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error("Error loading project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{project.title}</h1>
      <p className="text-gray-600">{project.description}</p>

      <h2 className="mt-4 font-semibold">Members</h2>
      <ul className="list-disc ml-6">
        {project.members.map((m) => (
          <li key={m.id}>
            {m.user.email} — {m.role}
          </li>
        ))}
      </ul>

      <h2 className="mt-4 font-semibold">Invitations</h2>
      <ul className="list-disc ml-6">
        {project.invitations.map((inv) => (
          <li key={inv.id}>
            {inv.email} ({inv.role}) —{" "}
            {inv.accepted ? "✅ Accepted" : "⏳ Pending"}
          </li>
        ))}
      </ul>
    </div>
  );
}
