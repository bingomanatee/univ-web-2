import Noise from 'simplex-noise';
import _ from 'lodash';
import GalaxyPart from './GalaxyPart';

export default (props = {}) => {
  const scale = _.get(props, 'scale', _.random(10, 20, true));
  const stream = GalaxyPart('noise', props);
  stream
    .method('valueAt', (s, x, y) => {
      const noiseScale = s.my.noiseScale();
      return s.my.noise.noise2d(noiseScale * x, noiseScale * y)
        * s.do.radialEffect(x, y);
    })
    // attenuation -- IF ANY -- due to distance from the center.
    // note unlike other parts, noise MIGHT show up outside of its diameter if
    // the radiusCurve isn't zero at its maximum extent
    .method('radialEffect', (s, x, y) => {
      const distance = Math.sqrt(x ** 2 + y ** 2);
      return s.my.radiusCurve(_.clamp(distance / s.my.diameter, 0, 1));
    })
    .method('noiseScale', (s) => ((s.diameter === 0) ? 0 : s.my.scale / s.my.diameter))
    .property('radiusCurve', (n, radPercent) => (1 - radPercent))
    // how to diminish the noise due to distance from the center of the space
    .property('valueCurve', (n) => (n + 1) / 2, 'function')
    // translates the noise range (-1 ...1) to a 0..1 range
    .property('scale', scale, 'number')
    // how coarse the noise is. The higher the value the smoother the noise.
    .property('noiseGen', new Noise());

  return stream;
};
