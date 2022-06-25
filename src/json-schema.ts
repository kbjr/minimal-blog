
import type { JSONSchema6Definition } from 'json-schema';
export type { JSONSchema6, JSONSchema6Definition } from 'json-schema';

export const arr = <T extends JSONSchema6Definition>(items?: T) => ({
	type: 'array' as const, items
});

export const str = <T extends string>(format?: T) => ({
	type: 'string' as const, format
});

export const int = () => ({
	type: 'integer' as const
});

export const bool = () => ({
	type: 'boolean' as const
});

export const str_enum = (values: string[]) => ({
	type: 'string' as const, enum: values
});

export const one_of = <T extends JSONSchema6Definition[]>(definitions: T) => ({
	oneOf: definitions
});

export const obj = <T extends { [k: string]: JSONSchema6Definition; }>(
	properties: T,
	additional: Partial<JSONSchema6Definition> = { }
) => Object.assign(additional, {
	type: 'object' as const,
	properties
});

export const dict = <T extends JSONSchema6Definition>(value: T) => ({
	type: 'object' as const,
	additionalProperties: value
});
