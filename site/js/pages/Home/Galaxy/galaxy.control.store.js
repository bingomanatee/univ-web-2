import * as PIXI from 'pixi.js';
import _N from '@wonderlandlabs/n';
import chroma from 'chroma-js';
import _ from 'lodash';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import { LY_PER_HEX, SUBSECTOR_DIV, STAR_DIV } from '../../../util/constants';

const WHITE = chroma(255, 255, 255).num();
const BLACK = chroma(0, 0, 0).num();
const BUTTON_COLOR = chroma(225, 250, 255).num();
const BUTTON_OVER_COLOR = chroma(100, 150, 255).num();
const BUTTON_DOWN_COLOR = chroma(51, 102, 204).num();
const BUTTON_ACTIVE_COLOR = chroma(204, 153, 0).num();
const PART_DISC_COLOR = chroma(204, 153, 0).num();
const PART_AXIS_COLOR = chroma(153, 0, 20).num();
const DENSITY_COLOR = chroma(153, 153, 153).num();
const DENSITY_SELECT_COLOR = chroma(255, 153, 0).num();

export default (galaxyStream, size) => {
  const stream = pixiStreamFactory({ size })
    .property('galaxyParts', [], 'array')
    .property('anchor', null)
    .property('buttonAnchor', null)
    .property('partAnchor', null)
    .property('densityAnchor', null)
    .method('centerAnchor', (s) => {
      if (s.my.anchor) {
        s.my.anchor.position = { x: s.my.width / 2, y: s.my.height / 2 };
      }
    })
    .method('initAnchor', (s) => {
      if (s.my.anchor || !s.my.app) {
        return;
      }
      console.log('gcs ... defining anchor');
      s.do.setAnchor(new PIXI.Container());
      s.do.setButtonAnchor(new PIXI.Container());
      s.do.setDensityAnchor(new PIXI.Container());
      s.do.setPartAnchor(new PIXI.Container());
      s.my.anchor.addChild(s.my.buttonAnchor);
      s.my.anchor.addChild(s.my.partAnchor);
      s.my.anchor.addChild(s.my.densityAnchor);
      s.my.app.stage.addChild(s.my.anchor);
      s.do.centerAnchor();
    })
    .property('activePartIndex', -1, 'integer')
    .property('overPartIndex', -1, 'integer')
    .property('downPartIndex', -1, 'integer')
    .watch('activePartIndex', 'drawButtons')
    .watch('activePartIndex', 'updateDDB')
    .watch('overPartIndex', 'drawButtons')
    .watch('downPartIndex', 'drawButtons')
    .method('activePart', (s) => {
      if (!Array.isArray(s.my.galaxyParts)) {
        return null;
      }
      return (s.my.activePartIndex >= 0) ? s.my.galaxyParts[s.my.activePartIndex] || null : null;
    })
    .method('drawActivePart', (s) => {
      if (!s.my.partAnchor) {
        return;
      }
      const part = s.do.activePart();
      s.my.partAnchor.removeChildren();

      if (part) {
        const graphics = new PIXI.Graphics();

        const PART_AXIS_RADIUS = s.do.radius() / 20;

        graphics.beginFill(PART_DISC_COLOR, 0.25)
          .drawCircle(0, 0, PART_AXIS_RADIUS * 1.1)
          .endFill();
        graphics.lineStyle(4, PART_AXIS_COLOR, 0.75)
          .moveTo(-PART_AXIS_RADIUS, 0)
          .lineTo(PART_AXIS_RADIUS, 0)
          .moveTo(0, PART_AXIS_RADIUS)
          .lineTo(0, -PART_AXIS_RADIUS);

        const scale = _N(s.do.radius()).div(galaxyStream.my.chosenGalaxy.d);
        graphics.x = scale.times(part.x || 0).value;
        graphics.y = scale.times(part.y || 0).value;

        graphics.interactive = true;
        let dragStart = null;
        let currentPos = { x: graphics.x, y: graphics.y };
        let dragStartPos = null;

        const startDrag = (e) => {
          dragStart = e.data;
          dragStartPos = dragStart.getLocalPosition(graphics.parent);
        };
        const drag = () => {
          if (dragStart) {
            const dragPos = dragStart.getLocalPosition(graphics.parent);
            console.log(
              'new drag pos:', dragPos.x, dragPos.y,
              'start pos:', dragStartPos.x, dragStartPos.y,
              'initial pos:', currentPos.x, currentPos.y,
            );
            graphics.x = dragPos.x - dragStartPos.x + currentPos.x;
            graphics.y = dragPos.y - dragStartPos.y + currentPos.y;
          }
        };
        const stopDrag = () => {
          dragStart = null;
          currentPos = { x: graphics.x, y: graphics.y };
          galaxyStream.do.updatePartPos(part, currentPos.x / scale.value, currentPos.y / scale.value);
        };

        graphics.on('mousedown', startDrag);
        graphics.on('mousemove', drag);
        graphics.on('mouseup', stopDrag);

        console.log('graphics position: ', graphics.position, 'part:', part);
        s.my.partAnchor.addChild(graphics);
      }
    })
    .watch('activePartIndex', 'drawActivePart')
    .method('drawButton', (s, part, color) => {
      if (!part.buttonGraphic) {
        return;
      }
      part.buttonGraphic.clear();
      part.buttonGraphic.beginFill(color)
        .drawCircle(0, s.do.radius(), s.do.discRadius())
        .endFill();

      s.my.buttonAnchor.addChild(part.buttonGraphic);
    })
    .method('radius', (s) => galaxyStream.do.backRadius())
    .method('discRadius', (s) => s.do.radius() / 12)
    .method('distAngle', (s) => _N(20).times(500).div(s.do.radius()).value)
    .method('buttonFor', (s, part, i) => {
      part.buttonGraphic = new PIXI.Graphics();
      part.buttonGraphic.angle = 180 + (i - s.my.galaxyParts.length / 2 + 0.5) * s.do.distAngle();
      part.buttonGraphic.interactive = true;
      part.buttonGraphic.buttonMode = true;
      part.buttonGraphic.on('mouseover', () => {
        s.do.setOverPartIndex(i);
      });
      part.buttonGraphic.on('mouseout', () => {
        s.do.setOverPartIndex(-1);
      });
      part.buttonGraphic.on('click', () => {
        s.do.setActivePartIndex(i);
      });
      s.do.drawButtons();
    })
    .method('densityRadius', (s) => s.do.discRadius() * 0.8)
    .method('densityAngle', (s) => _N(Math.atan2(s.do.densityRadius() * 2, s.do.radius())).deg().value)
    .method('densityDisplayButton', (s, offset) => {
      const graphic = new PIXI.Graphics();
      graphic.angle = offset * s.do.densityAngle();

      graphic.lineStyle(4, DENSITY_SELECT_COLOR, 1, 0)
        .drawCircle(0, s.do.radius(), s.do.densityRadius())
        .endFill();

      return graphic;
    })
    .method('densityButton', (s, density, offset) => {
      const graphic = new PIXI.Graphics();
      const r = s.do.densityRadius();
      const dr = s.do.radius();

      graphic.beginFill(DENSITY_COLOR)
        .drawCircle(0, s.do.radius(), s.do.densityRadius())
        .endFill();

      const RES = 6;
      _.range(-r, r, RES).forEach((x, xi) => {
        _.range(-r, r, RES).forEach((y, yi) => {
          if (_N(x).pow(2).plus(y ** 2).sqrt().value > r) {
            return;
          }
          if (Math.random() * 100 > density) {
            return;
          }

          graphic.beginFill(WHITE)
            .drawCircle(x, y + dr, RES / 3)
            .endFill();
        });
      });


      graphic.lineStyle(6, BLACK, 1, 0)
        .drawCircle(0, s.do.radius(), s.do.densityRadius())
        .endFill();

      graphic.angle = offset * s.do.densityAngle();
      return graphic;
    })
    .property('densityDisplayButtons', [], 'array')
    .method('updateDDB', (s) => {
      const part = s.do.activePart();

      if (!part) {
        s.my.densityDisplayButtons.forEach(({ displayButton }) => {
          displayButton.alpha = 0.5;
        });
      } else {
        s.my.densityDisplayButtons.forEach(({ displayButton, val }) => {
          displayButton.alpha = val <= part.density;
        });
      }
    })
    .method('drawDensityButtons', (s) => {
      if (!s.my.densityAnchor) {
        return;
      }
      console.log('================ drawing density buttons');

      const densityDisplayButtons = [];
      s.my.densityAnchor.removeChildren();
      _.range(0, 101, 10).forEach((density, i) => {
        const button = s.do.densityButton(density, i);
        button.interactive = true;
        const val = _N(density).div(100).clamp(0, 100).value;
        button.on('click', () => s.do.updateDensity(val));
        s.my.densityAnchor.addChild(button);

        const displayButton = s.do.densityDisplayButton(i);
        densityDisplayButtons.push({ displayButton, val });
      });

      densityDisplayButtons.forEach(({ displayButton }) => s.my.densityAnchor.addChild(displayButton));
      s.do.setDensityDisplayButtons(densityDisplayButtons);
      s.do.updateDDB();
    })
    .method('drawButtons', (s) => {
      s.my.galaxyParts.forEach((part, i) => {
        let color = BUTTON_COLOR;
        if (i === s.my.activePartIndex) {
          color = BUTTON_ACTIVE_COLOR;
        } else if (i === s.my.downPartIndex) {
          color = BUTTON_DOWN_COLOR;
        } else if (i === s.my.overPartIndex) {
          color = BUTTON_OVER_COLOR;
        }

        s.do.drawButton(part, color);
      });
    })
    .method('drawParts', (s) => {
      if (!s.my.anchor) {
        console.log('gcs ... no anchor');
        return;
      }
      console.log('gcs drawing controls for ', s.value);
      s.my.buttonAnchor.removeChildren();
      s.my.galaxyParts.forEach((part, i) => {
        s.do.buttonFor(part, i);
      });
    })
    .method('updateGalaxyParts', (s, parts) => {
      console.log('gcs:  galaxy parts are ', parts);
      s.do.setGalaxyParts(parts);
      s.do.drawParts();
    });

  stream.on('initApp', (s) => {
    console.log('gcs initApp');
    s.do.initAnchor();
    s.do.drawDensityButtons();
    s.do.drawParts();
  });

  stream.name = 'galaxyControlStore';

  galaxyStream.watchFlat('galaxyParts', (s, parts) => {
    stream.do.updateGalaxyParts(parts);
  });

  stream.on('resizeApp', (s) => {
    s.do.centerAnchor();
    s.do.drawDensityButtons();
    s.do.drawParts();
  });

  stream.subscribe(false, (e) => {
    console.log('error in stream:', e);
  });
  return stream;
};
