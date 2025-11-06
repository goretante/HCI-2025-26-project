"use client";

import { useState } from "react";
import PageWrapper from "../../../../components/PageWrapper";

type Goal = {
  id: number;
  title: string;
  description: string;
};

export default function ManageGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: "Read 12 books", description: "Read one book per month." },
    { id: 2, title: "Run 3x week", description: "Short runs to build endurance." },
    { id: 3, title: "Learn TypeScript", description: "Follow an online course and build a small app." },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");

  const startEdit = (g: Goal) => {
    setEditingId(g.id);
    setDraftTitle(g.title);
    setDraftDescription(g.description);
  };

  const saveEdit = (id: number) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, title: draftTitle, description: draftDescription } : g)));
    setEditingId(null);
    setDraftTitle("");
    setDraftDescription("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftTitle("");
    setDraftDescription("");
  };

  const deleteGoal = (id: number) => {
    if (!confirm("Delete this goal?")) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <PageWrapper title="Manage Personal Goals">
      {goals.length === 0 ? (
        <p>No goals yet. Create one from the Personal Goals page.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {goals.map((g) => (
            <li
              key={g.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              {editingId === g.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Title"
                    required
                  />
                  <textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    placeholder="Description"
                    rows={3}
                    required
                  />
                  <div>
                    <button onClick={() => saveEdit(g.id)} style={{ marginRight: 8 }}>
                      Save
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{g.title}</strong>
                    <div>
                      <button onClick={() => startEdit(g)} style={{ marginRight: 8 }}>
                        Edit
                      </button>
                      <button onClick={() => deleteGoal(g.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ marginTop: 8 }}>{g.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}
