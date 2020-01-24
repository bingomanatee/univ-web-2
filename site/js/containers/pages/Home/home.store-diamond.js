import axios from 'axios';
import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import apiRoot from '../../../util/apiRoot';
import { LY_PER_PX, PX_PER_HEX } from '../../../util/constants';
import HexDiamond from './HexDiamond';
import GalaxyCount from './GalaxyCount';

const getU = ({ x, y }, range = 20) => `${apiRoot()}/uni/x0y0z0/${x},${y}?range=${range}`;

const uFrame = new Hexes({ scale: PX_PER_HEX, pointy: true });

const shadeOfGray = (n) => {
  const c = Math.min(n, 255);
  return chroma(c, c, c).num();
};

export default ({ size }) => {
  const stream = pixiStreamFactory({ size });

  const reload = _.throttle(() => {
    stream.do.pollUniverse();
  }, 800);

  stream
    .property('universeData', new Map())
    .method('onMove', (s) => {
      reload();
    })
    .property('diamonds', new Map())
    .method('pollUniverse', async (s) => {
      const coord = uFrame.nearestHex(-s.my.offsetX, -s.my.offsetY);
      console.log('offset: ', s.my.offsetX, s.my.offsetY, 'coord:', coord);
      const maxSize = Math.max(s.my.width, s.my.height);
      const radius = Math.max(20, Math.ceil(maxSize / PX_PER_HEX));
      const { data } = await axios.get(getU(coord, radius));
      // console.log('data:', data);
      s.do.updateUniverseData(data);
      s.do.drawUniverse();
    })
    .method('updateUniverseData', (s, cells, depth = 0) => {
      cells.forEach((cell) => {
        const count = new GalaxyCount(cell, depth);
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
      reload();
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
      if (!s.my.app) {
        return;
      }
      if (!s.my.anchor) {
        s.do.initAnchor();
      }

      const x = -s.my.offsetX;
      const y = -s.my.offsetY;

      const hexes = uFrame.floodRect(
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

      Object.keys(diamondGroups).forEach((id) => {
        const counts = s.do.countsFor(diamondGroups[id]);
        const diamond =  s.do.updateDiamond(id, counts);
      });

      s.my.diamonds.forEach((diamond) => {
       // console.log('------- drawing diamond ---------', diamond);
        if (!diamond.updated) {
         // console.log('skipping; not updated');
          return;
        }
        diamond.graphics.clear();
        diamond.counts.forEach((count) => {
          if (count.galaxies < 1) return;
          const point = count.hex.toXY(uFrame);
          diamond.graphics.beginFill(shadeOfGray(count.galaxies));
          diamond.graphics.drawCircle(point.x, point.y, PX_PER_HEX / 2.05);
          diamond.graphics.endFill();
          s.my.offsetAnchor.addChild(diamond.graphics);
        });
      });
    });

  stream.on('initApp', () => stream.do.pollUniverse());

  return stream;
};
