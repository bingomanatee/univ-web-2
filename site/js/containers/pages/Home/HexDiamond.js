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
      this.counts.set(count.id, count.clone());
      this.updated = true;
    });
  }

  draw() {
    this.counts.forEach((count) => {
      if (count.galaxies !== count.drawn) {
        count.draw(this.graphicsFor(count.id));
      }
    });
    this.updated = true;
  }

  graphicsFor(id) {
    if (this.container.getChildByName(id)) {
      return this.container.getChildByName(id);
    }
    const graphics = new PIXI.Graphics();
    graphics.name = id;
    this.container.addChild(graphics);
    return graphics;
  }
}

proppify(HexDiamond)
  .addProp('id', '', 'string')
  .addProp('visible', true, 'boolean')
  .addProp('container', () => new PIXI.Container())
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
