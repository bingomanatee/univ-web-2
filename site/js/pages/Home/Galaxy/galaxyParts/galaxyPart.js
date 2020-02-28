import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import { Hexes } from '@wonderlandlabs/hexagony';
import _ from 'lodash';

export default (name, props = {}) => {
  const diameter = _.get(props, 'diameter', 100);
  const x = _.get(props, 'x', 0);
  const y = _.get(props, 'y', 0);
  const density = _.get(props, 'density', 1);

  const stream = new ValueStream(name)
    .property('x', x, 'number')
    .property('y', y, 'number')
    .property('diameter', diameter, 'number')
    .property('density', density, 'number')
    .watch('x', 'redraw')
    .watch('y', 'redraw')
    .watch('diameter', 'redraw')
    .watch('density', 'redraw')
    .property('galaxyStream', null)
    .property('matrix', null)
    .property('iconType', 'undefined', 'string')
    .watchFlat('galaxyStream', (s, galaxyStream) => {
      if (!galaxyStream) return;
      if (!galaxyStream.my.galaxyStars) return;
      const stars = galaxyStream.my.galaxyStars.getChildren();
      const matrix = new Hexes({ scale: stars[0].diameter * 2, pointy: true });
      s.do.setMatrix(matrix);
    })
    .property('cache', new Map())
    // note - children must implement method 'valueAt(s, x, y)';
    .method('densityAt', (s, sector, id) => {
      if (!s.my.cache.has(id)) {
        const { x: pX, y: pY } = sector.get('point2d');
        if (s.my.density <= 0) {
          s.my.cache.set(id, 0);
        } else {
          const value = s.do.valueAt(pX, pY);
          // console.log('======== setting cache for id', id, 'to , ', value, '* ', s.my.density);
          s.my.cache.set(id, value * s.my.density);
        }
      }
      return s.my.cache.get(id);
    })
    .method('randomDiameter', (s, min, max) => {
      this.do.setDiameter(_.random(min, max, true));
    })
    .method('refreshCache', (s) => {
      const map = new Map();
      s.do.setCache(map); // clear the cache so densityAt sets new value
      if (!s.my.galaxyStream) {
        return;
      }
      s.my.galaxyStream.my.galaxyStars.forEach(s.do.densityAt);
      s.my.galaxyStream.do.distributeStars();
    })
    .method('redraw', (s) => {
      s.do.refreshCache();
      if (s.my.galaxyStream) {
        // console.log('========== redrawing a galaxy because of update to ', s.my.iconType);
        s.my.galaxyStream.do.redraw();
      } else {
        // console.log('not redrawing part - no galaxyStream');
      }
    })
    .property('gsSub', null);

  stream.subscribe(false, (e) => {
    console.log('error in part stream: ', e);
  });
  return stream;
};
