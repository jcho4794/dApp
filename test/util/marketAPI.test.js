import { expect } from 'chai';
import sinon from 'sinon';

import { marketAPI } from '../../src/util/marketAPI';

describe('marketAPI', () => {
  let spyFetch;
  let requestOptions;
  beforeEach(() => {
    spyFetch = sinon.stub();
    requestOptions = { fetch: spyFetch, toJson: false };
  });

  describe('get', () => {
    it('should call fetch and return correct result', () => {
      const expectedResult = '{}';
      spyFetch.resolves(expectedResult);

      return marketAPI.get('/', requestOptions).then(response => {
        expect(response).to.equal(expectedResult);
      });
    });

    it('should convert result to json object', () => {
      const expectedResult = {};
      spyFetch.resolves({ json: () => expectedResult });

      return marketAPI
        .get('/', { ...requestOptions, toJson: true })
        .then(response => {
          expect(response).to.equal(expectedResult);
        });
    });

    it('should call fetch with url with query parameters', () => {
      const query = { param: '1' };
      spyFetch.resolves('{}');

      return marketAPI
        .get('/', { ...requestOptions, query })
        .then(_response => {
          expect(spyFetch.args[0][0]).contains('?param=1');
        });
    });
  });
});
