
import { ValueStream } from '@wonderlandlabs/looking-glass-engine';

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
