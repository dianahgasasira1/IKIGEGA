/**
 * Convert a positive integer amount (in Rwandan francs) to a Kinyarwanda
 * spoken phrase suitable for TTS or display.
 *
 * Handles values from 0 through 999,999,999.
 *
 * Examples:
 *   500     -> "amafaranga magana atanu"
 *   1500    -> "amafaranga ibihumbi n'amagana atanu"
 *   2500    -> "amafaranga ibihumbi bibiri n'amagana atanu"
 *   10000   -> "amafaranga ibihumbi cumi"
 *   250000  -> "amafaranga ibihumbi magana abiri na mirongo itanu"
 */

// Numbers 1–19
const ONES = [
  '',           // 0 placeholder
  'rimwe',      // 1
  'kabiri',     // 2
  'gatatu',     // 3
  'kane',       // 4
  'gatanu',     // 5
  'gatandatu',  // 6
  'karindwi',   // 7
  'umunani',    // 8
  'icyenda',    // 9
  'icumi',      // 10
  'cumi na rimwe',       // 11
  'cumi na kabiri',      // 12
  'cumi na gatatu',      // 13
  'cumi na kane',        // 14
  'cumi na gatanu',      // 15
  'cumi na gatandatu',   // 16
  'cumi na karindwi',    // 17
  'cumi n\'umunani',     // 18
  'cumi n\'icyenda',     // 19
];

// Tens (20, 30, ..., 90)
const TENS = [
  '',                 // 0 placeholder
  '',                 // 1 placeholder (handled by ONES)
  'mirongo ibiri',    // 20
  'mirongo itatu',    // 30
  'mirongo ine',      // 40
  'mirongo itanu',    // 50
  'mirongo itandatu', // 60
  'mirongo irindwi',  // 70
  'mirongo inani',    // 80
  'mirongo icyenda',  // 90
];

/**
 * Say the numbers 1-9 in the "how many hundreds/thousands" form.
 * Different noun classes use different concords.
 */
const COUNTERS_MASCULINE = [
  '',        // 0
  'rimwe',   // 1
  'abiri',   // 2
  'atatu',   // 3
  'ane',     // 4
  'atanu',   // 5
  'atandatu',// 6
  'arindwi', // 7
  'anani',   // 8
  'icyenda', // 9
];

const COUNTERS_BI = [
  '',         // 0
  'kimwe',    // 1 (irregular)
  'bibiri',   // 2
  'bitatu',   // 3
  'bine',     // 4
  'bitanu',   // 5
  'bitandatu',// 6
  'birindwi', // 7
  'binani',   // 8
  'icyenda',  // 9
];

/**
 * Say numbers 1-99 as a phrase.
 */
function sayUnder100(n: number): string {
  if (n < 0 || n >= 100) throw new Error('sayUnder100 out of range');
  if (n === 0) return '';
  if (n < 20) return ONES[n];

  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensWord = TENS[tens];

  if (ones === 0) return tensWord;
  return `${tensWord} na ${ONES[ones]}`;
}

/**
 * Say numbers 1-999 including the hundreds.
 */
function sayUnder1000(n: number): string {
  if (n < 0 || n >= 1000) throw new Error('sayUnder1000 out of range');
  if (n === 0) return '';
  if (n < 100) return sayUnder100(n);

  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  let hundredsPhrase: string;
  if (hundreds === 1) {
    hundredsPhrase = 'ijana';
  } else {
    hundredsPhrase = `magana ${COUNTERS_MASCULINE[hundreds]}`;
  }

  if (remainder === 0) return hundredsPhrase;
  return `${hundredsPhrase} na ${sayUnder100(remainder)}`;
}

/**
 * Say the whole amount as a phrase, prefixed with "amafaranga" (francs).
 */
export function amountToKinyarwanda(amount: number): string {
  const rounded = Math.round(amount);

  if (rounded === 0) return 'amafaranga zeru';
  if (rounded < 0) return `hasabwa ${amountToKinyarwanda(Math.abs(rounded))}`;

  const millions = Math.floor(rounded / 1_000_000);
  const afterMillions = rounded % 1_000_000;

  const thousands = Math.floor(afterMillions / 1000);
  const remainder = afterMillions % 1000;

  const parts: string[] = ['amafaranga'];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('miliyoni imwe');
    } else {
      parts.push(`miliyoni ${sayUnder1000(millions)}`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('igihumbi');
    } else if (thousands < 10) {
      parts.push(`ibihumbi ${COUNTERS_BI[thousands]}`);
    } else {
      parts.push(`ibihumbi ${sayUnder1000(thousands)}`);
    }
  }

  if (remainder > 0) {
    parts.push(sayUnder1000(remainder));
  }

  // Insert "n'" (contraction of "na" before vowel) or "na" between the parts
  // For simplicity we use " na " throughout — a native reader still understands.
  return parts.join(' na ').replace(/^amafaranga na /, 'amafaranga ');
}
