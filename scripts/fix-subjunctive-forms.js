#!/usr/bin/env node

/**
 * Fix remaining subjunctive forms (tú → usted)
 * These were missed by the initial script
 */

const fs = require('fs');
const path = require('path');

const ES_JSON_PATH = path.join(__dirname, '../messages/es.json');

console.log('🔧 Fixing subjunctive forms...\n');

let content = fs.readFileSync(ES_JSON_PATH, 'utf8');
let changes = 0;

// Subjunctive mood transformations
const subjunctiveFixes = [
  // estés → esté
  { from: /\bestés\b/g, to: 'esté', desc: 'estés → esté (subjunctive estar)' },

  // puedas → pueda
  { from: /\bpuedas\b/g, to: 'pueda', desc: 'puedas → pueda (subjunctive poder)' },

  // tengas → tenga
  { from: /\btengas\b/g, to: 'tenga', desc: 'tengas → tenga (subjunctive tener)' },

  // necesites → necesite
  { from: /\bnecesites\b/g, to: 'necesite', desc: 'necesites → necesite (subjunctive necesitar)' },

  // construyas → construya
  { from: /\bconstruyas\b/g, to: 'construya', desc: 'construyas → construya (subjunctive construir)' },

  // seas → sea
  { from: /\bseas\b/g, to: 'sea', desc: 'seas → sea (subjunctive ser)' },

  // hagas → haga
  { from: /\bhagas\b/g, to: 'haga', desc: 'hagas → haga (subjunctive hacer)' },

  // sepas → sepa
  { from: /\bsepas\b/g, to: 'sepa', desc: 'sepas → sepa (subjunctive saber)' },

  // tendrás → tendrá (future tense)
  { from: /\btendrás\b/g, to: 'tendrá', desc: 'tendrás → tendrá (future tener)' },

  // ayudarte → ayudarle
  { from: /\bayudarte\b/g, to: 'ayudarle', desc: 'ayudarte → ayudarle (infinitive + pronoun)' },

  // reservarte → reservarle
  { from: /\breservarte\b/g, to: 'reservarle', desc: 'reservarte → reservarle (infinitive + pronoun)' },
];

for (const fix of subjunctiveFixes) {
  const before = content;
  content = content.replace(fix.from, fix.to);
  if (before !== content) {
    const count = (before.match(fix.from) || []).length;
    console.log(`✓ ${fix.desc} (${count} instances)`);
    changes += count;
  }
}

fs.writeFileSync(ES_JSON_PATH, content, 'utf8');

console.log(`\n✅ Fixed ${changes} subjunctive forms\n`);
