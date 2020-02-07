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

const BACKGROUND_FILL = chroma(30, 0, 15).num();
const WHITE = chroma(255, 255, 255).num();
const REF_DOTS = chroma(0, 0, 0).num();
const BACKGROUND_MARGIN = chroma(0, 0, 0).num();
const BACKGROUND_FILL_EMPTY = chroma(20, 20, 20).num();
const BACKGROUND_LINE = chroma(51, 102, 0).num();
const SCANNER_COLOR = BACKGROUND_LINE;
const SECTOR_COLOR = chroma(255, 225, 200).num();
const SCANNER_ROTATION_SPEED = 0.05;
const SCANNER_ALPHA = 0.25;
const TRANS_LENGTH = 800;
const TRANS_LINE_COLOR = chroma(204, 204, 255).num();
const TRANS_FILL_COLOR = chroma(0, 0, 0).num();

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

const divideUrl = (coord) => `https://univ-2019.appspot.com/uni/x0y0z0.x${coord.x}y${coord.y}z${coord.z}/_/divide`;

const univSector = new Universe({
  diameter: LY_PER_HEX,
  galaxies: 0,
});

univSector.makeSubsectors(SUBSECTOR_DIV);

const absMatrix = new Hexes({ scale: 1, ponty: true });

const ci = (n) => _N(n).round().clamp(0, 1).value;

/* ---------------- FACTORY ----------------- */

export default ({ size, galaxy, onClick }) => {
  const stream = pixiStreamFactory({ size });
  stream.name = 'galaxyStore';

  stream.property('galaxy', galaxy)
    .property('galaxyStars', null)
    .property('chosenGalaxy', false)
    .property('galaxyParts', [], 'array')
    .method('initGalaxyStars', (s) => {
      console.log('---- initGalaxyStars');
      s.do.setGalaxyParts([]);
      if (!s.my.chosenGalaxy) {
        s.do.setGalaxyStars(null);
        return;
      }
      console.log('chosenGalaxy', s.my.chosenGalaxy);
      const galaxyStars = new Universe({
        diameter: s.my.chosenGalaxy.d,
        galaxies: 0,
      });
      galaxyStars.makeSubsectors(STAR_DIV);
      s.do.setGalaxyStars(galaxyStars);
      console.log('making galaxy parts with diameter', galaxyStars.diameter);
      s.do.setGalaxyParts([
        StarDisc.random(galaxyStars.diameter, 0.5),
        new GalaxyNoise({ diameter: galaxyStars.diameter, scale: _.random(10, 20, true), density: _.random(0.05, 0.3) }),
        new GalaxyNoise({ diameter: galaxyStars.diameter, scale: _.random(20, 40, true), density: _.random(0.01, 0.3, true) }),
        GalaxySpiral.random(galaxyStars.diameter, _.random(0.5, 1.2)),
      ]);
      // console.log('galaxy diameter:', galaxyStars.diameter);
      //  console.log('parts:', s.my.galaxyParts);
      const [disc] = s.my.galaxyParts;
      //  console.log('disc x:', disc.x / galaxyStars.diameter);
      //  console.log('disc y:', disc.y / galaxyStars.diameter);
      //  console.log('disc diameter:', disc.diameter / galaxyStars.diameter);
      //  console.log('disc density:', disc.density);
      s.do.distributeStars();
      s.do.drawStars();
    }, true)
    .method('distributeStars', (s) => {
      if (!s.my.galaxyStars) {
        return;
      }

      const densities = [];

      s.my.galaxyStars.forEach((sector) => {
        sector.starDensity = 0;
        s.my.galaxyParts.forEach((part) => {
          sector.starDensity += part.densityAt(sector);
        });
        if (sector.starDensity > 0) {
          densities.push(sector.starDensity);
        }
      });

      const starMean = mean(densities);
      const starDev = standardDeviation(densities);
      // console.log('starMean', starMean, 'starDev', starDev);
      s.my.galaxyStars.forEach((sector) => {
        const maxStars = (sector.diameter ** 2) / 80;
        if (sector.starDensity > 0) {
          // console.log('-- max stars:', maxStars);
          // console.log(sector.x, ',', sector.y, 'original density: ', sector.starDensity);
          sector.starDensity = _N(sector.starDensity).sub(starMean).div(2 * starDev).plus(0.5)
            .clamp(1, 0).value;
          sector.stars = _N(sector.starDensity).times(maxStars).max(0).round().value;
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
    .method('updateSectors', (s, sectors) => {
      console.log('sectors updated:', sectors);
      s.do.setSectors(sectors);
      s.do.drawSectors(sectors);
    })
    .method('sectorMatrix', (s) => {
      /**
       * This matrix is calibrated to screen space, for a sctor
       * @type {number}
       */
      const scale = s.do.backRadius() / SUBSECTOR_DIV;
      return new Hexes({ scale, pointy: true });
    })
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
    .method('drawSectors', (s) => {
      s.my.sectorCtr.removeChildren();
      if (s.my.chosenGalaxy) {
        return;
      }
      const matrix = s.do.sectorMatrix();

      s.my.sectors.forEach((sector) => {
        const coord = new CubeCoord(sector.x, sector.y);
        const xy = coord.toXY(matrix);

        if (siteStore.my.galaxySheet) {
          const sprite = siteStore.do.randomSprite();
          sprite.interactive = true;
          sprite.on('click', (e) => s.do.chooseGalaxy(sector));
          sprite.buttonMode = true;

          s.my.sectorCtr.addChild(sprite);
          const scale = matrix.scale / _.random(40, 120);
          sprite.scale = { x: scale, y: scale };
          sprite.x = xy.x;
          sprite.y = xy.y;
          sector.graphics = sprite;

          s.my.sectorCtr.addChild(sprite);
        } else {
          const g = new PIXI.Graphics();
          sector.graphics = g;
          g.position = xy;

          g.interactive = true;
          g.on('click', (e) => s.do.chooseGalaxy(sector));

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

          s.my.sectorCtr.addChild(g);
        }
      });
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
      if (!s.my.galaxyStars) {
        return;
      }
      const matrix = s.do.starSectorMatrix();

      s.my.starCtr.removeChildren();

      // eslint-disable-next-line prefer-const
      let graphic = new PIXI.Graphics();
      s.my.starCtr.addChild(graphic);
      const stat = s.do.pollStars();
      let count = 0;
      console.log('star max: ', stat.max, 'mean', stat.mean, 'dev: ', stat.dev, 'radius scale:', matrix.scale);
      const densityGradient = gradient();
      console.log('gradient:', densityGradient);
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
    .property('lastScanTime', 0, 'number')
    .method('scan', (s, init = false) => {
      if (s.my.stopped || (!s.my.scanCtr)) {
        return;
      }
      if (init) {
        s.do.setLastScanTime(Date.now());
        s.my.scanCtr.removeChildren();
        const rad = s.do.backRadius();
        s.do.setScanners(_.range(2, SUBSECTOR_DIV, 2)
          .map((i) => {
            const c = new PIXI.Container();
            c.angle = _.random(Math.max(-20, -200 / i), Math.min(20, 200 / i));
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
            s.my.scanCtr.addChild(c);
            return c;
          }));
      }

      const time = Date.now();
      s.my.scanCtr.angle += SCANNER_ROTATION_SPEED * (time - s.my.lastScanTime);
      s.do.setLastScanTime(time);
      s.emit('scanAngle', s.my.scanCtr.angle);

      requestAnimationFrame(() => s.do.scan());
    })
    .property('anchor', null)
    .property('backGraphic', null)
    .property('backCtr', null)
    .method('centerAnchor', (s) => {
      if (s.my.anchor) {
        s.my.anchor.position = { x: s.my.width / 2, y: s.my.height / 2 };
      }
    })
    .property('scanCtr', null)
    .property('starCtr', null)
    .property('transGraphic', null)
    .method('initAnchor', (s) => {
      if (s.my.anchor || !s.my.app) {
        return;
      }
      s.do.setAnchor(new PIXI.Container());
      s.do.setScanCtr(new PIXI.Container());
      s.do.setSectorCtr(new PIXI.Container());
      s.do.setStarCtr(new PIXI.Container());
      s.do.setBackGraphic(new PIXI.Graphics());
      s.do.setTransGraphic(new PIXI.Graphics());
      s.do.setBackCtr(new PIXI.Container());
      s.my.backCtr.addChild(s.my.backGraphic);
      s.my.anchor.addChild(s.my.backCtr);
      s.my.anchor.addChild(s.my.scanCtr);
      s.my.anchor.addChild(s.my.sectorCtr);
      s.my.anchor.addChild(s.my.transGraphic);
      s.my.anchor.addChild(s.my.starCtr);
      s.my.app.stage.addChild(s.my.anchor);
      s.do.centerAnchor();
      s.do.listenToClicks();
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
        .beginFill(BACKGROUND_MARGIN)
        .drawCircle(0, 0, rad * 1.1)
        .endFill()
        .beginFill(s.do.noSectors() ? BACKGROUND_FILL_EMPTY : BACKGROUND_FILL)
        .drawCircle(0, 0, rad)
        .endFill();

      _.range(rad / SUBSECTOR_DIV, rad, 2 * rad / SUBSECTOR_DIV)
        .forEach((subRad) => {
          s.my.backGraphic
            .lineStyle({ width: 1, color: BACKGROUND_LINE, alpha: 0.25 })
            .drawCircle(0, 0, subRad);
        });

      s.do.drawDots();
    })
    .method('drawDots', (s) => {
      const matrix = s.do.sectorMatrix();

      let g = new PIXI.Graphics();
      let count = 0;
      univSector.forEach((sub) => {
        if (Math.random() > 0.5) {
          return;
        }
        const xy = sub.coord.toXY(matrix);
        g.beginFill(REF_DOTS)
          .drawCircle(xy.x, xy.y, 3)
          .endFill();
        if (++count > 50) {
          s.my.backCtr.addChild(g);
          g = new PIXI.Graphics();
        }
      });
      s.my.backCtr.addChild(g);
    })
    .property('sectorsLoaded', false, 'boolean')
    .method('noSectors', (s) => !_.get(s, 'my.sectors.length'))
    .method('checkSectors', (s) => {
      console.log('checkSectors -----');
      if (s.my.sectorsLoaded) {
        if (s.do.noSectors()) {
          console.log('fading');
          s.do.setStopped(true);
          s.do.fadeScanner(true);
        } else {
          console.log('we have galaxies');
        }
      } else {
        console.log('checkSectors: sectors not loaded');
      }
    })
    .property('fadeStart', 0, 'number')
    .method('fadeScanner', (s, init = false) => {
      if (init) {
        s.do.setFadeStart(Date.now());
        s.do.drawBackground();
      }
      const time = Date.now();

      const elapsed = time - s.my.fadeStart;
      if (elapsed > 2000) {
        s.my.scanCtr.visible = false;
      } else {
        s.my.scanCtr.alpha = 1 - (elapsed / 2000);
        requestAnimationFrame(() => s.do.fadeScanner());
      }
    })
    .property('sectorsLoadError', null)
    .method('listenToClicks', (s) => {
      s.my.sectorCtr.interactiveChildren = true;
      s.my.app.stage.interactiveChildren = true;
      /*      console.log('----listenToClicks');
      s.my.backGraphic.interactive = true;
      s.my.backGraphic.buttonMode = true;
      s.my.backGraphic.on('pointerdown', (e) => {
        console.log('background  --- pointerdown:', e);
      }); */
    })
    .method('chosenGalaxyChange', (s, to, prev) => {
      if (!to) {
        if (prev) {
          s.do.closeGalaxy();
        }
      } else if (!prev) {
        s.do.openGalaxy();
      }
    })
    .property('zoomState', 'closed', 'string')
    .property('targetZoomState', 'closed', 'string')
    .property('zoomTransLevel', 0, 'number')
    .watchFlat('zoomTransLevel', (s, value) => {
      if (s.my.sectorCtr) {
        s.my.sectorCtr.alpha = (1 - value);
      }
    })
    .method('closeGalaxy', (s) => {
      s.do.setTargetZoomState('closed');
    })
    .method('openGalaxy', (s) => {
      s.do.setTargetZoomState('open');
    })
    .watchFlat('targetZoomState', (s, to, prev) => {
      if (to !== prev && to !== s.my.zoomState) {
        s.do.transition(true);
      }
    })
    .property('transTime', 0, 'number')
    .method('transition', (s, init = false) => {
      if (init) {
        s.do.setTransTime(Date.now());
      }
      if (s.my.targetZoomState === s.my.zoomState) {
        s.do.setZoomTransLevel(s.my.zoomState === 'closed' ? 0 : 1);
      } else {
        const amount = _N(Date.now()).sub(s.my.transTime).div(TRANS_LENGTH).clamp(0, 1).value;
        if (s.my.targetZoomState === 'closed') {
          s.do.setZoomTransLevel(1 - amount);
        } else {
          s.do.setZoomTransLevel(amount);
        }
      }
      s.do.drawTransition();
      if (s.my.targetZoomState === 'closed') {
        if (s.my.zoomTransLevel > 0) {
          requestAnimationFrame(() => s.do.transition());
        }
      } else if (s.my.targetZoomState === 'open') {
        if (s.my.zoomTransLevel < 1) {
          requestAnimationFrame(() => s.do.transition());
        }
      }
    })
    .method('drawTransition', (s) => {
      if (!s.my.transGraphic) {
        return;
      }
      s.my.transGraphic.clear();
      const rad = s.do.backRadius();
      s.my.transGraphic.lineStyle({ width: 2, color: TRANS_LINE_COLOR })
        .beginFill(TRANS_FILL_COLOR)
        .drawCircle(0, 0, rad * s.my.zoomTransLevel)
        .endFill();
    })
    .method('divide', (s) => {
      axios.get(divideUrl(s.my.galaxy))
        .then(({ data }) => {
          s.do.updateSectors(data);
          s.do.setSectorsLoaded(true);
          s.do.drawBackground();
        })
        .catch((err) => {
          console.log('error in getting data:', err);
          s.do.setSectorsLoadError(err);
        });
    });

  stream.on('initApp', 'drawBackground');
  stream.on('resizeApp', 'drawSectors');
  stream.on('resizeApp', 'drawBackground');
  stream.on('resizeApp', (s) => s.do.scan(true));
  stream.watch('sectorsLoaded', 'checkSectors');
  stream.on('resizeApp', (s) => {
    console.log('resizing app');
    stream.do.scan(true);
  });

  stream.on('scanAngle', 'sizeSectors');
  stream.watchFlat('chosenGalaxy', 'chosenGalaxyChange');

  stream.do.divide();
  return stream;
};
