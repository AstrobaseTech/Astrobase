import type { Channel } from '../../src/channels/channel.interface.js';

function throwError() {
  throw new Error();
}

export const fakeErrorDriver: Required<Channel> = {
  delete: throwError,
  get: throwError,
  put: throwError,
};

function returnVoid() {}
export const fakeVoidDriver: Required<Channel> = {
  delete: returnVoid,
  get: returnVoid,
  put: returnVoid,
};

export const fakeValidDriver: Required<Channel> = {
  delete: returnVoid,
  get: () => new ArrayBuffer(0),
  put: returnVoid,
};

function returnDelayed<T>(this: T) {
  return new Promise<T>((resolve) => {
    setTimeout(() => {
      resolve(this);
    }, 5000);
  });
}

export const fakeDelayedDriver: Required<Channel> = {
  delete: returnDelayed,
  get: returnDelayed.bind(new ArrayBuffer(0)),
  put: returnDelayed,
};
