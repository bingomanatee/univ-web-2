import axios from 'axios';
import { CubeCoord, Hexes } from '@wonderlandlabs/hexagony';
import { Universe } from '@wonderlandlabs/universe';
import tinygradient from 'tinygradient';
import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import { standardDeviation, mean } from 'simple-statistics';
import pixiStreamFactory from '../../../store/pixiStreamFactory';
import { LY_PER_HEX, SUBSECTOR_DIV, STAR_DIV } from '../../../util/constants';
import siteStore from '../../../store/site.store';
import galaxyNoise from './galaxyParts/galaxyNoise';
import galaxySpiral from './galaxyParts/galaxySpiral';

const densityGradientBlue = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(125, 80, 145).css(),
  chroma(133, 102, 175).css(),
  chroma(220, 255, 255).css(),
  chroma(255, 255, 255).css(),
]);

const densityGradientRed = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(145, 80, 125).css(),
  chroma(175, 102, 133).css(),
  chroma(255, 245, 245).css(),
  chroma(255, 255, 255).css(),
]);

const densityGradientGreen = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(80, 145, 125).css(),
  chroma(102, 175, 133).css(),
  chroma(245, 255, 245).css(),
  chroma(255, 255, 255).css(),
]);

const gradient = () => _([densityGradientBlue, densityGradientGreen, densityGradientRed]).shuffle().first();

const ci = (n) => _N(n).round().clamp(0, 1).value;

const BLACK = chroma(0, 0, 0).num();

/* ---------------- FACTORY ----------------- */

export default ({
  size, galaxy, onClose,
}) => {
  const stream = pixiStreamFactory({ size });
  stream.name = 'galaxyStore';

  console.log('-------------------------------------- galaxy store created');
  stream
    .property('galaxyStars', null)
    .property('chosenGalaxy', galaxy)
    .property('gradient', gradient())
    .property('galaxyParts', [], 'array')
    .method('lyToPx', (s) => _N(s.do.backRadius()).div(s.my.chosenGalaxy.d).value)
    .method('initGalaxyStars', (s) => {
      s.do.setGalaxyParts([]);
      if (!s.my.chosenGalaxy) {
        s.do.setGalaxyStars(null);
        return;
      }
      const galaxyStars = new Universe({
        diameter: s.my.chosenGalaxy.d,
        galaxies: 0,
      });
      galaxyStars.makeSubsectors(STAR_DIV);
      s.do.setGalaxyStars(galaxyStars);
      const noise = galaxyNoise({
        diameter: galaxyStars.diameter / 2,
        scale: _.random(10, 20, true),
        density: _.random(0.02, 0.7),
      });

      noise.do.setValueCurve((n) => (n - 1) / 2);
      noise.do.setRadiusCurve(() => 1);
      s.do.setGalaxyParts([noise,
        galaxySpiral({
          diameter: galaxyStars.diameter / 2,
          density: _.random(0.2, 0.7),
        }),
      ]);
      s.my.galaxyParts.forEach((part) => {
        part.do.setGalaxyStream(s);
      });
      s.do.distributeStars();
      debDraw();
    }, true)
    .method('updatePartDensity', (s, part, density) => {
      part.density = density;
    })
    .method('updatePartDiameter', (s, part, diameter) => {
      part.diameter = diameter;
    })
    .method('redraw', () => debDraw())
    .method('updatePartPos', (s, part, x, y) => {
      part.x = x;
      part.y = y;
    })
    .method('initSectorForDensity', (s, sector, matrix) => {
      if (!sector.has('point2d')) {
        sector.set('point2d', sector.coord.toXY(matrix));
      }
      sector.starDensity = 0;
      sector.stars = 0;
    })
    .method('maxStars', (s) => (s.my.galaxyStars.getChildren()[0].diameter ** 2) / 80)
    .method('distributeStars', (s) => {
      const parts = s.my.galaxyParts;
      if (!parts.length) {
        return;
      }
      const { matrix } = parts[0].my;
      s.my.galaxyStars.forEach((sector) => {
        s.do.initSectorForDensity(sector, matrix);
      });

      parts.forEach((part) => {
        s.my.galaxyStars.forEach((sector, id) => {
          const density = part.do.densityAt(sector, id);
          // console.log('density at ', id, 'for', part.my.iconType, 'is', density);
          sector.starDensity += density;
        });
      });

      const maxStars = s.do.maxStars();

      s.my.galaxyStars.forEach((sector) => {
        if (sector.starDensity > 0) {
          sector.stars = _N(sector.starDensity).clamp(0, 1).times(maxStars).round().value;
        }
      });
    })
    .method('chooseGalaxy', (s, sector) => {
      s.do.setChosenGalaxy(sector);
      s.do.initGalaxyStars();
    }, true)
    .property('sectors', [], 'array')
    .property('sectorCtr', null)
    .method('starSectorMatrix', (s) => {
      /**
       * This matrix is calibrated to screen space, for a galaxy
       * @type {number}
       */
      const scale = s.do.backRadius() / STAR_DIV;
      return new Hexes({ scale, pointy: true });
    })
    .method('starMatrix', (s) => {
      /**
       * this matrix is calibrated to light years
       */
      if (!s.my.galaxyStars) {
        return null;
      }
      const firstChild = Array.from(s.my.galaxyStars.children)[0];
      return new Hexes({ scale: firstChild.diameter * 2, pointy: true });
    })
    .method('pollStars', (s) => {
      const stars = [];
      s.my.galaxyStars.forEach((sector) => {
        if (sector.stars > 0) {
          stars.push(sector.stars);
        }
      });

      return { mean: mean(stars), dev: standardDeviation(stars), max: _.max(stars) };
    })
    .method('drawStars', (s) => {
      const t = Date.now();
      if (!s.my.galaxyStars) {
        return;
      }
      const matrix = s.do.starSectorMatrix();

      s.my.starCtr.removeChildren();

      // eslint-disable-next-line prefer-const
      let graphic = new PIXI.Graphics();
      graphic.beginFill(BLACK)
        .drawCircle(0, 0, s.do.backRadius())
        .endFill();

      s.my.starCtr.addChild(graphic);
      let count = 0;
      const densityGradient = s.my.gradient;
      s.my.galaxyStars.forEach((sector) => {
        const opacity = _N(sector.starDensity).clamp(0, 1).value;
        const color = densityGradient.rgbAt(opacity);
        const crColor = chroma(color.toRgbString()).num();

        const { x, y } = sector.coord.toXY(matrix);

        //  console.log('sector', sector.x, sector.y, 'opacity: ', opacity);

        graphic.beginFill(crColor, 1)
          .drawCircle(x, y, matrix.scale / 2)
          .endFill();
        if (++count > 50) {
          s.my.starCtr.addChild(graphic);
          graphic = new PIXI.Graphics();
          count = 0;
        }
      });
      s.my.starCtr.addChild(graphic);
      const t2 = Date.now();
      console.log('---- draw time  = ', t2 - t);
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
    .property('anchor', null)
    .method('centerAnchor', (s) => {
      if (s.my.anchor) {
        s.my.anchor.position = { x: s.my.width / 2, y: s.my.height / 2 };
      }
    })
    .property('starCtr', null)
    .property('transGraphic', null)
    .method('initAnchor', (s) => {
      if (s.my.anchor || !s.my.app) {
        return;
      }
      s.do.setAnchor(new PIXI.Container());
      s.do.setStarCtr(new PIXI.Container());
      s.my.anchor.addChild(s.my.starCtr);
      s.my.app.stage.addChild(s.my.anchor);
      s.do.centerAnchor();
    })
    .method('close', (s) => {
      onClose();
    });

  stream.do.initGalaxyStars();

  const debDraw = _.debounce(() => {
    stream.do.drawStars();
  }, 300);

  stream.on('initApp', (s) => {
    s.do.initAnchor();
    setTimeout(() => {
      s.do.initGalaxyStars();
    }, 150);
  });
  stream.on('resizeApp', (s) => {
    s.do.centerAnchor();
    s.do.initStars();
  });

  return stream;
};
