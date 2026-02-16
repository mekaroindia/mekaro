export default function Container({ children }) {
  return (
    <div style={{
      maxWidth: "var(--container-width)",
      margin: "0 auto",
      padding: "20px",
      width: "100%"
    }}>
      {children}
    </div>
  );
}
