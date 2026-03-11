import { useState } from "react";

export default function TodoForm({ onAdd, loading }) {
  const [title, setTitle] = useState("");

  async function submit(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    await onAdd(t);
    setTitle("");
  }

  return (
    <form onSubmit={submit} className="d-flex gap-2">
      <input
        className="form-control"
        placeholder="Add a new todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
      />
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
