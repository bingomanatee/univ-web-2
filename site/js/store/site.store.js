
import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import { B100 } from '@wonderlandlabs/universe';

const UNIV_SIZE = B100;
const LY_PER_HEX = 166666666.66666666666; // zoom zero pixel diameter per hex; c. 166 M, or 0.16 BIO;
const PX_PER_HEX = 50;
const LY_PER_PX = LY_PER_HEX / PX_PER_HEX; // c. 3 M

const SiteStore = new ValueStream('siteStore')
  .property('screenWidth', 0, 'number')
  .property('screenHeight', 0, 'number')
  .property('univData', new Map())
  .property('x', 0, 'number')
  .property('y', 0, 'number')
  .property('zoom', 0, 'integer')
  .property('lyX', 0, 'number')
  .property('lyXmin', 0, 'number')
  .property('lyXmax', 0, 'number')
  .property('lyY', 0, 'number')
  .property('lyYmin', 0, 'number')
  .property('lyYmax', 0, 'number');

export default SiteStore;
