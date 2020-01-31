
import { ValueStream } from '@wonderlandlabs/looking-glass-engine';
import * as PIXI from 'pixi.js';
import _ from 'lodash';


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
  .property('galaxySheet', null)
  .method('randomSprite', (s) => {
    if (!s.my.galaxySheet) return null;
    const key = _.shuffle(Object.keys(s.my.galaxySheet.textures))[0];
    const image = s.my.galaxySheet.textures[key];

    const sprite = new PIXI.Sprite(image);
    sprite.blendMode = PIXI.BLEND_MODES.SCREEN;
    sprite.angle = _.random(0, 360);

    return sprite;
  })
  .property('lyYmax', 0, 'number');


function setup() {
  SiteStore.do.setGalaxySheet(PIXI.Loader.shared.resources['/img/galaxies.json'].spritesheet);
}

PIXI.Loader.shared.add('/img/galaxies.json').load(setup);
export default SiteStore;
