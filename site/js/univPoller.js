import axios from 'axios';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';

import apiRoot from './util/apiRoot';

let pendingRequest = null;
let loading = false;
const getU = (x, y, range = 20) => `${apiRoot()}/uni/x0y0z0/${x},${y}?range=${range}`;
let lastParams = false;

async function loadUniv(params) {
  const { x, y, range } = params;

  // serialize all requests
  if (loading) { // save the most recent overlapping request
    pendingRequest = params;
    return;
  }

  // don't load redundant data
  if (_.isEqual(lastParams, params)) {
    return;
  }

  if (lastParams) {
    if (_N(x)
      .sub(lastParams.x)
      .abs()
      .max(
        _N(y).sub(lastParams.y).abs(),
      ).value < 5) {
      // last load too close to this one
      return;
    }
  }

  console.log('loadUniv: loading', params);
  loading = true;
  const { data } = await axios.get(getU(x, y, range));
  postMessage({
    message: 'univData', galaxies: data,
  });
  loading = false;
  lastParams = { ...params };

  if (pendingRequest) {
    const request = pendingRequest;
    pendingRequest = null;
    loadUniv(request);
  }
}

self.addEventListener('message', ({ data }) => {
  if (data.message === 'load') {
    loadUniv(data);
  } else {
    console.log('worker event listener: ignoring ', data);
  }
});


console.log('univPoller .... loaded');
