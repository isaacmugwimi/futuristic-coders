import "./ModulePage.css";

export default function ModulePage({ icon: Icon, title, description, actionLabel }) {
  return (
    <section className="dash-module">
      <span className="dash-module__icon">
        <Icon size={28} aria-hidden="true" />
      </span>
      <h2 className="dash-module__title">{title} will appear here</h2>
      <p className="dash-module__text">{description}</p>
      {actionLabel && (
        <button type="button" className="dash-module__btn">
          {actionLabel}
        </button>
      )}
    </section>
  );
}