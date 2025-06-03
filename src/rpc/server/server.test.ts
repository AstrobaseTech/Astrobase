import { describe, expect, test } from 'vitest';
import { createInstance } from '../../instance/instance.js';
import { createRequestMessage } from '../client/create-request-message.js';
import { processRequest } from './server.js';

describe('processRequest', () => {
  test('Successful procedure', () => {
    const instance = createInstance({ procedures: { successful: () => 'Success!' } });

    const request = createRequestMessage('successful', undefined);

    return expect(processRequest(instance, request)).resolves.toEqual({
      procedure: 'successful',
      ok: true,
      payload: 'Success!',
      jobID: request.jobID,
    });
  });

  describe('Unsuccessful procedure', () => {
    test('Error thrown', () => {
      const instance = createInstance({
        procedures: {
          unsuccessful: () => {
            throw new Error('Unsuccessful!');
          },
        },
      });

      const request = createRequestMessage('unsuccessful', undefined);

      return expect(processRequest(instance, request)).resolves.toEqual({
        procedure: 'unsuccessful',
        ok: false,
        error: 'Unsuccessful!',
        jobID: request.jobID,
      });
    });

    test('String thrown', () => {
      const instance = createInstance({
        procedures: {
          unsuccessful: () => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw 'Unsuccessful!';
          },
        },
      });

      const request = createRequestMessage('unsuccessful', undefined);

      return expect(processRequest(instance, request)).resolves.toEqual({
        procedure: 'unsuccessful',
        ok: false,
        error: 'Unsuccessful!',
        jobID: request.jobID,
      });
    });

    test('Other thrown', () => {
      const instance = createInstance({
        procedures: {
          unsuccessful: () => {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw {};
          },
        },
      });

      const request = createRequestMessage('unsuccessful', undefined);

      return expect(processRequest(instance, request)).resolves.toEqual({
        procedure: 'unsuccessful',
        ok: false,
        error: undefined,
        jobID: request.jobID,
      });
    });
  });

  test('Unknown procedure', () => {
    const instance = createInstance();

    const request = createRequestMessage('unknown', undefined);

    return expect(processRequest(instance, request)).resolves.toEqual({
      procedure: 'unknown',
      ok: false,
      error: "Not found: instance['procedures']['unknown']",
      jobID: request.jobID,
    });
  });
});
