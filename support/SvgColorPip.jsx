import React from "react";

const SvgColorPip = props => (
  <svg width="1em" height="1em" viewBox="0 0 21 21" {...props}>
    <g fill="none" fillRule="evenodd">
      <circle fill="#000" cx={10.5} cy={10.5} r={10.5} />
      <circle fill="currentColor" cx={10.5} cy={10.5} r={6.5} />
    </g>
  </svg>
);

export default SvgColorPip;

