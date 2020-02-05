import { proppify } from '@wonderlandlabs/propper';
import { Hexes } from '@wonderlandlabs/hexagony';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import be from 'bezier-easing';
import numberFormat from 'simple-number-formatter';
import Noise from 'simplex-noise';

const starCurve = be(0, 0.5, 0.25, 1);

function pc(n) {
  const percent = n * 100;
  if (n > 0) {
    return numberFormat(percent, '0,0 %');
  }
  return `${n} %`;
}

export class StarDisc {
  constructor(props) {
    this.x = _.get(props, 'x', 0);
    this.y = _.get(props, 'y', 0);
    this.diameter = _.get(props, 'diameter', 1);
    this.density = _.get(props, 'density', 1);
    this.refDiam = _.get(props, 'refDiam');
  }

  densityAt(sector) {
    const matrix = new Hexes({ scale: sector.diameter * 2, pointy: true });
    const p = sector.coord.toXY(matrix);

    const dist = _N(p.x).minus(this.x).sq()
      .plus(
        _N(p.y).minus(this.y).sq(),
      )
      .sqrt();

    const relDistance = dist.div(this.diameter).value;
    /*    if (!((sector.x % 10) || (sector.y % 10))) {
      console.log('===================== refDiameter:', numberFormat(this.refDiam, '0,0', { thousandsDelimeter: ',' }));
      console.log('sector diameter', numberFormat(sector.diameter, '0,0', { thousandsDelimeter: ',' }));
      console.log('refDiameter/sector.diameter', this.refDiam / sector.diameter);
      console.log('relative distance', numberFormat(relDistance, '0.000'));

      console.log('x: ', numberFormat(this.x, '0,0', { thousandsDelimeter: ',' }));
      console.log('y: ', numberFormat(this.y, '0,0', { thousandsDelimeter: ',' }));
      console.log('x% of refDiam: ', pc(this.x / this.refDiam));
      console.log('y% of refDiam: ', pc(this.y / this.refDiam));
      console.log('px: ', numberFormat(p.x, '0,0', { thousandsDelimeter: ',' }));
      console.log('py: ', numberFormat(p.y, '0,0', { thousandsDelimeter: ',' }));
      console.log('px% of refDiam: ', pc(p.x / this.refDiam));
      console.log('py% of refDiam: ', pc(p.y / this.refDiam));
    } */

    if (dist.value > this.diameter) return 0;
    return (1 - relDistance) ** 1.5;
  }
}

proppify(StarDisc)
  .addProp('x', 0, 'number')
  .addProp('y', 0, 'number')
  .addProp('density', 1, 'number')
  .addProp('diameter', 1, 'number');

StarDisc.random = (diam) => {
  const x = _.random(-diam / 10, diam / 10, true);
  const y = _.random(-diam / 10, diam / 10, true);
  const discDiameter = _N(diam).sub(_N(x).abs().max(_N(y).abs())).value;
  const density = _.random(0.5, 1);
  // const diameter = _.random(discDiameter / 4, discDiameter * 0.8, true);
  return new StarDisc({
    x, y, diameter: diam, refDiam: diam,
  });
};

export class GalaxyNoise {
  constructor({ diameter, density, scale }) {
    this.diameter = diameter;
    this.density = density;
    this.scale = scale || 10;
    this.noise = new Noise();
  }

  scaleDim(n) {
    return n * this.scale / this.diameter;
  }

  /**
   * returns a negative noise reducing the density throughout
   * @param sector
   * @returns {d}
   */
  densityAt(sector) {
    const matrix = new Hexes({ scale: sector.diameter * 2, pointy: true });
    const p = sector.coord.toXY(matrix);

    return _N(this.noise.noise2D(this.scaleDim(p.x), this.scaleDim(p.y))).minus(1).div(2).times(this.density).value;
  }
}


proppify(GalaxyNoise)
  .addProp('scale', 40, 'number')
  .addProp('diameter', 0, 'number');

GalaxyNoise.random = (diameter, scale = 40, density = 0.5) => new GalaxyNoise({ diameter, scale, density: density || _.random(0.25, 0.75, true) });
