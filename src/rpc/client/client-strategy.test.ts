import { expect, test, vi } from 'vitest';
import { callProcedure, supportsProcedure } from './client-strategy.js';
import { createInstance } from '../../instance/instance.js';

test('callProcedure', async () => {
  const strategyWithFallback = {
    'proc-1': vi.fn(() => 'proc-1'),
    '*': vi.fn(() => '*'),
  };

  const strategyWithoutFallback = {
    'proc-2': vi.fn(() => 'proc-2'),
  };

  const instance = createInstance();

  await expect(callProcedure(instance, strategyWithFallback, 'proc-1', undefined)).resolves.toBe(
    'proc-1',
  );

  await expect(callProcedure(instance, strategyWithFallback, 'proc-2', undefined)).resolves.toBe(
    '*',
  );

  await expect(() =>
    callProcedure(instance, strategyWithoutFallback, 'proc-1', undefined),
  ).rejects.toThrowError(Error(`Strategy does not support procedure 'proc-1'`));

  expect(strategyWithFallback['proc-1']).toHaveBeenCalledTimes(1);
  expect(strategyWithFallback['*']).toHaveBeenCalledTimes(1);
  expect(strategyWithoutFallback['proc-2']).not.toHaveBeenCalled();
});

test('supportsProcedure', () => {
  expect(supportsProcedure({ 'proc-1': () => undefined }, 'proc-1')).toBe(true);
  expect(supportsProcedure({ 'proc-2': () => undefined }, 'proc-1')).toBe(false);
  expect(supportsProcedure({ '*': () => undefined }, 'proc-1')).toBe(true);
});
