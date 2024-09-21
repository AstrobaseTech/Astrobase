/** @module Registry */

/** The type used for the key when registering and retrieving instances from a {@linkcode Registry}. */
export type RegistryKey = string | number | symbol;

/**
 * A third-party module that can be registered in a {@linkcode Registry}.
 *
 * @template K The type of the key.
 * @template T The type of the strategy implementation.
 */
export interface RegistryModule<K extends RegistryKey, T> {
  /** A key or array of keys that this module can automatically be registered with. */
  key?: K | Array<K>;

  /** The strategy implementation provided by the module. */
  strategy: T;
}

/**
 * Options that can be provided when registering a strategy to a {@linkcode Registry}.
 *
 * @template K The type of the key.
 */
export type RegisterOptions<K extends RegistryKey> = {
  /** When specified, overrides the key(s) that the strategy is registered with. */
  key?: K | Array<K>;

  /**
   * When set to true, if a strategy is already registered with the target key, that strategy will
   * be replaced with the one being registered.
   */
  force?: boolean;
} & (
  | {
      /** If true, the strategy is registered at the global level. */
      global?: false;

      /**
       * When registering at the instance level:
       *
       * - If set, will register for that instance.
       * - If left undefined, will register for the default instance.
       */
      instanceID?: string;
    }
  | {
      /** If true, the module is registered at the global level. */
      global: true;
    }
);

/**
 * Registry construction options.
 *
 * @template K The type used for keys.
 * @template T The type used for modules.
 * @template D Default keys that must be provided in `defaults`.
 */
export interface RegistryOptions<K extends RegistryKey, T, D extends K = K> {
  /**
   * A map of global default strategies for the registry. Applies across all instances where a
   * module is not registered to override the strategy for the key.
   */
  defaults?: Record<D, T>;

  /**
   * An optional validation function for module key(s).
   *
   * For instance, the following function will ensure the key is an integer.
   *
   *     (key) => Number.isInteger(key);
   *
   * @param key The key to validate.
   * @returns A boolean indicating whether or not the validation passed.
   */
  validateKey?(key: K): boolean;

  /**
   * An optional validation function for module strategy implementations.
   *
   * For instance, the following function will ensure the strategy is a function.
   *
   *     (strategy) => typeof strategy === 'function';
   *
   * @param strategy The strategy implementation to validate.
   * @returns A boolean indicating whether or not the validation passed.
   */
  validateStrategy?(strategy: T): boolean;
}

/**
 * Astrobase is designed to be modular and extensible, and, as such, many features use a strategy
 * pattern to be able to allow users to register or override functionality in a plugin-like way. The
 * `Registry` class is a common implementation of this pattern that can be shared across the
 * ecosystem to keep things consistent, but also to reduce code duplication.
 *
 * Features like the Codec and Middleware systems expose an instance of `Registry` to allow users to
 * register custom implementations.
 *
 * ## Order of Precendence
 *
 * The `Registry` class has three levels:
 *
 * 1. Default - "built in" strategies provided at construction time and available across all instances.
 * 2. Global - user provided strategies, available across all instances.
 * 3. Instance - user provided strategies, available only to a particular instance.
 *
 * Each level takes precedent over the last - so, for example, if a strategy has been provided for
 * the same key at both the global and instance levels, the instance level strategy is the one that
 * is retrieved by {@linkcode get} and {@linkcode getStrict}.
 *
 * ## Options
 *
 * When creating a `Registry`, a {@linkcode RegistryOptions} object may be provided that can provide
 * default strategies and/or validation functions for registration keys and strategies.
 *
 * TypeScript type parameters should be provided to restrict the key and module types. There is
 *
 * ## Example
 *
 * Using TypeScript and providing type parameters:
 *
 * ```ts
 * interface Encoder {
 *   encode(value): ArrayBuffer;
 *   decode(value): string;
 * }
 *
 * const EncoderRegistry = new Registry<string, Encoder>({
 *   validateKey: (k) => typeof k === 'string',
 *   validateStrategy: (s) => typeof s.encode === 'function' && typeof s.decode === 'function',
 * });
 * ```
 *
 * @template K The type for keys.
 * @template T The type for strategies.
 * @template D A narrowed type of the `K` type. Enforces that a strategy must be provided in the
 *   {@linkcode RegistryOptions} defaults for the specific set of keys.
 */
export class Registry<K extends RegistryKey, T, D extends K = K> {
  /** @ignore */
  private readonly global = new Map<K, T>();

  /** @ignore */
  private readonly instance: Partial<Record<string, Map<K, T>>> = {};

  /** @param options Registry construction options. */
  constructor(private readonly options?: RegistryOptions<K, T, D>) {}

  /**
   * Retrieves a strategy by its key. If no strategy is available for the key, `void` is returned.
   *
   * @param key The key of the strategy.
   * @param instanceID The target instance.
   * @returns The strategy or `void` if no strategy is available for the key.
   */
  get(key: K, instanceID = ''): T | undefined {
    return (
      this.instance[instanceID]?.get(key) ??
      this.global.get(key) ??
      (this.options?.defaults as Record<K, T>)?.[key]
    );
  }

  /**
   * Retrieves a strategy by its key. If no strategy is available for the key, an error is thrown.
   *
   * @param key The key of the strategy.
   * @param instanceID The target instance.
   * @returns The strategy.
   * @throws If no strategy is available for the key.
   */
  getStrict(key: K, instanceID?: string) {
    const value = this.get(key, instanceID);
    if (!value) {
      throw new ReferenceError(`Strategy not found: ${key.toString()}`);
    }
    return value;
  }

  /**
   * Registers a strategy for a key.
   *
   * @param module The strategy module to register.
   * @param options An optional {@linkcode RegisterOptions} object.
   */
  register(module: RegistryModule<K, T>, options?: RegisterOptions<K>) {
    if (
      module.strategy === undefined ||
      module.strategy === null ||
      (this.options?.validateStrategy && !this.options.validateStrategy(module.strategy))
    ) {
      throw new TypeError('Invalid strategy');
    }
    let key = options?.key ?? module.key;
    if (key === undefined || key === null) {
      throw new TypeError('No key provided');
    }
    key = key instanceof Array ? key : [key];
    const instance = options?.global
      ? this.global
      : (this.instance[options?.instanceID ?? ''] ??= new Map<K, T>());
    for (const k of key) {
      if (this.options?.validateKey && !this.options.validateKey(k)) {
        throw new TypeError('Invalid key');
      }
      if (!options?.force && instance.get(k)) {
        throw new Error('Key in use');
      }
    }
    for (const k of key) {
      instance.set(k, module.strategy);
    }
  }
}
