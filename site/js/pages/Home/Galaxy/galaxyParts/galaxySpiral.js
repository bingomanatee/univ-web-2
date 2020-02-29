import Noise from 'simplex-noise';
import _ from 'lodash';
import N from '@wonderlandlabs/n';
import galaxyPart from './galaxyPart';

function arcTan(x, y) {
  const angle = Math.atan2(y, x);
  return N(angle).deg().plus(360).mod(360).value;
}

export default (props = {}) => {
  const scale = _.get(props, 'scale', _.random(10, 20, true));
  const stream = galaxyPart('spiral', props);
  stream
  /*    .method('noiseAt', (s, x, y) => {
      const noiseScale = s.do.noiseScale();
      const dx = x - s.my.x;
      const dy = y - s.my.y;
      return s.my.noiseGen.noise2D(noiseScale * dx, noiseScale * dy);
    }) */
    .method('valueAt', (s, x, y) => {
      // console.log('noiseScale for galaxyNoise is ', noiseScale);
      const re = s.do.radialEffect(x, y);
      if ((!x) && (!y)) console.log('========== radialEffect at', x, y, 'is', re);
      const rs = s.do.radialStrength(x, y);
      // console.log('noise at ', x, y, 'is', noise);
      return rs * re;
    })
    .method('radialStrength', (s, x, y) => {
      const dx = x - s.my.x;
      const dy = y - s.my.y;
      const ly2px = s.my.galaxyStream ? s.my.galaxyStream.do.lyToPx() : 1;
      const distance = s.do.distance(x, y);
      const angle = arcTan(dx, dy);
      const angleOffset = N(distance).times(ly2px).div(2).value; // add to angle based on radius to give "spin"

      const effectiveAngle = N(angle).plus(angleOffset).times(s.my.arcs).mod(360);
      const height = s.my.angleToHeight(effectiveAngle.value, distance);
      // console.log('x:', x, 'y:', y, 'distance:', distance, 'height:', height, 'angle: ',
      // effectiveAngle.value, 'offset', angleOffset);
      return height;
    })
    // translates an angle (0-360) to a density.
    .property('angleToHeight', (angle, distance) => {
      // humps are higher in the center, lower on the edge
      const relativeDistance = N(distance).div(stream.my.diameter).minus(1).times(-1);
      return N(angle).sin(true).plus(relativeDistance).div(2)
        .clamp(0, 1).value;
    })
    // attenuation -- IF ANY -- due to distance from the center.
    // note unlike other parts, noise MIGHT show up outside of its diameter if
    // the radiusCurve isn't zero at its maximum extent
    .method('radialEffect', (s, x, y) => {
      const distance = s.do.distance(x, y);
      // console.log('returning radial effect at distance', distance, 'for diameter', s.my.diameter,
      // 'using radiusCurve', s.my.radiusCurve);
      return s.my.radiusCurve(_.clamp(distance / s.my.diameter, 0, 1));
    })
    .method('noiseScale', (s) => ((s.diameter === 0) ? 0 : s.my.scale / s.my.diameter))
    .property('radiusCurve', (radPercent) => Math.sqrt(1 - radPercent))
    // how to diminish the noise due to distance from the center of the space
    .property('valueCurve', (n) => (n + 1) / 2, 'function')
    // translates the noise range (-1 ...1) to a 0..1 range
    .property('scale', scale, 'number')
    .property('arcs', _.random(5, 11), 'integer')
    // how coarse the noise is. The higher the value the smoother the noise.
    .property('noiseGen', new Noise());

  stream.do.setIconType('icon-spiral');
  return stream;
};
