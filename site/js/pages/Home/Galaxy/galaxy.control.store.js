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

let imgResources;
PIXI.Loader.shared.load((loader, resources) => {
  imgResources = resources;
});

export default (galaxyStream, size) => {
  const stream = pixiStreamFactory({ size })
    .property('galaxyParts', [], 'array')
    .property('anchor', null)
    .property('partTabAnchor', null)
    .property('partAxisAnchor', null)
    .property('partRadiusAnchor', null)
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
      s.do.setPartTabAnchor(new PIXI.Container());
      s.do.setDensityAnchor(new PIXI.Container());
      s.do.setPartAxisAnchor(new PIXI.Container());
      s.do.setPartRadiusAnchor(new PIXI.Container());
      s.my.anchor.addChild(s.my.partTabAnchor);
      s.my.anchor.addChild(s.my.partAxisAnchor);
      s.my.anchor.addChild(s.my.densityAnchor);
      s.my.anchor.addChild(s.my.partRadiusAnchor);
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
    .property('partAxisContainer', null)
    .method('makeDraggable', (s, graphics, onChange, onDone) => {
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
          graphics.x = dragPos.x - dragStartPos.x + currentPos.x;
          graphics.y = dragPos.y - dragStartPos.y + currentPos.y;
          if (onChange && _.isFunction(onChange)) {
            onChange(currentPos);
          }
        }
      };
      const stopDrag = () => {
        dragStart = null;
        currentPos = { x: graphics.x, y: graphics.y };
        if (onDone && _.isFunction(onDone)) {
          onDone(currentPos);
        }
      };

      graphics.on('mousedown', startDrag);
      graphics.on('mousemove', drag);
      graphics.on('mouseup', stopDrag);

      return graphics;
    })
    .method('lyToPx', (s) => _N(s.do.radius()).div(galaxyStream.my.chosenGalaxy.d).value)
    .method('makeCenterButton', (s, part) => {
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

      const scale = s.do.lyToPx();

      graphics.x = scale * (part.x || 0);
      graphics.y = scale * (part.y || 0);

      const onDone = ({ x, y }) => {
        galaxyStream.do.updatePartPos(part, x / scale, y / scale);
        s.do.redrawRadius(part);
      };

      const onMove = () => {
        const radGraphic = s.my.radiusContainer.getChildAt(0)
        if (radGraphic){
          radGraphic.x = graphics.x;
          radGraphic.y = graphics.y;
        }
      }

      s.do.makeDraggable(graphics, onMove, onDone);

      return graphics;
    })
    .method('makeRadialButton', (s, part) => {
      const graphics = new PIXI.Graphics();
      const scale = s.do.lyToPx();
      graphics.x = scale * (part.x || 0);
      graphics.y = scale * (part.y || 0);

      graphics.lineStyle(4, PART_AXIS_COLOR, 0.5)
        .drawCircle(0, 0, part.diameter/2 * scale);

      return graphics;
    })
    .method('redrawRadius', (s, part) => {
      s.my.partRadiusAnchor.removeChildren();
      if (!part.diameter) return;
      s.my.partRadiusAnchor.addChild(s.do.makeRadialButton(part));
    })
    .method('drawActivePart', (s) => {
      if (!s.my.partAxisAnchor) {
        return;
      }
      const part = s.do.activePart();
      s.my.partAxisAnchor.removeChildren();
      if (!part) {
        return;
      }

      s.my.partAxisAnchor.addChild(s.do.makeCenterButton(part));
      s.do.redrawRadius(part);
    })
    .watch('activePartIndex', 'drawActivePart')
    .method('drawButton', (s, part, color, offset) => {
      if (!part.buttonGraphic) {
        return;
      }
      part.buttonGraphic.clear();

      part.buttonGraphic.beginFill(color)
        .drawCircle(0, s.do.radius(), s.do.discRadius())
        .endFill()
        .drawRect(-24, s.do.radius() - 24, 48, 48);

      s.my.partTabAnchor.addChild(part.buttonGraphic);
      const sprite = new PIXI.Sprite(imgResources[part.iconType].texture);
      sprite.x = -24;
      sprite.y = s.do.radius() - 24;
      const container = new PIXI.Container();
      container.addChild(sprite);
      container.angle = 180 + (offset - s.my.galaxyParts.length / 2 + 0.5) * s.do.distAngle();
      s.my.partTabAnchor.addChild(container);
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
    .method('densityRadius', (s) => s.do.discRadius() * 0.5)
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

      const c = _N(255).times(density).div(100).round()
        .clamp(0, 255).value;
      const color = chroma(c, c, c).num();
      graphic.beginFill(color)
        .drawCircle(0, s.do.radius(), s.do.densityRadius())
        .endFill();

      graphic.lineStyle(6, DENSITY_COLOR, 1, 0)
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
    .method('updateDensity', (s, val) => {
      const part = s.do.activePart();
      if (part) {
        galaxyStream.do.updatePartDensity(part, val);
      }
    })
    .method('drawDensityButtons', (s) => {
      if (!s.my.densityAnchor) {
        return;
      }
      console.log('================ drawing density buttons');

      const densityDisplayButtons = [];
      s.my.densityAnchor.removeChildren();
      _.range(0, 101, 5).forEach((density, i) => {
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

        s.do.drawButton(part, color, i);
      });
    })
    .method('drawParts', (s) => {
      if (!s.my.anchor) {
        console.log('gcs ... no anchor');
        return;
      }
      console.log('gcs drawing controls for ', s.value);
      s.my.partTabAnchor.removeChildren();
      s.my.galaxyParts.forEach((part, i) => {
        s.do.buttonFor(part, i);
      });
    })
    .method('updateGalaxyParts', (s, parts) => {
      console.log('gcs:  galaxy parts are ', parts);
      s.do.setGalaxyParts(parts);
      s.do.drawParts();
      s.do.drawDensityButtons();
    });

  stream.on('initApp', (s) => {
    console.log('gcs initApp');
    s.do.initAnchor();
    s.do.drawDensityButtons();
    s.do.drawParts();
  });

  stream.name = 'galaxyControlStore';

  const sub = galaxyStream.watchFlat('galaxyParts', (s, parts) => {
    stream.do.updateGalaxyParts(parts);
  });

  stream.on('resizeApp', (s) => {
    s.do.centerAnchor();
    s.do.drawDensityButtons();
    s.do.drawParts();
  });

  stream.subscribe(false, (e) => {
    console.log('error in stream:', e);
  }, () => sub.unsubscribe());
  return stream;
};
