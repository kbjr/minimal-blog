
const enum char_class {
	lower,
	upper,
	number,
	special,
	other
}

export function calculate_password_complexity(password: string) {
	if (! password || password.length === 1) {
		return {
			score: -400,
			info: null,
			scores: null,
		};
	}

	let repeats        = 0;
	let max_repeat     = 1;
	let sequences      = 0;
	let max_sequence   = 1;
	let class_changes  = 0;
	let max_class_run  = 1;
	let count_per_type = new Uint32Array(5);

	let prev_char = password.charCodeAt(0);
	let prev_type = get_char_class(prev_char);
	count_per_type[prev_type]++;

	let class_len    = 1;
	let repeat_len   = 1;
	let sequence_len = 1;

	for (let i = 1; i < password.length; i++) {
		const char = password.charCodeAt(i);
		const type = get_char_class(char);

		if (type === prev_type) {
			max_class_run = Math.max(max_class_run, ++class_len);

			if (char === prev_char) {
				repeats++;
				max_repeat = Math.max(max_repeat, ++repeat_len);
				sequence_len = 1;
			}
	
			else if (char === prev_char + 1 || char === prev_char - 1) {
				sequences++;
				max_sequence = Math.max(max_sequence, ++sequence_len);
				repeat_len = 1;
			}
	
			else {
				repeat_len = 1;
				sequence_len = 1;
			}
		}

		else {
			class_changes++;
			class_len = 1;
			repeat_len = 1;
			sequence_len = 1;
		}

		prev_char = char;
		prev_type = type;
		count_per_type[type]++;
	}

	// Each score is on an initial scale of [-1 to 1], which will then be
	// all be weighted together for a final score
	const length_score_raw = calc_length_score(password.length);
	const length_score_weighted = weight_score(length_score_raw, 150, 150);

	const class_diversity_score_raw = calc_class_diversity_score(class_changes, max_class_run, count_per_type, password.length);
	const class_diversity_score_weighted = weight_score(class_diversity_score_raw, 150, 150);
	
	const repeats_sequences_score_raw = calc_repeats_sequences_score(repeats, max_repeat, sequences, max_sequence, password.length);
	const repeats_sequences_score_weighted = weight_score(repeats_sequences_score_raw, 100, 0);

	const weighted_score
		= length_score_weighted
		+ class_diversity_score_weighted
		+ repeats_sequences_score_weighted
		;

	return {
		info: {
			repeats,
			max_repeat,
			sequences,
			max_sequence,
			class_changes,
			max_class_run,
			count_per_type,
		},
		scores: {
			length: {
				raw: length_score_raw,
				weighted: length_score_weighted
			},
			class_diversity: {
				raw: class_diversity_score_raw,
				weighted: class_diversity_score_weighted
			},
			repeats_sequences: {
				raw: repeats_sequences_score_raw,
				weighted: repeats_sequences_score_weighted
			},
		},
		score: weighted_score
	};
}

function weight_score(raw_score: number, max_penalty: number, max_bonus: number) {
	if (! raw_score) {
		return 0;
	}

	if (raw_score < 0) {
		return raw_score * max_penalty;
	}

	return raw_score * max_bonus;
}

function calc_length_score(len: number) {
	const adjusted = len - 8;

	if (adjusted < 0) {
		return Math.max(-1, adjusted / 4);
	}

	return Math.min(1, adjusted / 24);
}

function calc_class_diversity_score(class_changes: number, max_class_run: number, count_per_type: Uint32Array, length: number) {
	let score = 0;
	let total_types_used = 0;
	let max_count_per_type = 0;

	for (const count of count_per_type) {
		if (count) {
			total_types_used++;
			max_count_per_type = Math.max(max_count_per_type, count);
		}
	}

	if (total_types_used === 1) {
		return -1;
	}

	// Award a bonus of [0.25 to 0.625], scaling linearly with the number
	// different character classes present
	score += total_types_used / 8;

	const mix_ratio = max_count_per_type / length;
	const even_mix_ratio = 1 / total_types_used;

	// If more than 80% of characters are of a single class, apply
	// a penalty of [-0.3 to -0.5], scaling linearly with the percentage
	// of characters in the class
	if (mix_ratio > 0.8) {
		score -= mix_ratio - 0.5;
	}

	// Otherwise, apply a bonus of (0 to 0.25], scaling linearly with the
	// percentage of characters in the most frequent class, until reaching
	// the limit of an evenly balanced character mix between the classes
	// present.
	// 
	// For example:
	// If our example password has 2 classes of characters, a completely
	// even mix of those two classes would be 50/50. So we would award
	// a "full" bonus of 0.5 if the largest class is half of the total
	// characters:
	// 
	//     password           = "abcd1234"
	//     total_types_used   = 2    // two different characters classes, lower and number
	//     max_count_per_type = 4    // "abcd" and "1234" both are 4 characters
	//     mix_ratio          = 0.5  // (4 / 8)
	//     even_mix_ratio     = 0.5  // (1 / 2)
	//     score             += 0.5  // (0.5 / 0.5) / 2
	// 
	// As a larger percentage of characters become of the same class, the amount of bonus awarded
	// reduces:
	// 
	//     password           = "abcde123"
	//     total_types_used   = 2      // two different characters classes, lower and number
	//     max_count_per_type = 5      // "abcde" is 5 characters of the same type
	//     mix_ratio          = 0.625  // (5 / 8)
	//     even_mix_ratio     = 0.5    // (1 / 2)
	//     score             += 0.4    // (0.5 / 0.625) / 2
	// 
	else {
		score += (even_mix_ratio / mix_ratio) / 2 - 0.25;
	}

	// Apply a bonus of [0 to 0.5], scaling based on the number of "class changes" that
	// occur. For example, in the password "abc123", there would be 1 class change, when it
	// transitions from the lowercase letter "c" to the number "1". The password "a1b2c3"
	// has 5 class changes, as every character is followed by a character of a different class.
	// The minimum number of class changes that can occur in any password is one less than
	// total number of classes present; This would receive a bonus of +0. Each additional
	// class change above that minimum adds +0.1 bonus, to a cap of +0.5.
	if (class_changes > total_types_used) {
		score += Math.min(0.5, (class_changes - total_types_used) * 0.1);
	}

	// If any one run of a single character class is longer than a quarter of the total length,
	// apply a penalty of -0.1
	if (max_class_run / length > 0.25) {
		score -= 0.1;
	}

	// If no character class run is longer than 10%, apply a bonus of +0.2
	else if (max_class_run / length < 0.1) {
		score += 0.2;
	}

	return Math.min(1, score);
}

function calc_repeats_sequences_score(repeats: number, max_repeat: number, sequences: number, max_sequence: number, length: number) {
	let score = 0;

	// Apply an unbounded penalty of -0.05 per repeat or sequence
	score -= (repeats + sequences) * 0.05;

	const repeat_theshold = 2;
	const sequence_theshold = length > 16 ? 2 : 1;
	
	// Apply an unbounded penalty of -0.25 per repeated character past the
	// threshold in the largest repeat chain
	if (max_repeat > repeat_theshold) {
		score -= (max_repeat - repeat_theshold) * 0.25;
	}
	
	// Apply an unbounded penalty of -0.25 per character in sequence in the
	// largest sequence chain passed the threshold
	if (max_sequence > sequence_theshold) {
		score -= (max_sequence - sequence_theshold) * 0.25;
	}

	return Math.max(-1, score);
}

function get_char_class(char: number) : char_class {
	// Extra level of if statement just to bisect the list of if statements
	// to be tiny bit more efficient
	if (char <= 64) {
		// ASCII Control Characters
		if (char < 32) {
			return char_class.other;
		}

		// Special Characters: <space> ! " # $ % & ' ( ) * + , - . /
		if (char <= 47) {
			return char_class.special;
		}

		// Numbers
		if (char <= 57) {
			return char_class.number;
		}

		// Special Characters: : ; < = > ? @
		return char_class.special;
	}

	// Uppercase Letters
	if (char <= 90) {
		return char_class.upper;
	}

	// Special Characters: [ \ ] ^ _ `
	if (char <= 96) {
		return char_class.special;
	}

	// Lowercase Letters
	if (char <= 122) {
		return char_class.lower;
	}

	// Special Characters: { | } ~
	if (char <= 126) {
		return char_class.special;
	}

	// Other unicode characters...
	return char_class.other;
}
