export default function StatusBar({ total, remaining, loading, onRefresh }) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
      <div className="d-flex gap-2 flex-wrap">
        <span className="badge text-bg-info rounded-pill px-3 py-2">
          Total: {total}
        </span>
        <span className="badge text-bg-warning rounded-pill px-3 py-2">
          Remaining: {remaining}
        </span>
      </div>

      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={onRefresh}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
