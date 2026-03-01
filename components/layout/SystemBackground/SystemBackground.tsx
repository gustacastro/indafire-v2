export function SystemBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 transition-colors duration-500">
      <svg
        className="absolute inset-0 w-full h-full opacity-50 dark:opacity-100 transition-opacity duration-500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="dotGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="var(--c-dot-grid)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
  );
}
