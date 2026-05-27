export default function SVGFilters() {
  return (
    <svg
      width="0"
      height="0"
      className="absolute overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="pencilFx"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.045"
            numOctaves="1"
            seed="7"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id="brushFx" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.03 0.07"
            numOctaves="1"
            seed="19"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
