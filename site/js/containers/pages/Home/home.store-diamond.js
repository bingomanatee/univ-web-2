import axios from 'axios';
import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import apiRoot from '../../../util/apiRoot';
import { LY_PER_PX, PX_PER_HEX } from '../../../util/constants';
import HexDiamond from './HexDiamond';
import GalaxyCount from './GalaxyCount';
import ControlArrow from './ControlArrow';

const REFRESH_RATE = 200;
const getU = ({ x, y }, range = 20) => `${apiRoot()}/uni/x0y0z0/${x},${y}?range=${range}`;

const matrix = new Hexes({ scale: PX_PER_HEX, pointy: true });

const COMPASS = 'E,NE,N,NW,W,SW,S,SE'.split(',');

let worker;
if (typeof Worker !== 'undefined') {
  worker = new Worker('../../../univPoller.js');


  worker.postMessage({
    message: 'load',
    x: 0,
    y: 0,
    range: 30,
  });
}

/* ---------------- FACTORY ----------------- */

export default ({ size }) => {
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
    .property('arrows', new Map())
    .method('initArrows', (s) => {
      COMPASS.forEach((ord, i) => {
        s.my.arrows.set(ord, new ControlArrow(ord, 180 - (i * 45)));
      });
    })
    .property('direction', 0, 'number')
    .property('speed', 15, 'number')
    .method('cloneArrows', (s) => {
      const map = new Map();
      s.my.arrows.forEach((a, k) => {
        map.set(k, a.clone());
      });
      s.do.setArrows(map);
    })
    .method('onArrowOver', (s, ord) => {
      console.log('over:', ord);
      s.my.arrows.forEach((a) => {
        a.over = (a.name === ord);
      });
      s.do.cloneArrows();
    })
    .method('onArrowOut', (s, ord) => {
      console.log('out:', ord);
      s.my.arrows.forEach((a) => a.over = false);
      s.do.cloneArrows();
    })
    .method('onArrowDown', (s, ord) => {
      s.my.arrows.forEach((a) => {
        a.active = (a.name === ord);
      });
      s.do.cloneArrows();
      s.do.setDirection(s.my.arrows.get(ord).angle);
    })
    .property('universeData', new Map())
    .method('onMove', (s) => {
      pollUniverseData();
    })
    .method('compassMove', (s) => {
      const x = _N(s.my.direction).cos(true).times(s.my.speed).value;
      const y = _N(s.my.direction).sin(true).times(s.my.speed).value;

      s.do.setOffsetX(s.my.offsetX + x);
      s.do.setOffsetY(s.my.offsetY + y);

      s.my.offsetAnchor.position = { x: s.my.offsetX, y: s.my.offsetY };
    })
    .method('go', (s) => {
      const time = Date.now();
      s.do.drawUniverse();
      s.do.compassMove();
      requestAnimationFrame(throttledPoll);
      const elapsed = Date.now() - time;
      if (elapsed > REFRESH_RATE) {
        requestAnimationFrame(s.do.go);
      } else {
        setTimeout(stream.do.go, REFRESH_RATE - elapsed);
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
    .method('initAnchor', (s) => {
      if (s.my.anchor) {
        return;
      }
      const group = new PIXI.Container();
      s.my.app.stage.addChild(group);
      s.do.setAnchor(group);
      s.do.setAnchorPos();
      const offsetAnchor = new PIXI.Container();
      group.addChild(offsetAnchor);
      s.do.setOffsetAnchor(offsetAnchor);
    })
    .property('offsetAnchor', null)
    .method('setAnchorPos', (s) => {
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

      s.my.offsetAnchor.position = { x: s.my.offsetX, y: s.my.offsetY };
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
          counts.push(new GalaxyCount({ x: hex.x, y: hex.y, g: 0 }));
        }
      });

      return counts;
    })
    .method('updateDiamond', (s, id, counts) => {
      const existing = s.my.diamonds.get(id);
      if (existing) {
        existing.updateCounts(counts);
        return existing;
      }

      const diamond = new HexDiamond(id, counts);
      s.my.diamonds.set(id, diamond);
      return diamond;
    })
    .method('drawUniverse', (s) => {
      const time = Date.now();
      if (!s.my.app) {
        return;
      }
      if (!s.my.anchor) {
        s.do.initAnchor();
      }

      const x = -s.my.offsetX;
      const y = -s.my.offsetY;

      const hexes = matrix.floodRect(
        x - s.my.width / 1.5,
        y - s.my.height / 1.5,
        x + s.my.width / 1.5,
        y + s.my.height / 1.5,
        true,
      );

      s.my.diamonds.forEach((diamond) => {
        diamond.updated = false;
      });

      const diamondGroups = _.groupBy(hexes, HexDiamond.indexOf);
      const visibleIds = Object.keys(diamondGroups);

      const invisibleIds = _.difference(Array.from(s.my.diamonds.keys()), visibleIds);

      const deleted = 0;

      visibleIds.forEach((id) => {
        const counts = s.do.countsFor(diamondGroups[id]);
        s.do.updateDiamond(id, counts);
      });

      let updatedCount = 0;
      let notUpdated = 0;
      s.my.diamonds.forEach((diamond) => {
        // console.log('------- drawing diamond ---------', diamond);
        if (!diamond.updated) {
          // console.log('skipping; not updated');
          notUpdated += 1;
          return;
        }
        updatedCount = 1;
        diamond.graphics.clear();
        diamond.counts.forEach((count) => {
          if (count.galaxies < 1) {
            s.my.offsetAnchor.removeChild(diamond.graphics);
            return;
          }
          count.drawHex(diamond.graphics);
          count.addStars(diamond.graphics);
          s.my.offsetAnchor.addChild(diamond.graphics);
        });
      });

      console.log('universeDrawn: ', updatedCount, 'diamonds updated', notUpdated, 'not updated', deleted, 'deleted');
      console.log('draw time: ', Date.now() - time);
    });

  stream.on('initApp', pollUniverseData);

  stream.watch('direction', 'go');
  stream.watch('speed', 'go');

  stream.do.initArrows();
  return stream;
};
