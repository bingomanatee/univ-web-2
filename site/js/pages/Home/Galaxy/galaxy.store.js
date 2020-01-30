import axios from 'axios';
import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import { Universe } from '@wonderlandlabs/universe';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import pixiStreamFactory from '../../../store/pixiStreamFactory';
import apiRoot from '../../../util/apiRoot';
import {
  LY_PER_PX, PX_PER_HEX, LY_PER_HEX, SUBSECTOR_DIV,
} from '../../../util/constants';

const BACKGROUND_FILL = chroma(25, 0, 40).num();
const BACKGROUND_LINE = chroma(51, 102, 0).num();
const SCANNER_COLOR = BACKGROUND_LINE;
const SECTOR_COLOR = chroma(255, 225, 200).num();
const SCANNER_ROTATION_SPEED = 3;
const SCANNER_ALPHA = 0.25;

const divideUrl = (coord) => `https://univ-2019.appspot.com/uni/x0y0z0.x${coord.x}y${coord.y}z${coord.z}/_/divide`;

const univSector = new Universe({
  diameter: LY_PER_HEX,
  galaxies: 0,
});
univSector.makeSubsectors(SUBSECTOR_DIV);

/* ---------------- FACTORY ----------------- */

export default ({ size, galaxy, onClick }) => {
  const stream = pixiStreamFactory({ size });
  stream.name = 'galaxyStore';

  stream.property('galaxy', galaxy)
    .property('sectors', [], 'array')
    .property('sectorContainer', null)
    .method('updateSectors', (s, sectors) => {
      console.log('sectors updated:', sectors);
      s.do.setSectors(sectors);
      s.do.drawSectors(sectors);
    })
    .method('sectorMatrix', (s) => {
      const scale = s.do.backRadius() / SUBSECTOR_DIV;
      return new Hexes({ scale, pointy: true });
    })
    .method('drawSectors', (s) => {
      s.my.sectorContainer.removeChildren();
      const matrix = s.do.sectorMatrix();
      s.my.sectors.forEach((sector) => {
        const g = new PIXI.Graphics();
        sector.graphics = g;
        const coord = new CubeCoord(sector.x, sector.y);
        const xy = coord.toXY(matrix);
        g.position = xy;

        let radialPoints = _(_.range(0, 360, 15))
          .map((a) => {
            const n = _N(a);
            return {
              x: n.sin(true).times(matrix.scale).div(3).value,
              y: n.cos(true).times(matrix.scale).div(3).value,
            };
          })
          .value();

        radialPoints.forEach((p, i) => {
          const a = i ? radialPoints[i - 1] : _.last(radialPoints);
          const b = radialPoints[i + 1] || _.first(radialPoints);

          p.x = (p.x * 2 + a.x + b.x) / 4;
          p.y = (p.y + 2 * a.y + b.y) / 4;
        });

        g.beginFill(SECTOR_COLOR, 0.33);

        radialPoints.forEach(({ x, y }, i) => {
          if (!i) {
            g.moveTo(x, y);
          } else {
            g.lineTo(x, y);
          }
        });

        g.endFill();

        const split = _.random(0, radialPoints.length);
        radialPoints = radialPoints.slice(split).concat(radialPoints.slice(0, split));

        g.beginFill(SECTOR_COLOR, 0.33);

        radialPoints.forEach(({ x, y }, i) => {
          if (!i) {
            g.moveTo(x * 1.5, y * 1.5);
          } else {
            g.lineTo(x * 1.5, y * 1.5);
          }
        });

        g.endFill();

        const split2 = _.random(0, radialPoints.length);
        radialPoints = radialPoints.slice(split2).concat(radialPoints.slice(0, split2));

        g.beginFill(SECTOR_COLOR, 0.25);

        radialPoints.forEach(({ x, y }, i) => {
          if (!i) {
            g.moveTo(x * 2.5, y * 2.5);
          } else {
            g.lineTo(x * 2.5, y * 2.5);
          }
        });

        g.endFill();

        s.my.sectorContainer.addChild(g);
      });
    })
    .method('sizeSectors', (s, angle) => {
      const matrix = s.do.sectorMatrix();
      s.my.sectors.forEach((sector) => {
        if (!sector.graphics) {
          return;
        }
        const coord = new CubeCoord(sector.x, sector.y);
        const p = coord.toXY(matrix);
        const cAngle = _N(Math.atan2(p.x, p.y)).deg().plus(360).plus(angle)
          .mod(360);
        sector.graphics.alpha = 1 - cAngle.div(360).value;
      });
    })
    .property('stopped', false)
    .method('backRadius', (s) => _N(s.my.width).min(s.my.height).times(0.8).div(2)
      .round().value)
    .property('scanners', [], 'array')
    .method('scan', (s, init = false) => {
      if (s.my.stopped || (!s.my.scanContainer)) {
        return;
      }
      if (init) {
        s.my.scanContainer.removeChildren();
        const rad = s.do.backRadius();
        s.do.setScanners(_.range(2, SUBSECTOR_DIV, 2)
          .map((i) => {
            const c = new PIXI.Container();
            c.angle = _.random(-20, 20);
            _.range(1, 10, 0.5)
              .forEach((r) => {
                const g = new PIXI.Graphics();
                g.blendMode = PIXI.BLEND_MODES.ADD;
                const cc = new PIXI.Container();
                cc.angle = -r * 2 * (SUBSECTOR_DIV - i / 2) / SUBSECTOR_DIV;
                g.alpha = SCANNER_ALPHA * (10 - r) / 10;
                g.beginFill(SCANNER_COLOR)
                  .drawRect(0, (i - 1) * rad / SUBSECTOR_DIV, 4, 2 * rad / SUBSECTOR_DIV)
                  .endFill();
                cc.addChild(g);
                c.addChild(cc);
              });
            s.my.scanContainer.addChild(c);
            return c;
          }));
      }

      s.my.scanContainer.angle += SCANNER_ROTATION_SPEED;
      s.emit('scanAngle', s.my.scanContainer.angle);

      requestAnimationFrame(() => s.do.scan());
    })
    .property('anchor', null)
    .property('backGraphic', null)
    .property('backContainer', null)
    .method('centerAnchor', (s) => {
      if (s.my.anchor) {
        s.my.anchor.position = { x: s.my.width / 2, y: s.my.height / 2 };
      }
    })
    .property('scanContainer', null)
    .method('initAnchor', (s) => {
      if (s.my.anchor || !s.my.app) {
        return;
      }
      s.do.setAnchor(new PIXI.Container());
      s.do.setScanContainer(new PIXI.Container());
      s.do.setSectorContainer(new PIXI.Container());
      s.do.setBackGraphic(new PIXI.Graphics());
      s.do.setBackContainer(new PIXI.Container());
      s.my.backContainer.addChild(s.my.backGraphic);
      s.my.anchor.addChild(s.my.backContainer);
      s.my.anchor.addChild(s.my.scanContainer);
      s.my.anchor.addChild(s.my.sectorContainer);
      s.my.app.stage.addChild(s.my.anchor);
      s.do.centerAnchor();
    })
    .method('close', (s) => {
      s.do.setStopped(true);
      onClick();
    })
    .method('drawBackground', (s) => {
      if (s.my.stopped) {
        return;
      }
      s.do.initAnchor();
      if (!s.my.backGraphic) {
        return;
      }

      const rad = s.do.backRadius();
      s.my.backGraphic.clear()
        .beginFill(BACKGROUND_FILL)
        .drawCircle(0, 0, rad)
        .endFill();

      _.range(rad / SUBSECTOR_DIV, rad, 2 * rad / SUBSECTOR_DIV)
        .forEach((subRad) => {
          s.my.backGraphic
            .lineStyle({ width: 1, color: BACKGROUND_LINE, alpha: 0.25 })
            .drawCircle(0, 0, subRad);
        });

      const matrix = s.do.sectorMatrix();

      let g = new PIXI.Graphics();
      let count = 0;
      univSector.forEach((sub) => {
        if (Math.random() > 0.5) {
          return;
        }
        const xy = sub.coord.toXY(matrix);
        g.beginFill(BACKGROUND_LINE, 0.5)
          .drawCircle(xy.x, xy.y, 1)
          .endFill();
        if (++count > 50) {
          s.my.backContainer.addChild(g);
          g = new PIXI.Graphics();
        }
      });
      s.my.backContainer.addChild(g);

      s.do.scan(true);
    })
    .method('divide', (s) => {
      axios.get(divideUrl(s.my.galaxy))
        .then(({ data }) => {
          s.do.updateSectors(data);
        })
        .catch((err) => {
          console.log('error in getting data:', err);
        });
    });

  stream.on('initApp', 'drawBackground');
  stream.on('resizeApp', 'drawSectors');
  stream.on('resizeApp', 'drawBackground');
  stream.on('resizeApp', (s) => {
    console.log('resizing app');
    stream.do.scan(true);
  });

  stream.on('scanAngle', 'sizeSectors');

  stream.do.divide();
  return stream;
};
