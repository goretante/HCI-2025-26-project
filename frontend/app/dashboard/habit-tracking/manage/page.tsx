"use client";

import { useState } from "react";
import PageWrapper from "../../../../components/PageWrapper";

type Habit = {
  id: number;
  name: string;
  frequency: string;
};

export default function ManageHabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: "Morning stretch", frequency: "Daily" },
    { id: 2, name: "Meditation", frequency: "Daily" },
    { id: 3, name: "Weekly review", frequency: "Weekly" },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftFrequency, setDraftFrequency] = useState("");

  const startEdit = (h: Habit) => {
    setEditingId(h.id);
    setDraftName(h.name);
    setDraftFrequency(h.frequency);
  };

  const saveEdit = (id: number) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, name: draftName, frequency: draftFrequency } : h)));
    setEditingId(null);
    setDraftName("");
    setDraftFrequency("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
    setDraftFrequency("");
  };

  const deleteHabit = (id: number) => {
    if (!confirm("Delete this habit?")) return;
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <PageWrapper title="Manage Habits">
      {habits.length === 0 ? (
        <p>No habits yet. Add one from the Habit Tracking page.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {habits.map((h) => (
            <li
              key={h.id}
              style={{
                border: "1px solid #ddd",
                padding: "12px",
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              {editingId === h.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Habit name"
                    required
                  />
                  <input
                    value={draftFrequency}
                    onChange={(e) => setDraftFrequency(e.target.value)}
                    placeholder="Frequency (e.g. Daily)"
                    required
                  />
                  <div>
                    <button onClick={() => saveEdit(h.id)} style={{ marginRight: 8 }}>
                      Save
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong>{h.name}</strong>
                    <div>
                      <button onClick={() => startEdit(h)} style={{ marginRight: 8 }}>
                        Edit
                      </button>
                      <button onClick={() => deleteHabit(h.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ marginTop: 8 }}>{h.frequency}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}
