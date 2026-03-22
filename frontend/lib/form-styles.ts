/* Shared field styles used in admin product/promotion forms */

export const F = {
  fieldGroup: { marginBottom: 24 } as React.CSSProperties,

  label: {
    display: "block",
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--brown-mid)",
    marginBottom: 8,
  } as React.CSSProperties,

  input: {
    width: "100%",
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.92rem",
    color: "var(--brown)",
    background: "var(--cream)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  } as React.CSSProperties,

  textarea: {
    width: "100%",
    minHeight: 140,
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.92rem",
    color: "var(--brown)",
    background: "var(--cream)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.6,
  } as React.CSSProperties,

  select: {
    width: "100%",
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.92rem",
    color: "var(--brown)",
    background: "var(--cream)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "11px 14px",
    outline: "none",
    boxSizing: "border-box",
    appearance: "auto",
  } as React.CSSProperties,
};