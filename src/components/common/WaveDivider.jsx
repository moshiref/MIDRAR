export default function WaveDivider() {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none">
        <path
          d="M0 22C100 4 200 4 300 20C400 36 500 36 600 18C700 0 800 0 900 16C1000 32 1100 32 1200 14"
          stroke="url(#waveDividerGrad)"
          strokeWidth="2"
          fill="none"
        />
        <defs>
          <linearGradient id="waveDividerGrad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3EE6C4" stopOpacity="0" />
            <stop offset="0.5" stopColor="#10B7A0" />
            <stop offset="1" stopColor="#0A63D6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
