"use client";

import PageWrapper from "../../../../components/PageWrapper";
import { useState, FormEvent } from "react";

export default function CreateGoalPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert(`New goal created: ${title} - ${description}`);
  };

  return (
    <PageWrapper title="Create a New Goal">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
        <label htmlFor="title">Goal Title:</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label htmlFor="description">Description:</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <button type="submit" style={{ marginTop: "10px" }}>Create Goal</button>
      </form>
    </PageWrapper>
  );
}
