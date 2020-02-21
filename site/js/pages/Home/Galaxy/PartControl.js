import React from "react";

function SvgPartControl(props) {
  return (
    <svg width="244px" height="56px" viewBox="0 0 244 56">
      <g
        id="part-control"
        stroke="none"
        strokeWidth={1}
        fill="none"
        fillRule="evenodd"
      >
        <g id="example" transform="translate(28, 28)">
          <circle id="galaxy" fill="#F5A623" cx={0} cy={0} r={14} />
          <circle id="extent" fill="#000000" cx={0} cy={0} r={14} />
        </g>
        <g id="y-axis" transform="translate(68, 0)">
          <g id="slider-back" fill="#8C8C8C">
            <rect id="Rectangle" x={0} y={0} width={152} height={8} rx={4} />
          </g>
          <rect id="y-pip" fill="#000000" x={73} y={0} width={4} height={8} />
        </g>
        <g id="x-axis" transform="translate(68, 12)">
          <g id="slider-back" fill="#8C8C8C">
            <rect id="Rectangle" x={0} y={0} width={152} height={8} rx={4} />
          </g>
          <rect id="x-pip" fill="#000000" x={73} y={0} width={4} height={8} />
        </g>
        <g id="radius-axis" transform="translate(68, 24)">
          <g id="slider-back" fill="#8C8C8C">
            <rect id="Rectangle" x={0} y={0} width={152} height={8} rx={4} />
          </g>
          <rect
            id="radius-fill"
            fill="#000000"
            x={0}
            y={0}
            width={78}
            height={8}
            rx={4}
          />
        </g>
        <g id="density-axis" transform="translate(68, 36)">
          <g id="slider-back" fill="#8C8C8C">
            <rect id="Rectangle" x={0} y={0} width={152} height={8} rx={4} />
          </g>
          <rect
            id="density-fill"
            fill="#000000"
            x={0}
            y={0}
            width={78}
            height={8}
            rx={4}
          />
        </g>
        <g id="color-axis" transform="translate(68, 48)">
          <g id="slider-back" fill="#8C8C8C">
            <rect id="Rectangle" x={0} y={0} width={152} height={8} rx={4} />
          </g>
          <circle id="color-pip-white" fill="#FFFFFF" cx={4} cy={4} r={3} />
          <circle id="color-pip-blue" fill="#0700FF" cx={28} cy={4} r={3} />
          <circle id="color-pip-yellow" fill="#F8E71C" cx={76} cy={4} r={3} />
          <circle id="color-pip-green" fill="#008000" cx={52} cy={4} r={3} />
          <circle id="color-pip-orange" fill="#F5A623" cx={100} cy={4} r={3} />
          <circle id="color-pip-red" fill="#D0021B" cx={124} cy={4} r={3} />
          <circle id="color-pip-purple" fill="#9013FE" cx={148} cy={4} r={3} />
          <rect
            id="color-pip"
            stroke="#000000"
            strokeWidth={2}
            x={73}
            y={1}
            width={6}
            height={6}
          />
        </g>
        <g id="y-label" transform="translate(58, 0)">
          <circle id="Oval" fill="#F5A623" cx={4} cy={4} r={4} />
          <rect
            id="Rectangle"
            fill="#000000"
            x={3}
            y={0}
            width={2}
            height={8}
          />
        </g>
        <g id="x-label" transform="translate(58, 12)">
          <circle id="Oval-Copy" fill="#F5A623" cx={4} cy={4} r={4} />
          <rect
            id="Rectangle"
            fill="#000000"
            x={0}
            y={3}
            width={8}
            height={2}
          />
        </g>
        <circle id="Oval-Copy-2" fill="#F5A623" cx={62} cy={28} r={4} />
        <circle id="Oval" fill="#000000" cx={62} cy={28} r={2} />
        <rect
          id="Rectangle"
          fill="#F5A623"
          x={58}
          y={36}
          width={8}
          height={8}
        />
        <polygon id="Path-10" fill="#000000" points="66 36 66 44 58 44" />
        <g
          id="slider-arrow"
          transform="translate(240, 4) scale(-1, 1) translate(-240, -4) translate(236, 0)"
        >
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g id="slider-arrow" transform="translate(222, 0)">
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g
          id="slider-arrow"
          transform="translate(240, 16) scale(-1, 1) translate(-240, -16) translate(236, 12)"
        >
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g id="slider-arrow" transform="translate(222, 12)">
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g
          id="slider-arrow"
          transform="translate(240, 28) scale(-1, 1) translate(-240, -28) translate(236, 24)"
        >
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g id="slider-arrow" transform="translate(222, 24)">
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g
          id="slider-arrow"
          transform="translate(240, 40) scale(-1, 1) translate(-240, -40) translate(236, 36)"
        >
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
        <g id="slider-arrow" transform="translate(222, 36)">
          <polygon
            id="Rectangle"
            fill="#F5A623"
            points="0 2.98240519 8 0 8 8 0 4.99705226"
          />
          <polyline
            id="Path-11"
            fill="#000000"
            points="8 2.00706177 5.00663362 4 8 6.07064858"
          />
        </g>
      </g>
    </svg>
  );
}

export default SvgPartControl;
