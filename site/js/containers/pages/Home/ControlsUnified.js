import React, { PureComponent } from 'react';

const ACTIVE_SPEED = '#C9A600';
const TRANSPARENT = 'rgba(0,0,0,0)';

class SvgControlsUnified extends PureComponent {
  render() {
    const {
      arrows, speed, setSpeed, onArrowOver, onArrowOut, onArrowDown,
    } = this.props;

    console.log('rendering controls');

    return (
      <svg width="400px" height="400px" viewBox="0 0 400 400">
        <title>controls-unified</title>
        <desc>Created with Sketch.</desc>
        <g
          id="controls-unified"
          stroke="none"
          strokeWidth={1}
          fill="none"
          fillRule="evenodd"
        >
          <path
            d="M201.391919,85.391919 C264.904665,85.391919 316.391919,136.879173 316.391919,200.391919 C316.391919,263.904665 264.904665,315.391919 201.391919,315.391919 C137.879173,315.391919 86.391919,263.904665 86.391919,200.391919 C86.391919,136.879173 137.879173,85.391919 201.391919,85.391919 Z M200.891919,89.391919 C139.864454,89.391919 90.391919,138.864454 90.391919,199.891919 C90.391919,260.919384 139.864454,310.391919 200.891919,310.391919 C261.919384,310.391919 311.391919,260.919384 311.391919,199.891919 C311.391919,138.864454 261.919384,89.391919 200.891919,89.391919 Z"
            id="ring"
            fill="#FFFFFF"
            opacity={0.2}
          />
          <g
            id="arrow"
            transform="translate(274.095454, 200.095454) rotate(-45.000000) translate(-274.095454, -200.095454) translate(211.095454, 137.095454)"
            fill={arrows.get('E').color}
            fillOpacity={arrows.get('E').opacity}
            onMouseOver={() => onArrowOver('E')}
            onMouseOut={() => onArrowOut('E')}
            onMouseDown={() => onArrowDown('E')}
          >
            <path
              d="M126.002806,70.007765 L126,118 C126,122.418278 122.418278,126 118,126 L70.007765,126.002806 C94.0529468,113.708961 113.708961,94.0529468 126.002806,70.007765 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(252.595454, 148.595454) rotate(-90.000000) translate(-252.595454, -148.595454) translate(189.095454, 85.095454)"
            fill={arrows.get('NE').color}
            fillOpacity={arrows.get('NE').opacity}
            onMouseOver={() => onArrowOver('NE')}
            onMouseOut={() => onArrowOut('NE')}
            onMouseDown={() => onArrowDown('NE')}
          >
            <path
              d="M127.003324,70.5624128 L127,119 C127,123.418278 123.418278,127 119,127 L70.5624128,127.003324 C94.7991936,114.611776 114.611776,94.7991936 127.003324,70.5624128 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(201.095454, 127.095454) rotate(-135.000000) translate(-201.095454, -127.095454) translate(138.095454, 64.095454)"
            fill={arrows.get('N').color}
            fillOpacity={arrows.get('N').opacity}
            onMouseOver={() => onArrowOver('N')}
            onMouseOut={() => onArrowOut('N')}
            onMouseDown={() => onArrowDown('N')}
          >
            <path
              d="M126.002806,70.007765 L126,118 C126,122.418278 122.418278,126 118,126 L70.007765,126.002806 C94.0529468,113.708961 113.708961,94.0529468 126.002806,70.007765 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(149.595454, 148.595454) rotate(-180.000000) translate(-149.595454, -148.595454) translate(86.095454, 85.095454)"
            fill={arrows.get('NW').color}
            fillOpacity={arrows.get('NW').opacity}
            onMouseOver={() => onArrowOver('NW')}
            onMouseOut={() => onArrowOut('NW')}
            onMouseDown={() => onArrowDown('NW')}
          >
            <path
              d="M127.003324,70.5624128 L127,119 C127,123.418278 123.418278,127 119,127 L70.5624128,127.003324 C94.7991936,114.611776 114.611776,94.7991936 127.003324,70.5624128 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(128.095454, 200.095454) rotate(-225.000000) translate(-128.095454, -200.095454) translate(65.095454, 137.095454)"
            fill={arrows.get('W').color}
            fillOpacity={arrows.get('W').opacity}
            onMouseOver={() => onArrowOver('W')}
            onMouseOut={() => onArrowOut('W')}
            onMouseDown={() => onArrowDown('W')}
          >
            <path
              d="M126.002806,70.007765 L126,118 C126,122.418278 122.418278,126 118,126 L70.007765,126.002806 C94.0529468,113.708961 113.708961,94.0529468 126.002806,70.007765 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(149.595454, 251.595454) rotate(-270.000000) translate(-149.595454, -251.595454) translate(86.095454, 188.095454)"
            fill={arrows.get('SW').color}
            fillOpacity={arrows.get('SW').opacity}
            onMouseOver={() => onArrowOver('SW')}
            onMouseOut={() => onArrowOut('SW')}
            onMouseDown={() => onArrowDown('SW')}
          >
            <path
              d="M127.003324,70.5624128 L127,119 C127,123.418278 123.418278,127 119,127 L70.5624128,127.003324 C94.7991936,114.611776 114.611776,94.7991936 127.003324,70.5624128 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(201.095454, 273.095454) rotate(-315.000000) translate(-201.095454, -273.095454) translate(138.095454, 210.095454)"
            fill={arrows.get('S').color}
            fillOpacity={arrows.get('S').opacity}
            onMouseOver={() => onArrowOver('S')}
            onMouseOut={() => onArrowOut('S')}
            onMouseDown={() => onArrowDown('S')}
          >
            <path
              d="M126.002806,70.007765 L126,118 C126,122.418278 122.418278,126 118,126 L70.007765,126.002806 C94.0529468,113.708961 113.708961,94.0529468 126.002806,70.007765 Z"
              id="Combined-Shape"
            />
          </g>
          <g
            id="arrow"
            transform="translate(252.595454, 251.595454) rotate(-360.000000) translate(-252.595454, -251.595454) translate(189.095454, 188.095454)"
            fill={arrows.get('SE').color}
            fillOpacity={arrows.get('SE').opacity}
            onMouseOver={() => onArrowOver('SE')}
            onMouseOut={() => onArrowOut('SE')}
            onMouseDown={() => onArrowDown('SE')}
          >
            <path
              d="M127.003324,70.5624128 L127,119 C127,123.418278 123.418278,127 119,127 L70.5624128,127.003324 C94.7991936,114.611776 114.611776,94.7991936 127.003324,70.5624128 Z"
              id="Combined-Shape"
            />
          </g>
          <path
            d="M336.767062,336.174604 L348.235558,347.337772 C305.631105,372.745196 255.518965,387.391919 201.891919,387.391919 C148.525392,387.391919 98.6397049,372.887158 56.1697278,347.707297 L60.4582005,343.533748 C99.2317977,365.627875 144.367306,378.291919 192.541919,378.291919 C245.835852,378.291919 295.410454,362.793355 336.767062,336.174604 Z"
            id="speedometer-back"
            fill="#343434"
          />
          <path
            d="M58.7183622,342.647943 C88.2150955,359.98867 121.368682,371.768047 156.741345,376.546996 L155.415608,384.594928 C118.916403,378.56617 84.7698028,365.555103 54.391019,346.978219 L58.7183622,342.647943 Z"
            id="speed-slow"
            fill={speed === 1 ? ACTIVE_SPEED : TRANSPARENT}

          />
          <path
            d="M60.6746477,343.374292 C99.5100931,365.569228 144.749582,378.296099 193.043982,378.296099 C211.507238,378.296099 229.523994,376.435963 246.90711,372.897784 L248.755155,383.68024 C233.673688,386.121599 218.185265,387.391919 202.391919,387.391919 C148.907002,387.391919 98.9191562,372.822994 56.3912484,347.541131 L60.6746477,343.374292 Z"
            id="speed-med"
            fill={speed === 2 ? ACTIVE_SPEED : TRANSPARENT}

          />
          <path
            d="M336.767062,336.174604 L348.235558,347.337772 C305.631105,372.745196 255.518965,387.391919 201.891919,387.391919 C148.525392,387.391919 98.6397049,372.887158 56.1697278,347.707297 L60.4582005,343.533748 C99.2317977,365.627875 144.367306,378.291919 192.541919,378.291919 C245.835852,378.291919 295.410454,362.793355 336.767062,336.174604 Z"
            id="speed-fast"
            fill={speed >= 3 ? ACTIVE_SPEED : TRANSPARENT}

          />
          <polygon
            id="speed-slow-hit"
            fill={TRANSPARENT}
            points="80 343.095454 61.0954544 365.095454 143.781879 397.382782 162.292315 361.595454"
            onMouseDown={(e) => {
              setSpeed(1);
            }}
          />
          <polygon
            id="speed-fast-hit"
            fill={TRANSPARENT}
            transform="translate(287.598430, 370.143664) scale(-1, 1) translate(-287.598430, -370.143664) "
            points="255.904546 343 237 365 319.686424 397.287327 338.196861 361.5"
            onMouseDown={(e) => {
              setSpeed(3);
            }}
          />
          <polygon
            id="speed-med-hit"
            fill={TRANSPARENT}
            points="252.595454 397.287327 243.500929 360 160 361.891919 146.707532 397.382782"
            onMouseDown={(e) => {
              setSpeed(2);
            }}
          />
          <g
            transform="translate(47.095454, 326.095454)"
            fill="#560000"
            stroke={speed === 0 ? ACTIVE_SPEED : 'black'}
            strokeWidth={3}
            onMouseDown={(e) => {
              e.stopPropagation();
              console.log('setting speed to 0');
              setSpeed(0);
              console.log('done setting speed to 0');
            }}
          >
            <circle id="speed-slow" cx={14} cy={14} r={14} />
          </g>
          <g
            transform="translate(327.095454, 326.095454)"
            fill="#7ED321"
            stroke={speed === 4 ? ACTIVE_SPEED : 'black'}
            strokeWidth={3}
            onMouseDown={() => setSpeed(4)}
          >
            <circle id="speed-max" cx={14} cy={14} r={14} />
          </g>
        </g>
      </svg>
    );
  }
}

export default SvgControlsUnified;
