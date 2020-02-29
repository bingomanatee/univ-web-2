import Noise from 'simplex-noise';
import _ from 'lodash';
import galaxyPart from './galaxyPart';

export default (props = {}) => {
  const scale = _.get(props, 'scale', _.random(10, 20, true));
  const stream = galaxyPart('noise', props);
  stream
    .method('noiseAt', (s, x, y) => {
      const noiseScale = s.do.noiseScale();
      const dx = x - s.my.x;
      const dy = y - s.my.y;
      return s.my.noiseGen.noise2D(noiseScale * dx, noiseScale * dy);
    })
    .method('valueAt', (s, x, y) => {
      // console.log('noiseScale for galaxyNoise is ', noiseScale);
      const re = s.do.radialEffect(x, y);
      if ((!x) && (!y)) console.log('========== radialEffect at', x, y, 'is', re);
      const noise = s.do.noiseAt(x, y);
      // console.log('noise at ', x, y, 'is', noise);
      return s.my.valueCurve(noise) * re;
    })
    // attenuation -- IF ANY -- due to distance from the center.
    // note unlike other parts, noise MIGHT show up outside of its diameter if
    // the radiusCurve isn't zero at its maximum extent
    .method('radialEffect', (s, x, y) => {
      const dx = x - s.my.x;
      const dy = y - s.my.y;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      // console.log('returning radial effect at distance', distance, 'for diameter',
      // s.my.diameter, 'using radiusCurve', s.my.radiusCurve);
      return s.my.radiusCurve(_.clamp(distance / s.my.diameter, 0, 1));
    })
    .method('noiseScale', (s) => ((s.diameter === 0) ? 0 : s.my.scale / s.my.diameter))
    .property('radiusCurve', (radPercent) => (1 - radPercent))
    // how to diminish the noise due to distance from the center of the space
    .property('valueCurve', (n) => (n + 1) / 2, 'function')
    // translates the noise range (-1 ...1) to a 0..1 range
    .property('scale', scale, 'number')
    // how coarse the noise is. The higher the value the smoother the noise.
    .property('noiseGen', new Noise());

  stream.do.setIconType('icon-noise');
  return stream;
};
