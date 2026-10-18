import "./Button.css";

/**
 * variant: primary | secondary | danger | ghost | ghost-danger
 * size: md | sm
 * loading: shows a spinner in place of the icon and disables the button
 */
export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`fc-btn fc-btn--${variant} fc-btn--${size}${
        loading ? " is-loading" : ""
      } ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="fc-btn__spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon size={size === "sm" ? 16 : 18} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}