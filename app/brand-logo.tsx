type BrandLogoProps = {
  compact?: boolean;
};

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <>
      <span className="brandSymbol" aria-hidden="true">
        <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="62" cy="62" r="44" stroke="currentColor" strokeWidth="12" />
          <path d="M93 93L124 124" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
          <path
            d="M45 48.5C45 35.8 54.8 27 68.3 27C81.3 27 90.5 35.2 90.5 47.3C90.5 57.4 84.7 62.7 77.1 67.4C70.9 71.3 67.7 75.6 67.7 82.5"
            stroke="#ED5F48"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="67.7" cy="97" r="6.5" fill="#ED5F48" />
        </svg>
      </span>
      {!compact && <span className="brandWord">Sakfrågan</span>}
    </>
  );
}
