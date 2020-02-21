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
import { StarDisc, GalaxyNoise, GalaxySpiral } from './galaxyUtils';

const densityGradientBlue = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(25, 15, 51).css(),
  chroma(125, 80, 145).css(),
  chroma(133, 102, 175).css(),
  chroma(220, 255, 255).css(),
]);

const densityGradientRed = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(51, 15, 25).css(),
  chroma(145, 80, 125).css(),
  chroma(175, 102, 133).css(),
  chroma(255, 245, 245).css(),
]);

const densityGradientGreen = tinygradient([
  chroma(10, 10, 10).css(),
  chroma(15, 51, 25).css(),
  chroma(80, 145, 125).css(),
  chroma(102, 175, 133).css(),
  chroma(245, 255, 245).css(),
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
    .property('galaxyParts', [], 'array')
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
      s.do.setGalaxyParts([
        StarDisc.random(galaxyStars.diameter, 0.5),
        new GalaxyNoise({
          diameter: galaxyStars.diameter,
          scale: _.random(10, 20, true),
          density: _.random(0.05, 0.3),
        }),
        new GalaxyNoise({
          diameter: galaxyStars.diameter,
          scale: _.random(20, 40, true),
          density: _.random(0.01, 0.3, true),
        }),
        GalaxySpiral.random(galaxyStars.diameter, _.random(0.5, 1.2)),
      ]);
      s.do.distributeStars();
      s.do.drawStars();
    }, true)
    .method('updatePartPos', (s, part, x, y) => {
      part.x = x;
      part.y = y;

      s.do.distributeStars();
      s.do.drawStars();
    })
    .method('distributeStars', (s) => {
      if (!s.my.galaxyStars) {
        return;
      }

      const densities = [];

      s.my.galaxyStars.forEach((sector) => {
        sector.starDensity = 0;
        sector.stars = 0;
        s.my.galaxyParts.forEach((part) => {
          sector.starDensity += part.densityAt(sector);
        });
        if (sector.starDensity > 0) {
          densities.push(sector.starDensity);
        }
      });

      // const starMean = mean(densities);
      // const starDev = standardDeviation(densities);
      // console.log('starMean', starMean, 'starDev', starDev);
      s.my.galaxyStars.forEach((sector) => {
        const maxStars = (sector.diameter ** 2) / 80;
        if (sector.starDensity > 0) {
        /*  sector.starDensity = _N(sector.starDensity).sub(starMean).div(2 * starDev).plus(0.5)
            .clamp(1, 0).value;
            // no longer normalizing star density
            */
          sector.stars = _N(sector.starDensity).clamp(0, 1).times(maxStars).round().value;
          // console.log(sector.x, ',', sector.y, 'density: ', sector.starDensity, 'stars', sector.stars);
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
      const stat = s.do.pollStars();
      let count = 0;
      console.log('star max: ', stat.max, 'mean', stat.mean, 'dev: ', stat.dev, 'radius scale:', matrix.scale);
      const densityGradient = gradient();
      s.my.galaxyStars.forEach((sector) => {
        const opacity = _N(sector.stars).div(stat.max)
          .clamp(0, 1).value;
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
