import type { InstanceConfig } from '../instance/instance.js';
import type { CryptModule } from './types.js';

export const assembleCryptoInstanceConfig = (module: CryptModule, encryptAlgs: readonly string[]) =>
  ({
    cryptAlgs: Object.fromEntries(encryptAlgs.map((alg) => [alg, module])),
  }) satisfies InstanceConfig;
