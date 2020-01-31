import { proppify } from '@wonderlandlabs/propper';
import { CubeCoord } from '@wonderlandlabs/hexagony';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';
import * as PIXI from 'pixi.js';
import is from 'is';
import { Cube } from 'grommet-icons';
import chroma from 'chroma-js';

import siteStore from '../../store/site.store';

class GalaxyCount {
  constructor({ x, y, g }, matrix, depth = 0) {
    this.hex = new CubeCoord(x, y);
    this.matrix = matrix;
    this.depth = depth;
    this.galaxies = g;
  }

  clone() {
    const clone = new GalaxyCount({ x: this.hex.x, y: this.hex.y, g: this.galaxies }, this.matrix, this.depth);
    return clone;
  }

  get id() {
    return GalaxyCount.idFor(this);
  }

  samePt(otherGC) {
    if (otherGC instanceof CubeCoord) {
      return otherGC.toString() === this.id;
    }
    if (otherGC instanceof GalaxyCount) {
      return otherGC.id === this.id;
    }
    if (is.string(otherGC)) {
      return this.id === otherGC;
    }
    return false;
  }

  sameCount(value) {
    if (value instanceof GalaxyCount) {
      return value.galaxies === this.galaxies;
    }
    if (is.integer(value)) {
      return this.galaxies === value;
    }
    return false;
  }

  get corners() {
    if (!this._corners) {
      this._corners = this.matrix.corners(this.hex);
    }
    return this._corners;
  }

  get first() {
    return this.corners[0];
  }

  drawHex(graphics) {
    const alpha = _N(this.galaxies).div(100).clamp(0, 1).value;
    graphics.beginFill(GalaxyCount.galaxyColor(this.galaxies), alpha);
    this.hexLine(graphics);
    graphics.endFill();
  }

  hexLine(graphics) {
    graphics.moveTo(this.first.x, this.first.y);
    this.corners.slice(1).forEach(({ x, y }) => graphics.lineTo(x, y));
  }

  addStars(graphics) {
    return _.range(0, Math.sqrt(2 * this.galaxies)).map((n) => this.addStar(graphics, n));
  }

  addStar(graphics, n) {
    const referencePoints = _(this.corners)
      .shuffle()
      .slice(0, 3)
      .value();

    const center = referencePoints.reduce((p, a) => {
      if (!p) {
        return a;
      }
      return p.clone().lerp(a, Math.random());
    }, null);

    const opacity = 0.5 / _.random(0.25, 1);
    const color = GalaxyCount.galaxyColor(n, 50, 0.8, 0.4);
    const radius = _.random(0.5, 1, true);
    if (siteStore.my.galaxySheet) {
      const sprite = siteStore.do.randomSprite();
      sprite.x = center.x;
      sprite.y = center.y;
      sprite.scale = { x: radius / 10, y: radius / 10 };
     // sprite.tint = color;
      sprite.alpha = opacity;
      return sprite;
    }

    graphics.beginFill(color, opacity)
      .drawCircle(center.x, center.y, radius)
      .endFill();

    return false;
  }

  draw(graphics) {
    graphics.cacheAsBitmap = false;
    this.drawn = this.galaxies;
    graphics.clear();
    this.drawHex(graphics);
    const out = this.addStars(graphics);
    graphics.cacheAsBitmap = true;
    return out;
  }
}

GalaxyCount.idFor = ({
  hex,
  depth = 0,
}) => {
  if (!(hex instanceof CubeCoord)) {
    return GalaxyCount.idFor({
      hex: new CubeCoord(hex.x, hex.y),
      depth,
    });
  }

  if (!depth) {
    return hex.toString();
  }
  return `${hex.toString()}:${depth}`;
};

GalaxyCount.galaxyColor = (n, hueVariation = 0, satVariation = 0, brightnessVariation = 0) => chroma.hsl(
  _N(n)
    .plus(hueVariation ? _.random(-hueVariation, hueVariation) : 0)
    .plus(140)
    .mod(360)
    .clamp(0, 360)
    .value,

  _N(0.5)
    .sub(satVariation ? _.random(-satVariation, satVariation) : 0)
    .clamp(0, 1)
    .value,

  _N(0.75)
    .plus(brightnessVariation ? _.random(-brightnessVariation, brightnessVariation) : 0)
    .value,
).num();

proppify(GalaxyCount)
  .addProp('hex', () => new CubeCoord(0, 0))
  .addProp('depth', 0, 'integer')
  .addProp('drawn', 0, 'integer')
  .addProp('matrix', null)
  .addProp('galaxies', 0, 'integer');

export default GalaxyCount;
