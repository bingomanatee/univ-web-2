import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';

/**
 * this is a general portal that has a PIXI display element
 * @param size {Object}
 * @returns {ValueSteram}
 */
export default ({ size }) => {
  const stream = new ValueStream('home-stream')
    .property('initialized', false, 'boolean')
    .method('tryInit', (store, ele, iSize) => {
      if (store.my.initialized) return;
      if (ele) {
        store.do.setEle(ele);
        const app = new PIXI.Application({ transparent: true, forceFXAA: true });
        const { width, height } = (iSize || size);
        store.set('width', width, 'height', height, 'app', app);

        // eslint-disable-next-line no-param-reassign
        ele.innerHTML = '';
        store.do.setApp(app);
        ele.appendChild(app.view);
        store.do.resizeApp(iSize);
        store.do.setInitialized(true);
        store.emit('initApp');
      }
    }, true)
    .method('resizeApp', (store, { width, height }) => {
      const app = store.get('app');
      store.set('width', width, 'height', height);
      if (app) {
        app.renderer.resize(width, height);
        store.emit('resized', { width, height });
      }
    })
    .property('x', 0, 'number')
    .property('y', 0, 'number')
    .property('ele', null)
    .property('width', _.get(size, 'width', 0), 'number')
    .property('height', _.get(size, 'height', 0), 'number')
    .property('app', null);

  return stream;
};
