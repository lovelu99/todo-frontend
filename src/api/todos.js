export async function fetchTodos() {
  const res = await fetch("/api/todos");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Failed to load todos");
  return data.todos || [];
}

export async function createTodo(title) {
  const res = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Failed to create todo");
  return data;
}

export async function patchTodoDone(id, done) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Failed to update todo");
  return data.todo;
}

export async function updateTodoTitle(id, title) {
  const res = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Failed to edit todo");
  return data.todo;
}

export async function deleteTodo(id) {
  const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || "Failed to delete todo");
  return data;
}
