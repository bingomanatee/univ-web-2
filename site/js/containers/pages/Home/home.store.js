import pixiStreamFactory from '../../../store/pixiStreamFactory';

export default ({ size }) => {
  const stream = pixiStreamFactory({ size });

  stream.on('')

  return stream;
};
