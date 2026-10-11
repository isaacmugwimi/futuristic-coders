import "./Badge.css";

/** tone: neutral | success | warning | info | violet | danger | gold */
export default function Badge({ tone = "neutral", icon: Icon, children }) {
  return (
    <span className={`fc-badge fc-badge--${tone}`}>
      {Icon && <Icon size={12} aria-hidden="true" />}
      {children}
    </span>
  );
}
