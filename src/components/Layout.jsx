export const Screen = ({ title, subtitle, children, actions }) => (
  <main className="screen">
    <header className="screen__header">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </header>
    <section className="screen__content">{children}</section>
    {actions ? <footer className="screen__actions">{actions}</footer> : null}
  </main>
);

export const StatPill = ({ label, value }) => (
  <div className="pill">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);
