import { useEffect, useMemo, useState } from "react";

export default function TodoList({
  todos,
  busyIds,
  onToggleDone,
  onDelete,
  onEditTitle,
}) {
  if (!todos.length) {
    return (
      <div className="alert alert-light border mt-3 mb-0">
        No todos yet. Add your first one above.
      </div>
    );
  }

  return (
    <div className="list-group mt-3">
      {todos.map((t) => (
        <TodoRow
          key={t.id}
          todo={t}
          busy={busyIds.has(t.id)}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
          onEditTitle={onEditTitle}
        />
      ))}
    </div>
  );
}

function TodoRow({ todo, busy, onToggleDone, onDelete, onEditTitle }) {
  const isDone = normalizeDone(todo.done);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  const created = useMemo(() => {
    try {
      return todo.created_at ? new Date(todo.created_at).toLocaleString() : "";
    } catch {
      return "";
    }
  }, [todo.created_at]);

  async function saveEdit() {
    const next = draft.trim();
    if (!next) return;
    await onEditTitle(todo.id, next);
    setIsEditing(false);
  }

  return (
    <div className="list-group-item d-flex align-items-center justify-content-between gap-3">
      <div className="d-flex align-items-start gap-3" style={{ minWidth: 0 }}>
        <input
          className="form-check-input mt-1"
          type="checkbox"
          checked={isDone}
          disabled={busy}
          onChange={(e) => onToggleDone(todo.id, e.target.checked)}
          title="Mark done"
        />

        <div style={{ minWidth: 0 }}>
          {!isEditing ? (
            <>
              <div
                className={`fw-semibold text-truncate ${
                  isDone ? "text-decoration-line-through text-secondary" : ""
                }`}
                title={todo.title}
              >
                {todo.title}
              </div>
              <small className="text-secondary">
                #{todo.id}
                {created ? ` • ${created}` : ""}
              </small>
            </>
          ) : (
            <div className="d-flex gap-2 align-items-center">
              <input
                className="form-control form-control-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={busy}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={saveEdit}
                disabled={busy}
              >
                Save
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setDraft(todo.title);
                  setIsEditing(false);
                }}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        <span className={`badge rounded-pill ${isDone ? "text-bg-success" : "text-bg-secondary"}`}>
          {isDone ? "Done" : "Open"}
        </span>

        {!isEditing ? (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsEditing(true)}
            disabled={busy}
            title="Edit title"
          >
            Edit
          </button>
        ) : null}

        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(todo.id)}
          disabled={busy}
          title="Delete todo"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function normalizeDone(done) {
  // backend might return 0/1 or true/false
  return done === true || done === 1 || done === "1";
}
