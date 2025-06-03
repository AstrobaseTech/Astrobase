import { describe, expect, test } from 'vitest';
import { createInstance } from '../../instance/instance.js';
import { buildQueue, callProcedureAll, filterByProcedure } from './client-set.js';

test('filterByProcedure', () => {
  const clientSet = ['proc-1', 'proc-2', '*'].map((procedure) => ({
    strategy: {
      [procedure]: () => procedure,
    },
  }));

  const [proc1Client, proc2Client, fallbackClient] = clientSet;

  expect(filterByProcedure(clientSet, 'proc-1')).toStrictEqual([proc1Client, fallbackClient]);
  expect(filterByProcedure(clientSet, 'proc-2')).toStrictEqual([proc2Client, fallbackClient]);
  expect(filterByProcedure(clientSet, 'proc-3')).toStrictEqual([fallbackClient]);
});

describe('buildQueue', () => {
  test('Long variety client set', () => {
    const clientSet = [undefined, 1, 2, 1, 3, undefined, 2].map((priority) => ({
      priority,
      strategy: {
        [`${priority}`]: () => priority,
      },
    }));

    const [undA, oneA, twoA, oneB, threeA, undB, twoB] = clientSet.map(({ strategy }) => strategy);

    expect(buildQueue(clientSet)).toStrictEqual([
      [oneA, oneB],
      [twoA, twoB],
      [threeA],
      [undA],
      [undB],
    ]);
  });

  test('Single undefined priority', () => {
    const clientSet = [{ priority: undefined, strategy: { undefined: () => undefined } }];

    const [{ strategy }] = clientSet;

    expect(buildQueue(clientSet)).toStrictEqual([[strategy]]);
  });

  test("Single '1' priority", () => {
    const clientSet = [{ priority: 1, strategy: { '1': () => 1 } }];

    const [{ strategy }] = clientSet;

    expect(buildQueue(clientSet)).toStrictEqual([[strategy]]);
  });
});

test('callProcedureAll', () => {
  const instance = createInstance({
    clients: ['proc-1', 'proc-2', '*'].map((procedure) => ({
      strategy: {
        [procedure]: () => procedure,
      },
    })),
  });

  expect(callProcedureAll(instance, 'proc-1', undefined)).toHaveLength(2);
  expect(callProcedureAll(instance, 'proc-2', undefined)).toHaveLength(2);
  expect(callProcedureAll(instance, 'proc-3', undefined)).toHaveLength(1);
});
