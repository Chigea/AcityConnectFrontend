const logoSrc = `${import.meta.env.BASE_URL}logo.png`;

type BrandedLoaderProps = {
  /** Visible to screen readers */
  label?: string;
  /** compact: top bar; default: panels and lists; screen: auth gates / full bleed */
  size?: "compact" | "default" | "screen";
  className?: string;
};

export function BrandedLoader({
  label = "Loading",
  size = "default",
  className = "",
}: BrandedLoaderProps) {
  const sizeClass =
    size === "compact"
      ? "branded-loader--compact"
      : size === "screen"
        ? "branded-loader--screen"
        : "branded-loader--default";

  return (
    <div
      className={`branded-loader ${sizeClass} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <img
        src={logoSrc}
        alt=""
        className="branded-loader-logo"
        decoding="async"
      />
      <span className="branded-loader-ring" aria-hidden />
    </div>
  );
}

/** Small circular spinner for inline use (e.g. inside buttons). */
export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`spinner-icon ${className}`.trim()} aria-hidden />;
}
