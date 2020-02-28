import * as PIXI from 'pixi.js';
import _N from '@wonderlandlabs/n';
import chroma from 'chroma-js';
import _ from 'lodash';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import { LY_PER_HEX, SUBSECTOR_DIV, STAR_DIV } from '../../../util/constants';

const WHITE = chroma(255, 255, 255).num();
const GREY = chroma(128, 128, 128).num();
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

const ptDist = (p1, p2) => Math.sqrt(
  ((p1.x - p2.x) ** 2)
  + ((p1.y - p2.y) ** 2),
);

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
      s.my.anchor.addChild(s.my.partRadiusAnchor);
      s.my.anchor.addChild(s.my.partAxisAnchor);
      s.my.anchor.addChild(s.my.densityAnchor);
      s.my.app.stage.addChild(s.my.anchor);
      s.do.centerAnchor();
    })
    .property('activePartIndex', 0, 'integer')
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
    .method('makeCenterButton', (s) => {
      // @TODO: reuse graphic
      const part = s.do.activePart();
      if (!part) {
        return null;
      }
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

      s.do.centerGraphicsToPart(graphics, part);

      const onDone = ({ x, y }) => {
        const scale = s.do.lyToPx();
        console.log('updated part from ', part.my.x, part.my.y);
        part.do.setX(x / scale);
        part.do.setY(y / scale);
        console.log('updated part to ', part.my.x, part.my.y);
        s.do.redrawRadius(part);
      };

      const onMove = () => {
        if (_.get(s, 'my.partRadiusAnchor.children.length', 0)) {
          const radGraphic = s.my.partRadiusAnchor.getChildAt(0);
          radGraphic.x = graphics.x;
          radGraphic.y = graphics.y;
        }
      };

      s.do.makeDraggable(graphics, onMove, onDone);
      return graphics;
    })
    .method('partLocation', (s) => {
      // this is the location of the graphics REPRESENTING the active part
      // RELATIVE to the partAxis container.
      const i = _.get('s.my.partAxisAnchor.length', 0);
      if (i < 1) {
        return null;
      }
      const graphics = _.first(s.my.partAxisAnchor.children);
      if (!graphics) {
        return null;
      }
      return { x: graphics.x, y: graphics.y };
    })
    .method('findRadiusGraphic', (s) => {
      const i = _.get('s.my.partRadiusAnchor.length', 0);
      return i ? _.first(s.my.partRadiusAnchor.children) : null;
    })
    .method('findAxisGraphic', (s) => {
      const i = _.get('s.my.partAxisAnchor.length', 0);
      return i ? _.first(s.my.partAxisAnchor.children) : null;
    })
    .method('makeRBdraggable', (s) => {
      const graphics = s.do.findRadiusGraphic();
      if (!graphics) {
        return;
      }

      const startDrag = (e) => {
        let dragStart = e.data;
        const dragStartPos = dragStart.getLocalPosition(graphics.parent);
        let dragStartRadius = 0;
        let dragCurrentRadius = 0;

        dragStartRadius = ptDist(dragStartPos, s.do.findAxisGraphic().position);

        // as we drag we temporarily scale the graphics for efficiencies' sake.
        const drag = () => {
          if (!dragStart) {
            return;
          }

          const dragPos = dragStart.getLocalPosition(graphics.parent);
          const ag = s.do.findAxisGraphic();
          dragCurrentRadius = ptDist(dragPos, ag.position);
          if (dragStartRadius && dragCurrentRadius) {
            const dragScale = dragCurrentRadius / dragStartRadius;
            graphics.scale = { x: dragScale, y: dragScale };
          }
        };
        const stopDrag = () => {
          graphics.off('mousemove', drag);
          graphics.off('mouseup', stopDrag);
          graphics.off('mouseupoutside', stopDrag);

          if (!dragStart) {
            return;
          }

          const dragPos = dragStart.getLocalPosition(graphics.parent);
          const ag = s.do.findAxisGraphic();
          dragCurrentRadius = ptDist(dragPos, ag.position);
          graphics.scale = { x: 1, y: 1 };

          if (dragStartRadius && dragCurrentRadius) {
            const dragScale = dragCurrentRadius / dragStartRadius;
            const part = s.do.activePart();
            if (part) {
              galaxyStream.do.updatePartDiameter(part, dragScale * part.diameter);
            }
          }
          dragStart = null;
          // TODO: change radius!
        };

        graphics.on('mousemove', drag);
        graphics.on('mouseup', stopDrag);
        graphics.on('mouseupoutside', stopDrag);
      };

      graphics.on('mousedown', startDrag);
    })
    .method('centerGraphicsToPart', (s, graphics) => {
      const part = s.do.activePart();
      if (!part) {
        return;
      }
      const scale = s.do.lyToPx();
      graphics.x = scale * (part.my.x || 0);
      graphics.y = scale * (part.my.y || 0);
    })
    .method('makeRadialButton', (s) => {
      const part = s.do.activePart();
      if (!part) {
        return;
      }
      let graphics = s.do.findRadiusGraphic();
      if (graphics && graphics instanceof PIXI.Graphics) {
        graphics.clear();
      } else {
        graphics = new PIXI.Graphics();
        graphics.interactive = true;
        s.my.partRadiusAnchor.addChild(graphics);
        s.do.makeRBdraggable();
      }
      s.do.centerGraphicsToPart(graphics);
      const scale = s.do.lyToPx();
      graphics.beginFill(BLACK, 0.1)
        .drawCircle(0, 0, (part.my.diameter / 2) * scale)
        .endFill();

      graphics.lineStyle(1, PART_AXIS_COLOR, 1)
        .drawCircle(0, 0, (part.my.diameter / 2) * scale);
    })
    .method('redrawRadius', (s) => {
      const part = s.do.activePart();
      if (!_.get(part, 'diameter', 0)) {
        s.my.partRadiusAnchor.removeChildren();
        return;
      }
      s.do.makeRadialButton();
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

      s.my.partAxisAnchor.addChild(s.do.makeCenterButton());
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
      const sprite = new PIXI.Sprite(imgResources[part.my.iconType].texture);
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
          displayButton.alpha = val <= part.my.density;
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
      _.range(0, 101, 5).forEach((density, i) => {
        const button = s.do.densityButton(density, i);
        button.interactive = true;
        const val = _N(density).div(100).clamp(0, 1).value;
        button.on('click', () => {
          const part = s.do.activePart();
          if (!part) return;
          part.do.setDensity(val);
          s.do.drawDensityButtons();
        });
        s.my.densityAnchor.addChild(button);

        const displayButton = s.do.densityDisplayButton(i);
        densityDisplayButtons.push({ displayButton, val });
      });

      densityDisplayButtons.forEach(({ displayButton }) => s.my.densityAnchor.addChild(displayButton));
      s.do.setDensityDisplayButtons(densityDisplayButtons);
      s.do.updateDDB();
    }, true)
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
    }, true)
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
    }, true)
    .method('updateGalaxyParts', (s, parts) => {
      console.log('gcs:  galaxy parts are ', parts);
      s.do.setGalaxyParts(parts);
      s.do.drawParts();
      s.do.drawDensityButtons();
    });

  stream.on('initApp', (s) => {
    console.log('gcs initApp');
    const t = Date.now();
    s.do.initAnchor();
    const t2 = Date.now();
    console.log('========= anchor took', (t2 - t) / 1000, 'secs');
    s.do.drawDensityButtons();
    const t3 = Date.now();
    console.log('======== db took', (t3 - t2) / 1000, 'secs');
    s.do.drawParts();
    console.log('======== parts took ', (Date.now() - t3) / 1000, 'secs');
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

  stream.subscribe((s) => {
    console.log('s updated');
  }, (e) => {
    console.log('error in stream:', e);
  }, () => sub.unsubscribe());
  return stream;
};
