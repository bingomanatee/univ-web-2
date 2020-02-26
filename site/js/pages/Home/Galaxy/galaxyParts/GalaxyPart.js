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
    .watch('x,', 'redraw')
    .watch('y,', 'redraw')
    .watch('diameter,', 'redraw')
    .watch('density,', 'redraw')
    .property('galaxyStream', null)
    .property('matrix', null)
    .watchFlat('galaxyStream', (s, galaxyStream) => {
      const stars = galaxyStream.my.galaxyStar.getChildren();
      const matrix = new Hexes({ scale: stars[0].diameter * 2, pointy: true });
      s.do.setMatrix(matrix);
    })
    .property('cache', new Map())
    // note - children must implement method 'valueAt(s, x, y)';
    .method('densityAt', (s, sector, id) => {
      if (!s.my.cache.has(id)) {
        const { x, y } = sector.get('point2d');
        if (s.my.density <= 0) {
          s.my.cache.set(id, 0);
        } else {
          s.my.cache.set(id, s.do.valueAt(x, y) * s.my.density);
        }
      }
      return s.my.cache.get(id);
    })
    .method('refreahCache', (s) => {
      if (!s.my.galaxyStream) {
        return;
      }
      const map = new Map();
      s.do.setCache(map); // clear the cache so densityAt sets new value
      s.my.galaxyStream.forEach(s.do.densityAt);
    })
    .method('redraw', (s) => {
      if (s.my.galaxyStream) {
        s.my.galaxyStream.do.redraw();
      }
    })
    .property('gsSub', null);

  return stream;
};
