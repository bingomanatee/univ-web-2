import axios from 'axios';
import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';

import pixiStreamFactory from '../../store/pixiStreamFactory';
import apiRoot from '../../util/apiRoot';
import { LY_PER_PX, PX_PER_HEX } from '../../util/constants';
import HexDiamond from './HexDiamond';
import GalaxyCount from './GalaxyCount';
import ControlArrow from './ControlArrow';
import hexLine from '../../util/hexLine';

const CURSOR_BORDER = chroma(255, 225, 200).num();
const CURSOR_FILL = chroma(102, 204, 0).num();
const REFRESH_RATE = 200;
const SPEED_K = 5;

const matrix = new Hexes({ scale: PX_PER_HEX, pointy: true });

const COMPASS = 'E,NE,N,NW,W,SW,S,SE'.split(',');

let worker;
if (typeof Worker !== 'undefined') {
  worker = new Worker('../../univPoller.js');


  worker.postMessage({
    message: 'load',
    x: 0,
    y: 0,
    range: 30,
  });
}

/* ---------------- FACTORY ----------------- */

export default ({ size, history }) => {
  const stream = pixiStreamFactory({ size });

  function pollUniverseData() {
    const range = stream.do.hexRadius();
    const coord = stream.do.centerHex();
    if (worker) {
      worker.postMessage({
        message: 'load',
        x: coord.x,
        y: coord.y,
        range: Math.max(range, 20),
      });
    } else {
      console.log('pollUniverseData: no worker');
    }
  }
  const throttledPoll = _.throttle(pollUniverseData, 500);

  worker.onmessage = (message) => {
    const { data } = message;

    switch (data.message) {
      case 'univData':
        stream.do.updateUniverseData(data.galaxies);
        stream.do.drawUniverse();
        break;

      default:
        console.log('unprocessed worker message', message);
    }
  };

  stream
    .property('sector', null)
    .property('galaxy', null)
    .method('closeGalaxy', (s) => {
      console.log('---- closing galaxy');
      s.do.setGalaxy(null);
    })
    .method('chooseGalaxy', (s, galaxy) => {
      s.do.setGalaxy(galaxy);
    })
    .method('zoom', (s) => {
      s.do.setSpeed(0);
      s.do.setSector(s.my.centerHex);
    }, true)
    .method('closeSector', (s) => {
      s.do.setSector(null);
    })
    .property('arrows', new Map())
    .method('initArrows', (s) => {
      COMPASS.forEach((ord, i) => {
        s.my.arrows.set(ord, new ControlArrow(ord, 180 - (i * 45)));
      });
      s.do.onArrowDown('E');
    })
    .property('direction', 0, 'number')
    .property('speed', 0, 'number')
    .method('cloneArrows', (s) => {
      const map = new Map();
      s.my.arrows.forEach((a, k) => {
        map.set(k, a.clone());
      });
      s.do.setArrows(map);
    })
    .method('onArrowOver', (s, ord) => {
      s.my.arrows.forEach((a) => {
        a.over = (a.name === ord);
      });
      s.do.cloneArrows();
    })
    .method('onArrowOut', (s) => {
      s.my.arrows.forEach((a) => a.over = false);
      s.do.cloneArrows();
    })
    .method('onArrowDown', (s, ord) => {
      s.my.arrows.forEach((a) => {
        a.active = (a.name === ord);
      });
      s.do.cloneArrows();
      s.do.setDirection(s.my.arrows.get(ord).angle);
      if (s.my.speed === 0) s.do.setSpeed(2);
      s.do.go();
    })
    .property('universeData', new Map())
    .method('onMove', (s) => {
      pollUniverseData();
    })
    .property('lastUpdate', 0, 'number')
    .method('updateDelta', (s) => {
      if (!s.my.lastUpdate) return 1;
      return _N(Date.now()).sub(s.my.lastUpdate).div(100).clamp(0.2, 2).value;
    })
    .method('updateCenter', (s) => {
      const delta = s.do.updateDelta();
      s.do.setLastUpdate(Date.now());
      const x = _N(s.my.direction).cos(true).times(s.my.speed).times(SPEED_K)
        .times(delta).value;
      const y = _N(s.my.direction).sin(true).times(s.my.speed).times(SPEED_K)
        .times(delta).value;

      s.do.setOffsetX(s.my.offsetX + x);
      s.do.setOffsetY(s.my.offsetY + y);

      if (s.my.offsetAnchor) {
        s.my.offsetAnchor.position = { x: s.my.offsetX, y: s.my.offsetY };
      }
    }, true)
    .method('go', (s) => {
      const time = Date.now();
      s.do.updateCenter();
      s.do.drawUniverse();
      s.do.drawCursor();
      throttledPoll();
      if (s.my.speed > 0) {
        const elapsed = Date.now() - time;
        if (elapsed > REFRESH_RATE) {
          requestAnimationFrame(s.do.go);
        } else {
          setTimeout(stream.do.go, REFRESH_RATE - elapsed);
        }
      }
    })
    .property('diamonds', new Map())
    .method('hexRadius', (s) => {
      const maxSize = Math.max(s.my.width, s.my.height);
      return Math.max(20, Math.ceil(maxSize / PX_PER_HEX));
    })
    .method('centerHex', (s) => matrix.nearestHex(-s.my.offsetX, -s.my.offsetY))
    .method('updateUniverseData', (s, cells, depth = 0) => {
      cells.forEach((cell) => {
        const count = new GalaxyCount(cell, matrix, depth);
        s.my.universeData.set(count.id, count);
      });
      s.broadcast('universeData');
    })
    .property('anchor', null)
    .property('offsetAnchor', null)
    .property('hexContainer', null)
    .property('centerHex', null)
    .property('cursorGraphics', null)
    .method('drawCursor', (s) => {
      s.do.initAnchor();
      const center = matrix.nearestHex(-s.my.offsetX, -s.my.offsetY);
      if (center.isEqualTo(s.my.centerHex)) {
        return;
      }

      s.do.setCenterHex(center);

      s.my.cursorGraphics.clear()
        .beginFill(CURSOR_FILL, 0.1);
      hexLine(s.my.cursorGraphics, center, matrix);
      s.my.cursorGraphics.endFill();

      center.neighbors.forEach((neighbor) => {
        s.my.cursorGraphics
          .lineStyle({ width: 2, color: CURSOR_BORDER, native: true });
        hexLine(s.my.cursorGraphics, neighbor, matrix);
      });

      s.my.cursorGraphics
        .lineStyle({ width: 4, color: CURSOR_BORDER, native: false });
      hexLine(s.my.cursorGraphics, center, matrix);
    })
    .method('initAnchor', (s) => {
      if (s.my.anchor || (!s.my.app)) {
        return;
      }

      s.do.setAnchor(new PIXI.Container());
      s.my.app.stage.addChild(s.my.anchor);

      s.do.setOffsetAnchor(new PIXI.Container());
      s.my.anchor.addChild(s.my.offsetAnchor);

      s.do.setHexContainer(new PIXI.Container());
      s.my.offsetAnchor.addChild(s.my.hexContainer);

      s.do.setCursorGraphics(new PIXI.Graphics());
      s.my.offsetAnchor.addChild(s.my.cursorGraphics);

      s.do.setAnchorPos();
    })
    .method('setAnchorPos', (s) => {
      if (!s.my.anchor) return;
      const x = s.my.width / 2 || 0;
      const y = s.my.height / 2 || 0;
      s.my.anchor.position = { x, y };
    })
    .method('move', (s, dir, amt) => {
      switch (dir) {
        case 'x':
          s.do.setOffsetX(s.my.offsetX + amt);
          break;
        case 'y':
          s.do.setOffsetY(s.my.offsetY + amt);
          break;
      }

      if (s.my.offsetAnchor) {
        s.my.offsetAnchor.position = { x: s.my.offsetX, y: s.my.offsetY };
      }
      pollUniverseData();
    }, true)
    .property('offsetX', 0, 'number')
    .property('offsetY', 0, 'number')
    .method('countsFor', (s, hexes, depth = 0) => {
      const counts = [];

      hexes.forEach((hex) => {
        const key = GalaxyCount.idFor({ hex, depth });
        if (s.my.universeData.has(key)) {
          counts.push(s.my.universeData.get(key));
        } else {
          const count = new GalaxyCount({ x: hex.x, y: hex.y, g: 0 });
          s.my.universeData.set(key, count);
          counts.push(count);
        }
      });

      return counts;
    })
    .method('updateDiamond', (s, id, counts) => {
      if (!s.my.hexContainer) return null;
      const existing = s.my.diamonds.get(id);
      if (existing) {
        existing.updateCounts(counts);
        return existing;
      }

      const diamond = new HexDiamond(id, counts);
      s.my.hexContainer.addChild(diamond.container);
      s.my.diamonds.set(id, diamond);
      return diamond;
    })
    .method('updateSpeed', (s, speed) => {
      s.do.setSpeed(speed);
      s.do.go();
      s.broadcast();
    })
    .method('drawUniverse', (s) => {
      if (!s.my.app) {
        return;
      }
      //  const time = Date.now();
      s.do.initAnchor();

      const x = -s.my.offsetX;
      const y = -s.my.offsetY;

      //  const t1 = Date.now();
      const hexes = matrix.floodRect(
        x - s.my.width / 1.5,
        y - s.my.height / 1.5,
        x + s.my.width / 1.5,
        y + s.my.height / 1.5,
        matrix,
      );
      // const t2 = Date.now();

      s.my.diamonds.forEach((diamond) => {
        diamond.updated = false;
      });

      const diamondGroups = _.groupBy(hexes, HexDiamond.indexOf);
      const visibleIds = Object.keys(diamondGroups);

      // const deleted = 0;

      visibleIds.forEach((id) => {
        const counts = s.do.countsFor(diamondGroups[id]);
        s.do.updateDiamond(id, counts);
      });

      //  let updatedCount = 0;
      // let notUpdated = 0;
      s.my.diamonds.forEach((diamond) => {
        // console.log('------- drawing diamond ---------', diamond);
        if (!diamond.updated) {
          // console.log('skipping; not updated');
          // notUpdated += 1;
          return;
        }
        // updatedCount = 1;
        diamond.draw();
      });

      //  console.log('universeDrawn: ', updatedCount, 'diamonds updated', notUpdated, 'not updated', deleted, 'deleted');
      // console.log('draw time: ', Date.now() - time);
    });

  stream.do.initArrows();

  stream.on('initApp', pollUniverseData);
  stream.on('initApp', 'initAnchor');
  stream.on('initApp', 'drawCursor');
  stream.on('initApp', 'go');

  stream.watch('speed', 'go');

  stream.on('resized', 'setAnchorPos');
  stream.on('resized', 'drawCursor');
  stream.on('resized', 'drawUniverse');

  return stream;
};
