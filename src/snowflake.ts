
import { randomInt } from 'crypto';

/**
 * Epoch time for Snowflakes, `1 Jan 2020 00:00:00`
 */
const epoch = 1577836800000 as const;
// const epoch = new Date('2020-01-01T00:00:00.000Z').getTime();

// const instance = 0n << 12n;

/**
 * Generates a unique 64-bit integer ID.
 * 
 * Format based on Snowflake IDs (https://en.wikipedia.org/wiki/Snowflake_ID),
 * with the following modifications / details:
 * 
 * - Uses an epoch time of Jan 1 2020 00:00:00
 * - Uses a 45-bit timestamp rather than 41-bit, shortening the "instance" (since this project
 *   is never expected to operate at large scale) to 6-bits (which for now is always 0).
 */
export function unique_id() {
	const sequence = next_sequence();
	const timestamp = BigInt(Date.now() - epoch) & timestamp_mask;
	return BigInt.asUintN(64, (timestamp << 18n) /* | instance */ | sequence);
}

const iterator_mask = 0xfff;
const timestamp_mask = 0x1fffffffffffn;

let iterator = randomInt(0xfff);

function next_sequence() {
	const value = iterator++;
	iterator &= iterator_mask;
	return BigInt(value);
}
