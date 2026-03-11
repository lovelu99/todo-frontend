import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import StatusBar from "./components/StatusBar";
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  patchTodoDone,
  updateTodoTitle,
} from "./api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [busyIds, setBusyIds] = useState(new Set()); // ids being updated/deleted

  const remaining = useMemo(
    () => todos.filter((t) => !(t.done === true || t.done === 1 || t.done === "1")).length,
    [todos]
  );

  function markBusy(id, on) {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const list = await fetchTodos();
      setTodos(list);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function add(title) {
    setErr("");
    setLoading(true);
    try {
      await createTodo(title);
      await load();
    } catch (e) {
      setErr(e.message || "Failed to add");
      setLoading(false);
    }
  }

  async function toggleDone(id, done) {
    setErr("");
    markBusy(id, true);
    try {
      const updated = await patchTodoDone(id, done);
      // update local list without full refresh
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch (e) {
      setErr(e.message || "Failed to update");
    } finally {
      markBusy(id, false);
    }
  }

  async function editTitle(id, title) {
    setErr("");
    markBusy(id, true);
    try {
      const updated = await updateTodoTitle(id, title);
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    } catch (e) {
      setErr(e.message || "Failed to edit");
    } finally {
      markBusy(id, false);
    }
  }

  async function remove(id) {
    const ok = window.confirm(`Delete todo #${id}?`);
    if (!ok) return;

    setErr("");
    markBusy(id, true);
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setErr(e.message || "Failed to delete");
    } finally {
      markBusy(id, false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="app-bg">
      <div className="container py-4">
        <Header />

        <div className="card shadow-sm border-0">
          <div className="card-body p-4">
            <TodoForm onAdd={add} loading={loading} />

            {err ? (
              <div className="alert alert-danger mt-3 mb-0">
                <strong>Error:</strong> {err}
              </div>
            ) : null}

            <div className="mt-3">
              <StatusBar
                total={todos.length}
                remaining={remaining}
                loading={loading}
                onRefresh={load}
              />
            </div>

            <TodoList
              todos={todos}
              busyIds={busyIds}
              onToggleDone={toggleDone}
              onDelete={remove}
              onEditTitle={editTitle}
            />
          </div>
        </div>

    
      </div>
    </div>
  );
}
