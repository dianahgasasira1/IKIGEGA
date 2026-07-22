"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.amountToKinyarwanda = amountToKinyarwanda;
const ONES = [
    '',
    'rimwe',
    'kabiri',
    'gatatu',
    'kane',
    'gatanu',
    'gatandatu',
    'karindwi',
    'umunani',
    'icyenda',
    'icumi',
    'cumi na rimwe',
    'cumi na kabiri',
    'cumi na gatatu',
    'cumi na kane',
    'cumi na gatanu',
    'cumi na gatandatu',
    'cumi na karindwi',
    'cumi n\'umunani',
    'cumi n\'icyenda',
];
const TENS = [
    '',
    '',
    'mirongo ibiri',
    'mirongo itatu',
    'mirongo ine',
    'mirongo itanu',
    'mirongo itandatu',
    'mirongo irindwi',
    'mirongo inani',
    'mirongo icyenda',
];
const COUNTERS_MASCULINE = [
    '',
    'rimwe',
    'abiri',
    'atatu',
    'ane',
    'atanu',
    'atandatu',
    'arindwi',
    'anani',
    'icyenda',
];
const COUNTERS_BI = [
    '',
    'kimwe',
    'bibiri',
    'bitatu',
    'bine',
    'bitanu',
    'bitandatu',
    'birindwi',
    'binani',
    'icyenda',
];
function sayUnder100(n) {
    if (n < 0 || n >= 100)
        throw new Error('sayUnder100 out of range');
    if (n === 0)
        return '';
    if (n < 20)
        return ONES[n];
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    const tensWord = TENS[tens];
    if (ones === 0)
        return tensWord;
    return `${tensWord} na ${ONES[ones]}`;
}
function sayUnder1000(n) {
    if (n < 0 || n >= 1000)
        throw new Error('sayUnder1000 out of range');
    if (n === 0)
        return '';
    if (n < 100)
        return sayUnder100(n);
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    let hundredsPhrase;
    if (hundreds === 1) {
        hundredsPhrase = 'ijana';
    }
    else {
        hundredsPhrase = `magana ${COUNTERS_MASCULINE[hundreds]}`;
    }
    if (remainder === 0)
        return hundredsPhrase;
    return `${hundredsPhrase} na ${sayUnder100(remainder)}`;
}
function amountToKinyarwanda(amount) {
    const rounded = Math.round(amount);
    if (rounded === 0)
        return 'amafaranga zeru';
    if (rounded < 0)
        return `hasabwa ${amountToKinyarwanda(Math.abs(rounded))}`;
    const millions = Math.floor(rounded / 1_000_000);
    const afterMillions = rounded % 1_000_000;
    const thousands = Math.floor(afterMillions / 1000);
    const remainder = afterMillions % 1000;
    const parts = ['amafaranga'];
    if (millions > 0) {
        if (millions === 1) {
            parts.push('miliyoni imwe');
        }
        else {
            parts.push(`miliyoni ${sayUnder1000(millions)}`);
        }
    }
    if (thousands > 0) {
        if (thousands === 1) {
            parts.push('igihumbi');
        }
        else if (thousands < 10) {
            parts.push(`ibihumbi ${COUNTERS_BI[thousands]}`);
        }
        else {
            parts.push(`ibihumbi ${sayUnder1000(thousands)}`);
        }
    }
    if (remainder > 0) {
        parts.push(sayUnder1000(remainder));
    }
    return parts.join(' na ').replace(/^amafaranga na /, 'amafaranga ');
}
//# sourceMappingURL=kinyarwanda-numbers.js.map