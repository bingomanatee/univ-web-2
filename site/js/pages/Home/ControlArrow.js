import { proppify } from '@wonderlandlabs/propper';
import { CubeCoord } from '@wonderlandlabs/hexagony';
import _ from 'lodash';
import _N from '@wonderlandlabs/n';
/* import * as PIXI from 'pixi.js';
*/
import is from 'is';
import { Cube } from 'grommet-icons';
import chroma from 'chroma-js';

const ACTIVE_COLOR = 'lime';
const OVER_COLOR = 'rgb(0, 102, 255)';
const INACTIVE_COLOR = 'rgb(0,25,51)';

class ControlArrow {
  constructor(name, angle = 0) {
    this.name = name;
    this.angle = angle;
  }

  get color() {
    if (this.active) return ACTIVE_COLOR;
    if (this.over) return OVER_COLOR;
    return INACTIVE_COLOR;
  }

  get opacity() {
    return (this.active || this.over) ? 1 : 0.8;
  }

  clone() {
    const copy = new ControlArrow(this.name, this.angle);
    copy.active = this.active;
    copy.over = this.over;
    return copy;
  }
}

proppify(ControlArrow)
  .addProp('name', '', 'string')
  .addProp('angle', 0, 'number')
  .addProp('active', false, 'boolean')
  .addProp('over', false, 'boolean');

export default ControlArrow;
