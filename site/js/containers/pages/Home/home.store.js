import axios from 'axios';
import { CubeCoords, Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import apiRoot from '../../../util/apiRoot';
import { LY_PER_PX, PX_PER_HEX } from '../../../util/constants';

const getU = ({ x, y }, range = 20) => `${apiRoot()}/uni/x0y0z0/${x},${y}?range=${range}`;

const uFrame = new Hexes({ scale: PX_PER_HEX, pointy: true });

const cellToStr = ({ x, y }, depth = 0) => [x, y, depth].join(':');

const shadeOfGray = (n) => {
  const c = Math.min(n, 255);
  return chroma(c, c, c).num();
};

export default ({ size }) => {
  const stream = pixiStreamFactory({ size });

  const reload = _.throttle(() => { stream.do.pollUniverse(); }, 800);

  stream
    .property('universeData', new Map())
    .method('onMove', (s) => {
      reload();
    })
    .method('pollUniverse', async (s) => {
      const coord = uFrame.nearestHex(-s.my.offsetX, -s.my.offsetY);
      console.log('offset: ', s.my.offsetX, s.my.offsetY, 'coord:', coord);
      const maxSize = Math.max(s.my.width, s.my.height);
      const radius = Math.max(20, Math.ceil(maxSize / PX_PER_HEX));
      const { data } = await axios.get(getU(coord, radius));
      console.log('data:', data);
      s.do.updateUniverseData(data);
      s.do.drawUniverse();
    })
    .method('updateUniverseData', (s, cells, depth = 0) => {
      cells.forEach((cell) => {
        s.my.universeData.set(cellToStr(cell, depth), cell.g);
      });
      // note - this method doesn't trigger a broadcast.
      s._changes.next({});
    })
    .property('anchor', null)
    .method('initAnchor', (s) => {
      if (s.my.anchor) return;
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
    .method('drawUniverse', (s) => {
      if (!s.my.app) {
        return;
      }
      const x = -s.my.offsetX;
      const y = -s.my.offsetY;
      const hexes = uFrame.floodRect(
        x - s.my.width,
        y - s.my.height,
        x + s.my.width,
        y + s.my.height,
        true,
      );

      if (!s.my.anchor) {
        s.do.initAnchor();
      }
      s.my.offsetAnchor.removeChildren();

      let graphics = new PIXI.Graphics();
      s.my.offsetAnchor.addChild(graphics);
      let count = 0;
      hexes.forEach((hex) => {
        const key = cellToStr(hex);
        const galaxies = s.my.universeData.get(key) ? s.my.universeData.get(key) : 0;
        const point = hex.toXY(uFrame);

        graphics.beginFill(shadeOfGray(galaxies));
        graphics.drawCircle(point.x, point.y, PX_PER_HEX / 2.05);
        graphics.endFill();

        count += 1;
        if (count > 10) {
          graphics = new PIXI.Graphics();
          s.my.offsetAnchor.addChild(graphics);
        }
      });
    });

  stream.on('initApp', () => stream.do.pollUniverse());

  return stream;
};
