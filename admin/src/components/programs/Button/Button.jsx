import "./Button.css";

/**
 * variant: primary | secondary | danger | ghost | ghost-danger
 * size: md | sm
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`fc-btn fc-btn--${variant} fc-btn--${size} ${className}`.trim()}
      {...props}
    >
      {Icon && <Icon size={size === "sm" ? 16 : 18} aria-hidden="true" />}
      {children}
    </button>
  );
}
