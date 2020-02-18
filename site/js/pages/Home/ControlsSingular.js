import React, { PureComponent } from 'react';
import _ from 'lodash';

const ACTIVE_SPEED = '#C9A600';
const TRANSPARENT = 'rgba(0,0,0,0)';

const ARROW_STROKE_COLOR = 'rgba(255,255,255,0.25';
const ARROW_STROKE_COLOR_ACTIVE = 'rgb(0,0,0)';
const ARROW_STROKE_COLOR_OVER = 'rgb(128,0,0)';

const ARROW_FILL_COLOR = 'rgba(0,0,0,0)';
const ARROW_FILL_COLOR_ACTIVE = 'rgba(255,225,102,0.5)';
const ARROW_FILL_COLOR_OVER = 'rgb(0,0,200)';
const ARROW_FILL_COLOR_OVER_STOP = 'rgb(51,0,0)';

const SPEED_FILL_ACTIVE = 'rgb(240,167,0)';
const SPEED_FILL = 'rgb(2,0,38)';

const ZOOM_STROKE = 'rgba(200,255,220, 1)';
const ZOOM_STROKE_OFF = 'rgba(200,255,220, 0.05)';
const ZOOM_DELAY = 25;
const ZOOMS = 10;

class SvgControlsSingular extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      zoomHover: false, zoomIndex: 0, lastZoomTime: 0, hoverSpeed: -1, hoverArrow: '',
    };

    this.zoomOver = this.zoomOver.bind(this);
    this.incZoom = this.incZoom.bind(this);
    this.zoomOut = this.zoomOut.bind(this);

    this.over = this.over.bind(this);
    this.out = this.out.bind(this);
    this.down = this.down.bind(this);
  }

  zoomOver() {
    this.setState({ zoomHover: true }, this.incZoom);
  }

  zoomOut() {
    this.setState({ zoomHover: false });
  }

  incZoom() {
    if (this.state.zoomHover) {
      const lastZoomed = Date.now() - this.state.lastZoomTime;
      if (lastZoomed >= ZOOM_DELAY) {
        const zoomIndex = (this.state.zoomIndex + 1) % ZOOMS;
        this.setState({ zoomIndex, lastZoomTime: Date.now() }, this.incZoom);
      } else {
        requestAnimationFrame(this.incZoom);
      }
    }
  }

  zoomStroke(n) {
    if (!this.state.zoomHover || (this.state.zoomIndex !== n)) {
      return ZOOM_STROKE_OFF;
    }
    return ZOOM_STROKE;
  }

  noE(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (e && e.preventDefault) {
      e.preventDefault();
    }
  }

  over(hoverArrow, hoverSpeed, e) {
    this.setState({ hoverArrow, hoverSpeed });
    this.noE(e);
  }

  down(hoverArrow, hoverSpeed, e) {
    this.setState({ hoverArrow, hoverSpeed });
    this.props.onArrowDown(hoverArrow);
    this.props.setSpeed(hoverSpeed);
    this.noE(e);
  }

  out(hoverArrow, e) {
    this.setState({ hoverArrow: '', hoverSpeed: -1 });
    this.noE(e);
  }

  strokeColor(dir, speed) {
    const arrow = this.props.arrows.get(dir);
    if (dir === this.state.hoverArrow) {
      return ARROW_STROKE_COLOR_OVER;
    }
    if (!arrow) {
      return ARROW_STROKE_COLOR;
    }
    if (arrow.active && (speed <= this.props.speed)) {
      return ARROW_STROKE_COLOR_ACTIVE;
    }
    if (arrow.over && (speed <= this.state.hoverSpeed)) {
      return ARROW_STROKE_COLOR_OVER;
    }
    return ARROW_STROKE_COLOR;
  }

  fillColor(dir, speed) {
    const arrow = this.props.arrows.get(dir);
    if (dir === this.state.hoverArrow) {
      if (this.state.hoverSpeed >= speed) {
        return ARROW_FILL_COLOR_OVER;
      }
    }
    if (!arrow) {
      return ARROW_FILL_COLOR;
    }
    if (arrow.active && speed > 0 && this.props.speed >= speed) {
      return ARROW_FILL_COLOR_ACTIVE;
    }
    if (arrow.over) {
      return ARROW_FILL_COLOR_OVER;
    }
    if (speed === 0 && this.props.speed === 0) {
      return ARROW_FILL_COLOR_OVER_STOP;
    }
    return ARROW_FILL_COLOR;
  }

  speedFill(speed) {
    return (this.props.speed >= speed) ? SPEED_FILL_ACTIVE : SPEED_FILL;
  }

  render() {
    const {
      arrows, speed, setSpeed, onArrowDown, zoom,
    } = this.props;
    return (
      <svg width="400px" height="400px" viewBox="0 0 400 400">
        <g
          id="controls-singular"
          stroke="none"
          strokeWidth={1}
          fill="none"
          fillRule="evenodd"
        >
          <path
            d="M198.999605,110.01571 C192.408617,110.01571 188.231558,108.000182 185.931185,104.130941 C184.138341,101.115366 183.565509,97.4595393 183.507458,91.4716417 C183.501098,90.8155261 183.499863,90.2905873 183.499984,89.1173601 C183.499996,88.9981381 183.499996,88.9981381 183.5,88.8790806 C183.5,82.2175822 188.529455,71.1933972 198.580859,55.7275327 L199.001436,55.0804005 L199.420128,55.7287535 C209.55548,71.423533 214.583897,82.4462641 214.499036,88.8856692 C214.496542,89.0748491 214.494705,89.2227382 214.490582,89.5618888 C214.471175,91.1599398 214.459519,91.8503557 214.431742,92.7347485 C214.261902,98.1422234 213.560405,101.700583 211.70155,104.540579 C209.348366,108.135818 205.267871,110.01571 198.999605,110.01571 Z"
            id="N-3"
            stroke={this.strokeColor('N', 3)}
            fill={this.fillColor('N', 3)}
            strokeLinejoin="round"
            onMouseOver={() => this.over('N', 3)}
            onMouseOut={() => this.out('N')}
            onMouseDown={(e) => this.down('N', 3, e)}
          />
          <path
            d="M199.5,110.5 C192.373815,110.5 186.5,104.332904 186.5,97 C186.5,92.4466212 190.272838,84.0679894 197.820103,71.7630165 C197.978567,71.5046578 198.193678,71.2856933 198.449183,71.1226668 C199.38035,70.5285286 200.616855,70.8017448 201.210993,71.7329125 C209.071512,84.0523698 213.000617,92.4392905 213.000617,97 C213.000617,104.243781 206.712236,110.5 199.5,110.5 Z"
            id="N-2"
            stroke={this.strokeColor('N', 2)}
            fill={this.fillColor('N', 2)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('N', 2, e)}
            onMouseOut={(e) => this.out('N', e)}
            onMouseDown={(e) => this.down('N', 2, e)}
          />
          <path
            d="M199.823316,110.5 C195.089705,110.5 190.5,105.609752 190.5,101.5 C190.5,97.708141 191.143616,95.3293273 193.103132,92.5376107 C194.081347,91.1439496 195.697542,88.8795728 197.952293,85.7436509 C198.065061,85.5868127 198.195627,85.4435728 198.341376,85.3167983 C199.383146,84.4106578 200.962239,84.5206084 201.868374,85.5623798 C204.53403,88.6270268 206.358694,90.9565745 207.348257,92.5625745 C209.089556,95.3885966 209.5,97.1843376 209.5,101.5 C209.5,105.970526 204.794807,110.5 199.823316,110.5 Z"
            id="N-1"
            stroke={this.strokeColor('N', 1)}
            fill={this.fillColor('N', 1)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('N', 1, e)}
            onMouseOut={(e) => this.out('N', e)}
            onMouseDown={(e) => this.down('N', 1, e)}
          />
          <circle
            id="N-0"
            stroke={this.strokeColor('N', 0)}
            fill={this.fillColor('N', 0)}
            strokeLinejoin="round"
            cx={200}
            cy={104}
            r={6.5}
            onMouseOver={(e) => this.over('N', 0, e)}
            onMouseOut={(e) => this.out('N', e)}
            onMouseDown={(e) => this.down('N', 0, e)}
          />
          <path
            d="M283.061686,144.610008 C276.470698,144.610008 272.293638,142.59448 269.993265,138.725239 C268.200421,135.709664 267.62759,132.053837 267.569539,126.06594 C267.563178,125.409824 267.561944,124.884885 267.562064,123.711658 C267.562077,123.592436 267.562077,123.592436 267.562081,123.473378 C267.562081,116.81188 272.591536,105.787695 282.64294,90.3218305 L283.063517,89.6746984 L283.482209,90.3230514 C293.61756,106.017831 298.645978,117.040562 298.561116,123.479967 C298.558623,123.669147 298.556786,123.817036 298.552663,124.156187 C298.533256,125.754238 298.5216,126.444654 298.493822,127.329046 C298.323983,132.736521 297.622486,136.294881 295.76363,139.134877 C293.410447,142.730116 289.329952,144.610008 283.061686,144.610008 Z"
            id="NE-3"
            stroke={this.strokeColor('NE', 3)}
            fill={this.fillColor('NE', 3)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('NE', 3, e)}
            onMouseOut={(e) => this.out('NE', e)}
            onMouseDown={(e) => this.down('NE', 3, e)}
            transform="translate(283.062130, 117.352153) rotate(45.000000) translate(-283.062130, -117.352153) "
          />
          <path
            d="M277.514305,142.796576 C270.388119,142.796576 264.514305,136.62948 264.514305,129.296576 C264.514305,124.743197 268.287143,116.364565 275.834407,104.059592 C275.992872,103.801234 276.207983,103.582269 276.463487,103.419243 C277.394655,102.825105 278.63116,103.098321 279.225298,104.029488 C287.085817,116.348946 291.014922,124.735866 291.014922,129.296576 C291.014922,136.540357 284.726541,142.796576 277.514305,142.796576 Z"
            id="NE-2"
            stroke={this.strokeColor('NE', 2)}
            fill={this.fillColor('NE', 2)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('NE', 2, e)}
            onMouseOut={(e) => this.out('NE', e)}
            onMouseDown={(e) => this.down('NE', 2, e)}
            transform="translate(277.764613, 122.296576) rotate(45.000000) translate(-277.764613, -122.296576) "
          />
          <path
            d="M272.81474,140.922882 C268.081129,140.922882 263.491424,136.032634 263.491424,131.922882 C263.491424,128.131023 264.13504,125.752209 266.094556,122.960493 C267.072771,121.566831 268.688966,119.302455 270.943717,116.166533 C271.056485,116.009694 271.187051,115.866455 271.332801,115.73968 C272.374571,114.83354 273.953664,114.94349 274.859798,115.985262 C277.525455,119.049909 279.350118,121.379456 280.339681,122.985456 C282.08098,125.811478 282.491424,127.607219 282.491424,131.922882 C282.491424,136.393408 277.786232,140.922882 272.81474,140.922882 Z"
            id="NE-1"
            stroke="#4A4A4A"
            fill="#6E6E6E"
            stroke={this.strokeColor('NE', 1)}
            fill={this.fillColor('NE', 1)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('NE', 1, e)}
            onMouseOut={(e) => this.out('NE', e)}
            onMouseDown={(e) => this.down('NE', 1, e)}
            transform="translate(272.991424, 127.422882) rotate(45.000000) translate(-272.991424, -127.422882) "
          />
          <circle
            id="NE-0"
            stroke={this.strokeColor('NE', 0)}
            fill={this.fillColor('NE', 0)}
            strokeLinejoin="round"
            onMouseOver={(e) => this.over('NE', 0, e)}
            onMouseOut={(e) => this.out('NE', e)}
            onMouseDown={(e) => this.down('NE', 0, e)}
            transform="translate(268.041677, 132.372629) rotate(45.000000) translate(-268.041677, -132.372629) "
            cx={268.041677}
            cy={132.372629}
            r={6.5}
          />
          <path
            d="M317.999605,227.01571 C311.408617,227.01571 307.231558,225.000182 304.931185,221.130941 C303.138341,218.115366 302.565509,214.459539 302.507458,208.471642 C302.501098,207.815526 302.499863,207.290587 302.499984,206.11736 C302.499996,205.998138 302.499996,205.998138 302.5,205.879081 C302.5,199.217582 307.529455,188.193397 317.580859,172.727533 L318.001436,172.080401 L318.420128,172.728754 C328.55548,188.423533 333.583897,199.446264 333.499036,205.885669 C333.496542,206.074849 333.494705,206.222738 333.490582,206.561889 C333.471175,208.15994 333.459519,208.850356 333.431742,209.734749 C333.261902,215.142223 332.560405,218.700583 330.70155,221.540579 C328.348366,225.135818 324.267871,227.01571 317.999605,227.01571 Z"
            id="E-3"
            stroke={this.strokeColor('E', 3)}
            fill={this.fillColor('E', 3)}
            onMouseOver={(e) => this.over('E', 3, e)}
            onMouseOut={(e) => this.out('E', e)}
            onMouseDown={(e) => this.down('E', 3, e)}
            strokeLinejoin="round"
            transform="translate(318.000049, 199.757855) rotate(90.000000) translate(-318.000049, -199.757855) "
          />
          <path
            d="M310.5,220.5 C303.373815,220.5 297.5,214.332904 297.5,207 C297.5,202.446621 301.272838,194.067989 308.820103,181.763016 C308.978567,181.504658 309.193678,181.285693 309.449183,181.122667 C310.38035,180.528529 311.616855,180.801745 312.210993,181.732912 C320.071512,194.05237 324.000617,202.439291 324.000617,207 C324.000617,214.243781 317.712236,220.5 310.5,220.5 Z"
            id="E-2"
            stroke={this.strokeColor('E', 2)}
            fill={this.fillColor('E', 2)}
            onMouseOver={() => this.over('E', 2)}
            onMouseOut={() => this.out('E')}
            onMouseDown={() => {
              onArrowDown('E');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(310.750309, 200.000000) rotate(90.000000) translate(-310.750309, -200.000000) "
          />
          <path
            d="M303.823316,213.5 C299.089705,213.5 294.5,208.609752 294.5,204.5 C294.5,200.708141 295.143616,198.329327 297.103132,195.537611 C298.081347,194.14395 299.697542,191.879573 301.952293,188.743651 C302.065061,188.586813 302.195627,188.443573 302.341376,188.316798 C303.383146,187.410658 304.962239,187.520608 305.868374,188.56238 C308.53403,191.627027 310.358694,193.956574 311.348257,195.562574 C313.089556,198.388597 313.5,200.184338 313.5,204.5 C313.5,208.970526 308.794807,213.5 303.823316,213.5 Z"
            id="E-1"
            stroke={this.strokeColor('E', 1)}
            fill={this.fillColor('E', 1)}
            onMouseOver={() => this.over('E', 1)}
            onMouseOut={() => this.out('E')}
            onMouseDown={() => {
              onArrowDown('E');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(304.000000, 200.000000) rotate(90.000000) translate(-304.000000, -200.000000) "
          />
          <circle
            id="E-0"
            stroke={this.strokeColor('E', 0)}
            fill={this.fillColor('E', 0)}
            onMouseOver={() => this.over('E', 0)}
            onMouseOut={() => this.out('E', 0)}
            onMouseDown={() => {
              onArrowDown('E');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(297.000000, 200.000000) rotate(90.000000) translate(-297.000000, -200.000000) "
            cx={297}
            cy={200}
            r={6.5}
          />
          <path
            d="M283.647403,310.319985 C277.056415,310.319985 272.879355,308.304457 270.578982,304.435216 C268.786138,301.419641 268.213307,297.763814 268.155256,291.775916 C268.148895,291.119801 268.147661,290.594862 268.147781,289.421635 C268.147794,289.302413 268.147794,289.302413 268.147798,289.183355 C268.147798,282.521857 273.177253,271.497672 283.228657,256.031807 L283.649234,255.384675 L284.067926,256.033028 C294.203277,271.727808 299.231695,282.750539 299.146833,289.189944 C299.14434,289.379124 299.142503,289.527013 299.138379,289.866164 C299.118973,291.464214 299.107317,292.15463 299.079539,293.039023 C298.9097,298.446498 298.208203,302.004858 296.349347,304.844854 C293.996164,308.440093 289.915669,310.319985 283.647403,310.319985 Z"
            id="SE-3"
            stroke={this.strokeColor('SE', 3)}
            fill={this.fillColor('SE', 3)}
            onMouseOver={() => this.over('SE', 3)}
            onMouseOut={() => this.out('SE', 3)}
            onMouseDown={() => {
              onArrowDown('SE');
              setSpeed(3);
            }}
            strokeLinejoin="round"
            transform="translate(283.647847, 283.062130) rotate(135.000000) translate(-283.647847, -283.062130) "
          />
          <path
            d="M278.453115,298.264613 C271.32693,298.264613 265.453115,292.097518 265.453115,284.764613 C265.453115,280.211235 269.225954,271.832603 276.773218,259.52763 C276.931683,259.269271 277.146793,259.050307 277.402298,258.88728 C278.333465,258.293142 279.56997,258.566358 280.164109,259.497526 C288.024628,271.816983 291.953733,280.203904 291.953733,284.764613 C291.953733,292.008394 285.665351,298.264613 278.453115,298.264613 Z"
            id="SE-2"
            stroke={this.strokeColor('SE', 2)}
            fill={this.fillColor('SE', 2)}
            onMouseOver={() => this.over('SE', 2)}
            onMouseOut={() => this.out('SE', 2)}
            onMouseDown={() => {
              onArrowDown('SE');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(278.703424, 277.764613) rotate(135.000000) translate(-278.703424, -277.764613) "
          />
          <path
            d="M273.400434,286.491424 C268.666823,286.491424 264.077118,281.601177 264.077118,277.491424 C264.077118,273.699565 264.720734,271.320752 266.68025,268.529035 C267.658465,267.135374 269.27466,264.870997 271.529411,261.735075 C271.642179,261.578237 271.772745,261.434997 271.918495,261.308223 C272.960265,260.402082 274.539358,260.512033 275.445492,261.553804 C278.111148,264.618451 279.935812,266.947999 280.925375,268.553999 C282.666674,271.380021 283.077118,273.175762 283.077118,277.491424 C283.077118,281.961951 278.371926,286.491424 273.400434,286.491424 Z"
            id="SE-1"
            stroke={this.strokeColor('SE', 1)}
            fill={this.fillColor('SE', 1)}
            onMouseOver={() => this.over('SE', 1)}
            onMouseOut={() => this.out('SE', 1)}
            onMouseDown={() => {
              onArrowDown('SE');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(273.577118, 272.991424) rotate(135.000000) translate(-273.577118, -272.991424) "
          />
          <circle
            id="SE-0"
            stroke={this.strokeColor('SE', 0)}
            fill={this.fillColor('SE', 0)}
            onMouseOver={() => this.over('SE', 0)}
            onMouseOut={() => this.out('SE', 0)}
            onMouseDown={() => {
              onArrowDown('SE');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(268.627371, 268.041677) rotate(135.000000) translate(-268.627371, -268.041677) "
            cx={268.627371}
            cy={268.041677}
            r={6.5}
          />
          <path
            d="M82.999605,227.01571 C76.4086174,227.01571 72.2315577,225.000182 69.9311847,221.130941 C68.1383406,218.115366 67.5655088,214.459539 67.5074583,208.471642 C67.5010975,207.815526 67.4998631,207.290587 67.4999837,206.11736 C67.4999959,205.998138 67.4999959,205.998138 67.5,205.879081 C67.5,199.217582 72.529455,188.193397 82.580859,172.727533 L83.0014359,172.080401 L83.4201284,172.728754 C93.5554797,188.423533 98.5838968,199.446264 98.4990356,205.885669 C98.4965425,206.074849 98.4947052,206.222738 98.4905817,206.561889 C98.4711748,208.15994 98.459519,208.850356 98.4317417,209.734749 C98.261902,215.142223 97.5604053,218.700583 95.7015495,221.540579 C93.3483662,225.135818 89.267871,227.01571 82.999605,227.01571 Z"
            id="W-3"
            stroke={this.strokeColor('W', 3)}
            fill={this.fillColor('W', 3)}
            onMouseOver={() => this.over('W', 3)}
            onMouseOut={() => this.out('W', 3)}
            onMouseDown={() => {
              onArrowDown('W');
              setSpeed(3);
            }}
            strokeLinejoin="round"
            transform="translate(83.000049, 199.757855) rotate(-90.000000) translate(-83.000049, -199.757855) "
          />
          <path
            d="M89.5,220.5 C82.3738148,220.5 76.5,214.332904 76.5,207 C76.5,202.446621 80.2728382,194.067989 87.8201027,181.763016 C87.9785672,181.504658 88.1936781,181.285693 88.4491825,181.122667 C89.3803502,180.528529 90.6168549,180.801745 91.2109935,181.732912 C99.0715123,194.05237 103.000617,202.439291 103.000617,207 C103.000617,214.243781 96.712236,220.5 89.5,220.5 Z"
            id="W-2"
            stroke={this.strokeColor('W', 2)}
            fill={this.fillColor('W', 2)}
            onMouseOver={() => this.over('W', 2)}
            onMouseOut={() => this.out('W', 2)}
            onMouseDown={() => {
              onArrowDown('W');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(89.750309, 200.000000) rotate(-90.000000) translate(-89.750309, -200.000000) "
          />
          <path
            d="M96.8233158,213.5 C92.0897051,213.5 87.5,208.609752 87.5,204.5 C87.5,200.708141 88.1436161,198.329327 90.1031316,195.537611 C91.0813471,194.14395 92.6975421,191.879573 94.9522932,188.743651 C95.065061,188.586813 95.1956265,188.443573 95.3413764,188.316798 C96.3831463,187.410658 97.9622393,187.520608 98.8683739,188.56238 C101.53403,191.627027 103.358694,193.956574 104.348257,195.562574 C106.089556,198.388597 106.5,200.184338 106.5,204.5 C106.5,208.970526 101.794807,213.5 96.8233158,213.5 Z"
            id="W-1"
            stroke={this.strokeColor('W', 1)}
            fill={this.fillColor('W', 1)}
            onMouseOver={() => this.over('W', 1)}
            onMouseOut={() => this.out('W', 1)}
            onMouseDown={() => {
              onArrowDown('W');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(97.000000, 200.000000) rotate(-90.000000) translate(-97.000000, -200.000000) "
          />
          <circle
            id="W-0"
            stroke={this.strokeColor('W', 0)}
            fill={this.fillColor('W', 0)}
            onMouseOver={() => this.over('W', 0)}
            onMouseOut={() => this.out('W', 0)}
            onMouseDown={() => {
              onArrowDown('W');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(104.000000, 200.000000) rotate(-90.000000) translate(-104.000000, -200.000000) "
            cx={104}
            cy={200}
            r={6.5}
          />
          <path
            d="M117.351709,144.195725 C110.760721,144.195725 106.583662,142.180197 104.283289,138.310956 C102.490445,135.295381 101.917613,131.639554 101.859562,125.651657 C101.853202,124.995541 101.851967,124.470602 101.852088,123.297375 C101.8521,123.178153 101.8521,123.178153 101.852104,123.059095 C101.852104,116.397597 106.881559,105.373412 116.932963,89.9075475 L117.35354,89.2604154 L117.772232,89.9087684 C127.907584,105.603548 132.936001,116.626279 132.85114,123.065684 C132.848646,123.254864 132.846809,123.402753 132.842686,123.741904 C132.823279,125.339955 132.811623,126.030371 132.783846,126.914763 C132.614006,132.322238 131.912509,135.880598 130.053654,138.720594 C127.70047,142.315833 123.619975,144.195725 117.351709,144.195725 Z"
            id="NW-3"
            stroke={this.strokeColor('NW', 3)}
            fill={this.fillColor('NW', 3)}
            onMouseOver={() => this.over('NW', 3)}
            onMouseOut={() => this.out('NW', 3)}
            onMouseDown={() => {
              onArrowDown('NW');
              setSpeed(3);
            }}
            strokeLinejoin="round"
            transform="translate(117.352153, 116.937870) rotate(-45.000000) translate(-117.352153, -116.937870) "
          />
          <path
            d="M122.046267,142.735387 C114.920082,142.735387 109.046267,136.568291 109.046267,129.235387 C109.046267,124.682008 112.819105,116.303376 120.36637,103.998403 C120.524834,103.740044 120.739945,103.52108 120.99545,103.358053 C121.926617,102.763915 123.163122,103.037131 123.757261,103.968299 C131.61778,116.287756 135.546885,124.674677 135.546885,129.235387 C135.546885,136.479167 129.258503,142.735387 122.046267,142.735387 Z"
            id="NW-2"
            stroke={this.strokeColor('NW', 2)}
            fill={this.fillColor('NW', 2)}
            onMouseOver={() => this.over('NW', 2)}
            onMouseOut={() => this.out('NW', 2)}
            onMouseDown={() => {
              onArrowDown('NW');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(122.296576, 122.235387) rotate(-45.000000) translate(-122.296576, -122.235387) "
          />
          <path
            d="M127.246198,140.508576 C122.512587,140.508576 117.922882,135.618328 117.922882,131.508576 C117.922882,127.716717 118.566498,125.337903 120.526013,122.546186 C121.504229,121.152525 123.120424,118.888148 125.375175,115.752227 C125.487943,115.595388 125.618508,115.452148 125.764258,115.325374 C126.806028,114.419234 128.385121,114.529184 129.291256,115.570955 C131.956912,118.635602 133.781576,120.96515 134.771139,122.57115 C136.512438,125.397172 136.922882,127.192913 136.922882,131.508576 C136.922882,135.979102 132.217689,140.508576 127.246198,140.508576 Z"
            id="NW-1"
            stroke={this.strokeColor('NW', 1)}
            fill={this.fillColor('NW', 1)}
            onMouseOver={() => this.over('NW', 1)}
            onMouseOut={() => this.out('NW', 1)}
            onMouseDown={() => {
              onArrowDown('NW');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(127.422882, 127.008576) rotate(-45.000000) translate(-127.422882, -127.008576) "
          />
          <circle
            id="NW-0"
            stroke={this.strokeColor('NW', 0)}
            fill={this.fillColor('NW', 0)}
            onMouseOver={() => this.over('NW', 0)}
            onMouseOut={() => this.out('NW', 0)}
            onMouseDown={() => {
              onArrowDown('NW');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(132.372629, 131.958323) rotate(-45.000000) translate(-132.372629, -131.958323) "
            cx={132.372629}
            cy={131.958323}
            r={6.5}
          />
          <path
            d="M198.999605,345.01571 C192.408617,345.01571 188.231558,343.000182 185.931185,339.130941 C184.138341,336.115366 183.565509,332.459539 183.507458,326.471642 C183.501098,325.815526 183.499863,325.290587 183.499984,324.11736 C183.499996,323.998138 183.499996,323.998138 183.5,323.879081 C183.5,317.217582 188.529455,306.193397 198.580859,290.727533 L199.001436,290.080401 L199.420128,290.728754 C209.55548,306.423533 214.583897,317.446264 214.499036,323.885669 C214.496542,324.074849 214.494705,324.222738 214.490582,324.561889 C214.471175,326.15994 214.459519,326.850356 214.431742,327.734749 C214.261902,333.142223 213.560405,336.700583 211.70155,339.540579 C209.348366,343.135818 205.267871,345.01571 198.999605,345.01571 Z"
            id="S-3"
            stroke={this.strokeColor('S', 3)}
            fill={this.fillColor('S', 3)}
            onMouseOver={() => this.over('S', 3)}
            onMouseOut={() => this.out('S', 3)}
            onMouseDown={() => {
              onArrowDown('S');
              setSpeed(3);
            }}
            strokeLinejoin="round"
            transform="translate(199.000049, 317.757855) rotate(180.000000) translate(-199.000049, -317.757855) "
          />
          <path
            d="M199.5,331.5 C192.373815,331.5 186.5,325.332904 186.5,318 C186.5,313.446621 190.272838,305.067989 197.820103,292.763016 C197.978567,292.504658 198.193678,292.285693 198.449183,292.122667 C199.38035,291.528529 200.616855,291.801745 201.210993,292.732912 C209.071512,305.05237 213.000617,313.439291 213.000617,318 C213.000617,325.243781 206.712236,331.5 199.5,331.5 Z"
            id="S-2"
            stroke={this.strokeColor('S', 2)}
            fill={this.fillColor('S', 2)}
            onMouseOver={() => this.over('S', 2)}
            onMouseOut={() => this.out('S', 2)}
            onMouseDown={() => {
              onArrowDown('S');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(199.750309, 311.000000) rotate(180.000000) translate(-199.750309, -311.000000) "
          />
          <path
            d="M199.823316,317.5 C195.089705,317.5 190.5,312.609752 190.5,308.5 C190.5,304.708141 191.143616,302.329327 193.103132,299.537611 C194.081347,298.14395 195.697542,295.879573 197.952293,292.743651 C198.065061,292.586813 198.195627,292.443573 198.341376,292.316798 C199.383146,291.410658 200.962239,291.520608 201.868374,292.56238 C204.53403,295.627027 206.358694,297.956574 207.348257,299.562574 C209.089556,302.388597 209.5,304.184338 209.5,308.5 C209.5,312.970526 204.794807,317.5 199.823316,317.5 Z"
            id="S-1"
            stroke={this.strokeColor('S', 1)}
            fill={this.fillColor('S', 1)}
            onMouseOver={() => this.over('S', 1)}
            onMouseOut={() => this.out('S', 1)}
            onMouseDown={() => {
              onArrowDown('S');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(200.000000, 304.000000) rotate(180.000000) translate(-200.000000, -304.000000) "
          />
          <circle
            id="S-0"
            stroke={this.strokeColor('S', 0)}
            fill={this.fillColor('S', 0)}
            onMouseOver={() => this.over('S', 0)}
            onMouseOut={() => this.out('S', 0)}
            onMouseDown={() => {
              onArrowDown('S');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(200.000000, 297.000000) rotate(180.000000) translate(-200.000000, -297.000000) "
            cx={200}
            cy={297}
            r={6.5}
          />
          <path
            d="M115.937426,310.905702 C109.346438,310.905702 105.169379,308.890174 102.869006,305.020933 C101.076162,302.005358 100.50333,298.349531 100.445279,292.361633 C100.438918,291.705518 100.437684,291.180579 100.437805,290.007352 C100.437817,289.88813 100.437817,289.88813 100.437821,289.769072 C100.437821,283.107574 105.467276,272.083389 115.51868,256.617524 L115.939257,255.970392 L116.357949,256.618745 C126.493301,272.313525 131.521718,283.336256 131.436857,289.775661 C131.434363,289.964841 131.432526,290.11273 131.428403,290.451881 C131.408996,292.049931 131.39734,292.740347 131.369563,293.62474 C131.199723,299.032215 130.498226,302.590575 128.63937,305.430571 C126.286187,309.02581 122.205692,310.905702 115.937426,310.905702 Z"
            id="SW-3"
            stroke={this.strokeColor('SW', 3)}
            fill={this.fillColor('SW', 3)}
            onMouseOver={() => this.over('SW', 3)}
            onMouseOut={() => this.out('SW', 3)}
            onMouseDown={() => {
              onArrowDown('SW');
              setSpeed(3);
            }}
            strokeLinejoin="round"
            transform="translate(115.937870, 283.647847) rotate(225.000000) translate(-115.937870, -283.647847) "
          />
          <path
            d="M120.985078,299.203424 C113.858893,299.203424 107.985078,293.036328 107.985078,285.703424 C107.985078,281.150045 111.757916,272.771413 119.305181,260.466441 C119.463645,260.208082 119.678756,259.989117 119.93426,259.826091 C120.865428,259.231953 122.101933,259.505169 122.696071,260.436337 C130.55659,272.755794 134.485695,281.142715 134.485695,285.703424 C134.485695,292.947205 128.197314,299.203424 120.985078,299.203424 Z"
            id="SW-2"
            stroke={this.strokeColor('SW', 2)}
            fill={this.fillColor('SW', 2)}
            onMouseOver={() => this.over('SW', 2)}
            onMouseOut={() => this.out('SW', 2)}
            onMouseDown={() => {
              onArrowDown('SW');
              setSpeed(2);
            }}
            strokeLinejoin="round"
            transform="translate(121.235387, 278.703424) rotate(225.000000) translate(-121.235387, -278.703424) "
          />
          <path
            d="M125.831891,287.077118 C121.098281,287.077118 116.508576,282.18687 116.508576,278.077118 C116.508576,274.285259 117.152192,271.906445 119.111707,269.114729 C120.089923,267.721068 121.706118,265.456691 123.960869,262.320769 C124.073637,262.163931 124.204202,262.020691 124.349952,261.893916 C125.391722,260.987776 126.970815,261.097727 127.87695,262.139498 C130.542606,265.204145 132.36727,267.533693 133.356832,269.139693 C135.098131,271.965715 135.508576,273.761456 135.508576,278.077118 C135.508576,282.547644 130.803383,287.077118 125.831891,287.077118 Z"
            id="SW-1"
            stroke={this.strokeColor('SW', 1)}
            fill={this.fillColor('SW', 1)}
            onMouseOver={() => this.over('SW', 1)}
            onMouseOut={() => this.out('SW', 1)}
            onMouseDown={() => {
              onArrowDown('SW');
              setSpeed(1);
            }}
            strokeLinejoin="round"
            transform="translate(126.008576, 273.577118) rotate(225.000000) translate(-126.008576, -273.577118) "
          />
          <circle
            id="SW-0"
            stroke={this.strokeColor('SW', 0)}
            fill={this.fillColor('SW', 0)}
            onMouseOver={() => this.over('SW', 0)}
            onMouseOut={() => this.out('SW', 0)}
            onMouseDown={() => {
              onArrowDown('SW');
              setSpeed(0);
            }}
            strokeLinejoin="round"
            transform="translate(130.958323, 268.627371) rotate(225.000000) translate(-130.958323, -268.627371) "
            cx={130.958323}
            cy={268.627371}
            r={6.5}
          />
          <circle id="zoom-1" stroke={this.zoomStroke(1)} cx={200} cy={200} r={20} />
          <circle id="zoom-2" stroke={this.zoomStroke(2)} cx={200} cy={200} r={25} />
          <circle id="zoom-3" stroke={this.zoomStroke(3)} cx={200} cy={200} r={30} />
          <circle id="zoom-4" stroke={this.zoomStroke(4)} cx={200} cy={200} r={40} />
          <circle id="zoom-5" stroke={this.zoomStroke(5)} cx={200} cy={200} r={50} />
          <circle id="zoom-6" stroke={this.zoomStroke(6)} cx={200} cy={200} r={60} />
          <circle id="zoom-7" stroke={this.zoomStroke(7)} cx={200} cy={200} r={70} />
          <circle id="zoom-8" stroke={this.zoomStroke(8)} cx={200} cy={200} r={80} />
          <circle
            id="zoom-9"
            fill="rgba(0,0,0,0)"
            stroke={this.zoomStroke(9)}
            cx={200}
            cy={200}
            r={90}
            onMouseDown={this.props.zoom}
            onMouseOut={this.zoomOut}
            onMouseOver={this.zoomOver}
          />

          <path
            d="M199,31 C236.867607,31 271.826319,43.4544568 300.003385,64.490619 L300.002044,66.739694 C271.889315,45.5574048 236.911127,33 199,33 C161.982967,33 127.762164,44.9720829 99.9983882,65.2554509 L99.997219,63.019712 C127.820753,42.87514 162.023583,31 199,31 Z"
            id="speed-3"
            fill={this.speedFill(3)}
            strokeWidth={0}
            onMouseDown={() => this.props.setSpeed(3)}
          />
          <path
            d="M199,31 C220.508749,31 241.079023,35.0180873 260.001144,42.3445837 L260.001951,44.4180108 C241.092323,37.0457175 220.518625,33 199,33 C161.982967,33 127.762164,44.9720829 99.9983882,65.2554509 L99.997219,63.019712 C127.820753,42.87514 162.023583,31 199,31 Z"
            id="speed-2"
            fill={this.speedFill(2)}
            strokeWidth={0}
            onMouseDown={() => this.props.setSpeed(2)}
          />
          <path
            d="M175.998638,32.5521545 L175.998898,34.5615124 C147.843272,38.4163935 121.909926,49.2475492 99.9983882,65.2554509 L99.997219,63.019712 C121.950089,47.1255713 147.874241,36.3793732 175.998638,32.5521545 Z"
            id="speed-1"
            fill={this.speedFill(1)}
            strokeWidth={0}
            onMouseDown={() => this.props.setSpeed(1)}
          />
          <path
            d="M126.997724,47.061602 L126.998185,49.1680103 C117.469991,53.6945019 108.435469,59.0914822 99.9973922,65.2561786 L99.9962199,63.0204353 C108.442471,56.905155 117.476595,51.5519213 126.997724,47.061602 Z"
            id="speed-0"
            strokeWidth={0}
            fill={this.speedFill(0)}
            onMouseDown={() => this.props.setSpeed(0)}
          />
        </g>
      </svg>
    );
  }
}

export default SvgControlsSingular;
