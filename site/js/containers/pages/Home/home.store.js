import axios from 'axios';
import { CubeCoords, Hexes } from '@wonderlandlabs/hexagony';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';

import pixiStreamFactory from '../../../store/pixiStreamFactory';
import apiRoot from '../../../util/apiRoot';
import { LY_PER_PX, PX_PER_HEX } from '../../../util/constants';

const getU = (range = 20) => `${apiRoot()}/uni/x0y0z0/0,0?range=${range}`;

const uFrame = new Hexes({ scale: PX_PER_HEX, pointy: true });

const cellToStr = ({ x, y }, depth = 0) => [x, y, depth].join(':');

const shadeOfGray = (n) => {
  const c = Math.min(n, 255);
  return chroma(c, c, c).num();
};

export default ({ size }) => {
  const stream = pixiStreamFactory({ size });

  stream
    .property('universeData', new Map())
    .method('onMove', async (s) => {
      try {
        const maxSize = Math.max(s.my.width, s.my.height);
        const radius = Math.max(20, Math.ceil(maxSize / PX_PER_HEX));
        const { data } = await axios.get(getU(radius));
        console.log('data:', data);
        s.do.updateUniverseData(data);
        s.do.drawUniverse();
      } catch (err) {
        console.log('error on onMove: ', err);
      }
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
    })
    .method('setAnchorPos', (s) => {
      const x = s.my.width / 2 || 0;
      const y = s.my.height / 2 || 0;
      s.my.anchor.position = { x, y };
    })
    .method('drawUniverse', (s) => {
      if (!s.my.app) {
        return;
      }
      const hexes = uFrame.floodRect(s.my.width / -2, s.my.height / -2, s.my.width / 2, s.my.height / 2, true);

      if (!s.my.anchor) {
        s.do.initAnchor();
      }
      s.my.anchor.removeChildren();

      let graphics = new PIXI.Graphics();
      s.my.anchor.addChild(graphics);
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
          s.my.anchor.addChild(graphics);
        }
      });
    });

  stream.on('initApp', (s) => s.do.onMove());

  return stream;
};
