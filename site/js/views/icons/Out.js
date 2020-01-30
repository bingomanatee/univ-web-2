import React, { useState } from 'react';

const DARK = '#1A1A1A';

function SvgOut(props) {
  const [over, setOver] = useState(false);
  const [down, setDown] = useState(false);
  return (
    <svg width="65px" height="65px" viewBox="0 0 65 65" {...props}>
      <title>out</title>
      <desc>Created with Sketch.</desc>
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
        <circle id="Oval" fill="#00A17D" cx={32.5} cy={32.5} r={32.5} />
        <circle
          id="Oval-Copy-2"
          fill="#1A1A1A"
          opacity={0.5}
          cx={24.5}
          cy={23.5}
          r={18.5}
        />
        <circle id="dark-circle" fill={down ? 'white' : over ? 'blue' : DARK} cx={19.5} cy={18.5} r={8.5} />
      </g>
    </svg>
  );
}

export default SvgOut;
