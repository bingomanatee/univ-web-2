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
  }

  densityAt(sector) {
    const p = sector.p2d;

    const dist = _N(p.x).minus(this.x).sq()
      .plus(
        _N(p.y).minus(this.y).sq(),
      )
      .sqrt();

    const relDistance = dist.div(this.diameter).value;

    if (dist.value > this.diameter) {
      return 0;
    }
    return this.density * (1 - relDistance) ** 1.5;
  }
}

proppify(StarDisc)
  .addProp('x', 0, 'number')
  .addProp('y', 0, 'number')
  .addProp('density', 1, 'number')
  .addProp('iconType', 'icon-radial')
  .addProp('diameter', 1, 'number');

StarDisc.random = (diam, density = 0.25) => {
  const x = _.random(-diam / 10, diam / 10, true);
  const y = _.random(-diam / 10, diam / 10, true);
  const discDiameter = _N(diam).sub(_N(x).abs().max(_N(y).abs())).value;

  return new StarDisc({
    x, y, diameter: discDiameter, density,
  });
};

export class GalaxySpiral {
  constructor(props) {
    console.log('new GalaxySpiral', props);
    this.x = _.get(props, 'x', 0);
    this.spin = _.get(props, 'spin', 1);
    this.y = _.get(props, 'y', 0);
    this.diameter = _.get(props, 'diameter', 1);
    this.density = _.get(props, 'density', 1);
    this.arms = _.get(props, 'arms', 5);
    this.twirls = _.get(props, 'twirls', 0.5);
  }

  distance(p) {
    return _N(p.x).minus(this.x).sq()
      .plus(
        _N(p.y).minus(this.y).sq(),
      )
      .sqrt().value;
  }

  densityAt(sector) {
    const p = sector.p2d;

    const dist = this.distance(p);
    if (dist > this.diameter) {
      return 0;
    }

    const aX = p.x - this.x;
    const aY = p.y - this.y;
    const relDistance = _N(dist).div(this.diameter);

    const angle = _N(Math.atan2(aY, aX))
      .deg();

    const sin = angle.times(this.spin)
      .plus(360)
      .plus(relDistance.times(this.twirls).times(360))
      .mod(360)
      .times(this.arms)
      .sin(true)
      .plus(1)
      .div(2)
      .max(0);


    const midPeak = _N(0.4)
      .minus(relDistance.minus(0.5).abs())
      .times(2);

    const radialDensity = sin
      .plus(midPeak)
      .div(2)
      .max(0)
      .times(this.density);
    /*
    if (!(sector.x % 10 || sector.y % 10)) {
      console.log('point:', aX, aY, 'angle: ', angle.round().value);
      console.log('sin is ', sin.value, 'rel distance', relDistance, 'midPeak:', midPeak.value);
      console.log('radial density: ', radialDensity.value);
    } */

    return radialDensity.minus(0.3).max(0).value;
  }
}

proppify(GalaxySpiral)
  .addProp('x', 0, 'number')
  .addProp('y', 0, 'number')
  .addProp('density', 1, 'number')
  .addProp('diameter', 1, 'number')
  .addProp('iconType', 'icon-spiral')
  .addProp('arms', 5, 'number')
  .addProp('spin', 1, 'number')
  .addProp('twirls', 1, 'number');

GalaxySpiral.random = (diam, density = 0.8) => {
  const x = _.random(-diam / 10, diam / 10, true);
  const y = _.random(-diam / 10, diam / 10, true);
  const discDiameter = _N(diam).sub(_N(x).abs().max(_N(y).abs())).value;
  const spin = _([-1, 1]).shuffle().first();
  console.log('galaxy spiral random diameter: ', diam, 'discDiameter: ', discDiameter);
  return new GalaxySpiral({
    arms: _.random(5, 8),
    x,
    y,
    spin,
    diameter: discDiameter,
    density,
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
    return (n * this.scale) / this.diameter;
  }

  /**
   * returns a negative noise reducing the density throughout
   * @param sector
   * @returns {d}
   */
  densityAt(sector) {
    const p = sector.p2d;
    return _N(this.noise.noise2D(this.scaleDim(p.x), this.scaleDim(p.y)))
      .minus(1).div(2).times(this.density)
      .clamp(-1, 0).value;
  }
}


proppify(GalaxyNoise)
  .addProp('scale', 40, 'number')
  .addProp('iconType', 'icon-noise')
  .addProp('density', 1, 'number')
  .addProp('diameter', 0, 'number');

GalaxyNoise.random = (diameter, scale = 40, density = 0.15) => new GalaxyNoise({
  diameter,
  scale,
  density,
});
