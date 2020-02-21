import mockConsole from 'jest-mock-console';
import _ from 'lodash';
import storeFactory from '../galaxySector.store';

describe('galaxySector.store', () => {
  describe('transitions', () => {
    test('load', () => {
      const galaxies = [];

      const onGalaxy = (g) => {
        galaxies.push(g);
      };
      const stream = storeFactory({onGalaxy});

      expect(stream.my.targetZoomState).toBe('closed');
      expect(stream.my.galaxy).toBeNull();
      expect(stream.my.zoomState).toBe('closed');
      expect(stream.my.zoomTransLevel).toBe(0);
    });

    test('on galaxy', async (done) => {
      const galaxies = [];

      const onGalaxy = (g) => {
        galaxies.push(g);
      };
      const stream = storeFactory({onGalaxy});
      const mockGalaxy = {x: 10, y: 10};

      stream.do.setGalaxy(mockGalaxy);

      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.galaxy).toBe(mockGalaxy);
      expect(stream.my.zoomState).toBe('closed');

      await new Promise((pDone) => {
        function check() {
          if (stream.my.zoomState === 'open') {
            pDone();
          } else {
            setTimeout(check, 100);
          }
        }

        check();
      });

      expect(stream.my.zoomTransLevel).toBe(1);

      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.galaxy).toBe(mockGalaxy);
      expect(stream.my.zoomState).toBe('open');
      done();
    });
    test('there and back', async (done) => {
      const galaxies = [];

      const onGalaxy = (g) => {
        galaxies.push(g);
      };
      const stream = storeFactory({onGalaxy});
      const mockGalaxy = {x: 10, y: 10};

      stream.do.setGalaxy(mockGalaxy);

      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.zoomState).toBe('closed');

      await new Promise((pDone) => {
        function check() {
          if (stream.my.zoomState === 'open') {
            pDone();
          } else {
            setTimeout(check, 100);
          }
        }

        check();
      });

      expect(stream.my.zoomTransLevel).toBe(1);
      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.galaxy).toBe(mockGalaxy);
      expect(stream.my.zoomState).toBe('open');

      stream.do.setGalaxy(null);

      await new Promise((pDone) => {
        function check() {
          if (stream.my.zoomState === 'closed') {
            pDone();
          } else {
            setTimeout(check, 100);
          }
        }

        check();
      });

      expect(stream.my.zoomTransLevel).toBe(0);
      expect(stream.my.targetZoomState).toBe('closed');
      expect(stream.my.galaxy).toBe(null);
      expect(stream.my.zoomState).toBe('closed');

      done();
    });
    test.only('two trips', async (done) => {
      const galaxies = [];
      const targetZoomStateChanges = [];

      const restore = mockConsole({
        error: (err) => {
          console.log(
            `============= console error
             ${err}
            ================= `,
          );
        },
      });

      const onGalaxy = (g) => {
        galaxies.push(g);
      };
      const stream = storeFactory({onGalaxy});

      const mockGalaxy = {x: 10, y: 10};
      const mockGalaxy2 = {x: 11, y: 11};

      console.log('------------------------ set to mockGalaxy ----------------------');

      stream.do.setGalaxy(mockGalaxy);

      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.zoomState).toBe('closed');

      await new Promise((pDone) => {
        let count = 0;

        function check() {
          if (count > 5) {
            pDone();
          } else if (stream.my.zoomState === 'open') {
            pDone();
          } else {
            ++count;
            setTimeout(check, 100);
          }
        }

        check();
      });

      console.log('------------------------ set to null ----------------------');

      stream.do.setGalaxy(null);

      await new Promise((pDone) => {
        function check() {
          if (stream.my.zoomState === 'closed') {
            pDone();
          } else {
            setTimeout(check, 100);
          }
        }

        check();
      });

      console.log('------------------------ finals set ----------------------');

      stream.do.setGalaxy(mockGalaxy2);

      await new Promise((pDone) => {
        function check() {
          if (stream.my.zoomState === 'open') {
            pDone();
          } else {
            setTimeout(check, 100);
          }
        }

        check();
      });

      expect(stream.my.zoomTransLevel).toBe(1);
      expect(stream.my.targetZoomState).toBe('open');
      expect(stream.my.galaxy).toBe(mockGalaxy2);
      expect(stream.my.zoomState).toBe('open');

      restore();

      done();
    });
  });
});
