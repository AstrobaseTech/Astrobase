/**
 * @module Events
 * @experimental
 */

/**
 * A listener callback function that is invoked each time an event is emitted for a topic it has
 * been subscribed to.
 *
 * @category Types
 * @template T The emitted value's type.
 * @param value The emitted value.
 * @param instanceID The instance that the event occurred within.
 */
export type Listener<T> = (value: T, instanceID?: string) => void;

/**
 * Base type for the topics configuration. A map of topic name keys and the topic's emitted value
 * type.
 *
 * @category Types
 */
export type Topics = Record<string, unknown>;

type Listeners<T extends Topics = Topics> = {
  [K in keyof T]?: Set<Listener<K>>;
};

const listeners: Listeners = {};

/**
 * Emits an event. While this is a public API, This should generally only be called for custom
 * topics. See the module overview of Events for more on custom topics.
 *
 * @category Functions
 * @template T A map of topic names and their emitted value types.
 * @template K The topic name for this emitted event.
 * @param topic The topic name for this emitted event.
 * @param value The emitted value.
 * @param instanceID The instance that the event occurred within.
 */
export function emit<T extends Topics = Topics, K extends keyof T = keyof T>(
  topic: K,
  value: T[K],
  instanceID?: string,
) {
  (listeners as Listeners<T>)[topic]?.forEach((fn) => fn(value as never, instanceID));
}

/**
 * Subscribes a callback to an event topic.
 *
 * @category Functions
 * @template T A map of topic names and their emitted value types.
 * @template K The topic name to subscribe to.
 * @param topic The topic name to subscribe to.
 * @param listener A listener callback function that will be invoked each time an event is emitted.
 * @returns A function that directly unsubscribes the listener without needing to manually invoke
 *   {@link off}.
 */
export function on<T extends Topics = Topics, K extends keyof T = keyof T>(
  topic: K,
  listener: Listener<T[K]>,
) {
  ((listeners as Listeners<T>)[topic] ??= new Set()).add(listener as never);
  return () => off(topic, listener);
}

/**
 * Unsubscribes a callback from an event topic.
 *
 * Note: you can also unsubscribe using the function returned by {@link on}.
 *
 * @category Functions
 * @template T A map of topic names and their emitted value types.
 * @template K The topic name to unsubscribe from.
 * @param topic The topic name to unsubscribe from.
 * @param listener The listener callback to unsubscribe.
 */
export function off<T extends Topics = Topics, K extends keyof T = keyof T>(
  topic: K,
  listener: Listener<T[K]>,
) {
  listeners[topic]?.delete(listener as never);
}
