/**
 * A useful function for fuzzing (random input testing). The `fuzzer` function will be invoked
 * repeatedly until the given `runtime` is reached, but not before iterating for at least
 * `minIterations`.
 *
 * @param runtime The minimum runtime in milliseconds.
 * @param minIterations The minimum number of iterations.
 * @param fuzzer The fuzzer function.
 * @returns The number of iterations performed.
 */
export function fuzz(fuzzer: () => unknown, runtime: number, minIterations = 1) {
  const start = Date.now();
  let i = 0;
  do {
    fuzzer();
  } while (++i < minIterations || Date.now() < start + runtime);
  // eslint-disable-next-line no-console
  console.log(i, 'iterations performed');
  return i;
}
