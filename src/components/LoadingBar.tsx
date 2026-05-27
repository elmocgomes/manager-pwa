// Thin indeterminate progress bar shown while dashboard data is loading.
// Accessible: exposes a busy progressbar role for screen readers.
export function LoadingBar() {
  return (
    <div
      role="progressbar"
      aria-busy="true"
      aria-label="Loading data"
      className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--panel-2)]"
    >
      <div
        className="h-full w-1/3 rounded-full bg-[var(--accent)]"
        style={{ animation: 'indeterminate 1.1s ease-in-out infinite' }}
      />
    </div>
  );
}
