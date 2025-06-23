import wordlist from '../../bip39/wordlist/en.js';
import { Common } from '../../common/common.js';
import { inMemory } from '../../in-memory/in-memory-client.js';
import { createInstance, type InstanceConfig } from '../../instance/instance.js';
import { createKeyring, loadKeyring } from '../keyrings.js';

export async function createInstanceWithLoadedKeyring(...configs: InstanceConfig[]) {
  const passphrase = '1234';
  const instance = createInstance(Common, { clients: [{ strategy: inMemory() }] }, ...configs);
  const { cid } = await createKeyring(instance, { wordlist, passphrase });
  await loadKeyring(instance, { wordlist, cid, passphrase });
  return instance;
}
