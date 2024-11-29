import { join } from 'path';
import { applyConfig } from './apply.js';
import type { GlobalConfig } from './schema.js';

export const loadConfig = () =>
  import(join(process.cwd(), 'astrobase.config.js')).then((m: { default: GlobalConfig }) =>
    applyConfig(m.default),
  );
