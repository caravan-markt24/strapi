import type {
  AdminNamespace,
  ApiNamespace,
  WithSeparator,
  PluginNamespace,
  StrapiNamespace,
  GetNamespaceSeparator,
  Namespace,
  Separator,
  GlobalNamespace,
} from './namespace';
import type { AddSuffix, Literal } from '../../utils';

type AddStringSuffix<T extends string> = AddSuffix<T, string>;

/**
 * Template for services' unique identifier
 */
export type BaseServiceUID = AddStringSuffix<
  WithSeparator<AdminNamespace> | WithSeparator<ApiNamespace> | WithSeparator<PluginNamespace>
>;

/**
 * Template for controllers' unique identifier
 */
export type BaseControllerUID = AddStringSuffix<
  WithSeparator<AdminNamespace> | WithSeparator<ApiNamespace> | WithSeparator<PluginNamespace>
>;

/**
 * Template for policies' unique identifier
 */
export type BasePolicyUID = AddStringSuffix<
  | WithSeparator<AdminNamespace>
  | WithSeparator<StrapiNamespace>
  | WithSeparator<GlobalNamespace>
  | WithSeparator<ApiNamespace>
  | WithSeparator<PluginNamespace>
>;

/**
 * Template for middlewares' unique identifier
 */
export type BaseMiddlewareUID = AddStringSuffix<
  | WithSeparator<AdminNamespace>
  | WithSeparator<StrapiNamespace>
  | WithSeparator<GlobalNamespace>
  | WithSeparator<ApiNamespace>
  | WithSeparator<PluginNamespace>
>;

/**
 * Template for content-types' unique identifier
 */
export type BaseContentTypeUID = AddStringSuffix<
  | WithSeparator<AdminNamespace>
  | WithSeparator<StrapiNamespace>
  | WithSeparator<ApiNamespace>
  | WithSeparator<PluginNamespace>
>;

/**
 * Template for components' unique identifier
 *
 * Warning: Can cause overlap with other UID formats.
 */
export type BaseComponentUID = `${string}.${string}`;

/**
 * Represents any UID
 */
export type UID =
  | BaseServiceUID
  | BaseControllerUID
  | BasePolicyUID
  | BaseMiddlewareUID
  | BaseContentTypeUID
  | BaseComponentUID;

/**
 * Type representation of every UID component.
 *
 * The separator type is automatically inferred from the given namespace
 */
export interface ParsedUID<N extends Namespace = Namespace, E extends string = string> {
  namespace: N;
  separator: GetNamespaceSeparator<N>;
  name: E;
  raw: `${N}${GetNamespaceSeparator<N>}${E}`;
}

/**
 * Parse an UID literal and returns a {@link ParsedUID} type.
 *
 * Warning: Using ParseUID with a union type might produce undesired results as it'll distribute every matching namespace parsing to every union members
 *
 * @example
 * type T = ParseUID<'admin::foo'>
 * // ^ { namespace: 'admin'; separator: '::'; name: 'foo'; }
 *
 * type T = ParseUID<'api::foo.bar'>
 * // ^ { namespace: 'api::foo'; separator: '.'; name: 'bar'; }
 *
 * type T = ParseUID<'admin::foo' | 'api::foo.bar'>
 * // ^ { namespace: 'admin' | 'api::foo' ; separator: '.' | '::'; name: 'foo' | 'bar' | 'foo.bar'; }
 */
export type ParseUID<U extends UID> = ResolveUIDNamespace<U> extends infer B extends Namespace
  ? GetNamespaceSeparator<B> extends infer S extends Separator
    ? U extends `${infer N extends B}${S}${infer E extends string}`
      ? ParsedUID<N, E>
      : never
    : never
  : never;

/**
 * Determines if the UID's namespace matches the given one.
 *
 * It returns N (the {@link Namespace} literal) if there is a match, never otherwise.
 *
 * @example
 * type T = AssertUIDNamespace<'admin::foo', AdminNamespace>
 * // ^ AdminNamespace
 * @example
 * type T = AssertUIDNamespace<'foo.bar', ApiNamespace>
 * // ^ never
 * @example
 * type T = AssertUIDNamespace<'api::foo.bar', PluginNamespace>
 * // ^ never
 */
export type AssertUIDNamespace<U extends UID, N extends Namespace> = U extends AddStringSuffix<
  WithSeparator<N>
>
  ? N
  : never;

/**
 * Extract the namespace literal from a given UID.
 *
 * @example
 * type T = ResolveUIDNamespace<'admin::foo'>
 * // ^ AdminNamespace
 * @example
 * type T = ResolveUIDNamespace<'api::foo.bar'>
 * // ^ ApiNamespace
 * @example
 * type T = ResolveUIDNamespace<'admin::foo' | 'api::foo.bar'>
 * // ^ AdminNamespace | ApiNamespace
 */
export type ResolveUIDNamespace<U extends UID> =
  | AssertUIDNamespace<U, AdminNamespace>
  | AssertUIDNamespace<U, StrapiNamespace>
  | AssertUIDNamespace<U, ApiNamespace>
  | AssertUIDNamespace<U, PluginNamespace>;
