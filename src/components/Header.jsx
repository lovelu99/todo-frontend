export default function Header() {
  return (
    <div className="py-4">
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between gap-3">
        <div>
          <span className="badge text-bg-dark rounded-pill px-3 py-2">
            This is a demo app
          </span>
          <h1 className="display-6 fw-bold mt-3 mb-1">Todo Dashboard <v1 className="0">v1.0</v1></h1>
          <p className="text-secondary mb-0">
            
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge text-bg-primary rounded-pill px-3 py-2">
            
          </span>
          <span className="badge text-bg-success rounded-pill px-3 py-2">
            
          </span>
        </div>
      </div>
    </div>
  );
}
