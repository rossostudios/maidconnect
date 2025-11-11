/**
 * Sanity Studio Loading State
 */

export default function StudioLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2>Loading Sanity Studio...</h2>
        <p style={{ color: "#AA88AAAAC" }}>Please wait</p>
      </div>
    </div>
  );
}
