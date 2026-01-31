import wordlist from '../../bip39/wordlist/en.js';
import { Common } from '../../common/common.js';
import { WithNodeCrypt } from '../../crypt/node.js';
import { inMemory } from '../../in-memory/in-memory-client.js';
import { createInstance, type InstanceConfig } from '../../instance/instance.js';
import { WithNodeKDF } from '../../kdf/node.js';
import { createKeyring, loadKeyring } from '../keyrings.js';

export const createInstanceWithRequiredConfig = (...configs: InstanceConfig[]) =>
  createInstance(
    Common,
    WithNodeCrypt,
    WithNodeKDF,
    { clients: [{ strategy: inMemory() }] },
    ...configs,
  );

export async function createInstanceWithLoadedKeyring(...configs: InstanceConfig[]) {
  const passphrase = '1234';
  const instance = createInstanceWithRequiredConfig(...configs);
  const { cid } = await createKeyring(instance, { wordlist, passphrase });
  await loadKeyring(instance, { wordlist, cid, passphrase });
  return instance;
}
