export function Logo({
  className,
  withBackground = true,
}: {
  className?: string;
  withBackground?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {withBackground && <rect width="100" height="100" rx="22" fill="#0f2547" />}
      <text
        x="40"
        y="76"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="800"
        fontSize="50"
        fill="#ffffff"
      >
        $
      </text>
      <path
        d="M42 66 L72 32"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M56 28 H78 V50"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
