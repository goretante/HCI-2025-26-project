"use client";

import PageWrapper from "../../../../components/PageWrapper";
import { useState, FormEvent } from "react";

export default function CreateHabitPage() {
  const [habit, setHabit] = useState("");
  const [frequency, setFrequency] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`New habit added: ${habit} (${frequency})`);
  };

  return (
    <PageWrapper title="Add a New Habit">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
        <label htmlFor="habit">Habit Name:</label>
        <input id="habit" type="text" value={habit} onChange={(e) => setHabit(e.target.value)} required />

        <label htmlFor="frequency">Frequency (e.g. Daily, Weekly):</label>
        <input
          id="frequency"
          type="text"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          required
        />

        <button type="submit" style={{ marginTop: "10px" }}>Create Habit</button>
      </form>
    </PageWrapper>
  );
}
