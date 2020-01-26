import { proppify } from '@wonderlandlabs/propper';
import { CubeCoord } from '@wonderlandlabs/hexagony';
import _N from '@wonderlandlabs/n';
import * as PIXI from 'pixi.js';
import is from 'is';

const DIAMOND_DIV = 8;

class HexDiamond {
  constructor(id, counts) {
    this.id = id;
    this.updateCounts(counts);
  }

  updateCounts(counts) {
    counts.forEach((count) => {
      if (this.counts.has(count.id) && (this.counts.get(count.id).sameCount(count))) {
        return;
      }
      this.counts.set(count.id, count);
      this.updated = true;
    });
  }

  get graphics() {
    if (!this._graphics) {
      this._graphics = new PIXI.Graphics();
    }
    return this._graphics;
  }
}

proppify(HexDiamond)
  .addProp('id', '', 'string')
  .addProp('visible', true, 'boolean')
  .addProp('counts', () => new Map());

HexDiamond.indexOf = (x, y, div = DIAMOND_DIV) => {
  if (is.object(x)) {
    return HexDiamond.indexOf(x.x, x.y);
  }
  const x4 = _N(x).div(div).floor().value;
  const y4 = _N(y).div(div).floor().value;
  return new CubeCoord(x4, y4).toString();
};

export default HexDiamond;
