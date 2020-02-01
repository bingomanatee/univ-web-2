import React, { useState } from 'react';

const DARK = '#1A1A1A';
const OUT_FINAL = 'rgba(108,177,219,0.8)';

function SvgOut(props) {
  const [over, setOver] = useState(false);
  const [down, setDown] = useState(false);
  return (
    <svg width="65px" height="65px" viewBox="0 0 65 65" {...props}>
      <title>out</title>
      <desc>Created with Sketch.</desc>
      <defs>
        <radialGradient
          cx="31.1748798%"
          cy="31.3746995%"
          fx="31.1748798%"
          fy="31.3746995%"
          r="82.8014291%"
          gradientTransform="translate(0.311749,0.313747),rotate(45.050723),scale(1.000000,0.709436),translate(-0.311749,-0.313747)"
          id="outGradient"
        >
          <stop stopColor="#000000" stopOpacity={1} offset="0%" />
          <stop stopColor={OUT_FINAL} stopOpacity={0.8} offset="50%" />
          <stop stopColor={OUT_FINAL} stopOpacity={0.75} offset="75%" />
          <stop stopColor={OUT_FINAL} stopOpacity={0.25} offset="100%" />
        </radialGradient>
      </defs>
      <g
        id="out"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
        onMouseEnter={() => { setOver(true); }}
        onMouseLeave={() => { setDown(false); setOver(false); }}
        onMouseDown={() => { setDown(true); if (props.onClick) props.onClick(); }}
        onMouseUp={() => { setDown(false); }}
      >
        <circle
          id="Oval"
          fill="url(#outGradient)"
          cx={32.5}
          cy={32.5}
          r={32.5}
        />
        <circle id="Oval-Copy-3" fill={down ? 'white' : over ? 'blue' : DARK} cx={19.5} cy={18.5} r={8.5} />
      </g>
    </svg>
  );
}

export default SvgOut;
