import _ from 'lodash';

export default function hexLine(graphics, hex, matrix) {
  if (!graphics) {
    console.log('hexLine: no graphics');
    return;
  }
  if (!hex) {
    console.log('hexLine: no hex');
    return;
  }
  if (!matrix) {
    console.log('hexLine: no matrix');
    return;
  }
  const corners = matrix.corners(hex);
  const first = _.first(corners);
  graphics.moveTo(first.x, first.y);
  corners.slice(1).forEach(({ x, y }) => graphics.lineTo(x, y));
  graphics.lineTo(first.x, first.y);
}
