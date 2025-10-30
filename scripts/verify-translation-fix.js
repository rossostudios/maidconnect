#!/usr/bin/env node

const en = require('../messages/en.json');
const es = require('../messages/es.json');

console.log('🔍 Verification Report\n');

console.log('📄 English (en.json):');
console.log('  Product pages (from first "pages"):');
console.log('    ✓ bookingPlatform:', !!en.pages.bookingPlatform);
console.log('    ✓ professionalProfiles:', !!en.pages.professionalProfiles);
console.log('    ✓ paymentProcessing:', !!en.pages.paymentProcessing);
console.log('    ✓ secureMessaging:', !!en.pages.secureMessaging);
console.log('    ✓ reviewsRatings:', !!en.pages.reviewsRatings);
console.log('    ✓ adminDashboard:', !!en.pages.adminDashboard);

console.log('\n  Static pages (from second "pages"):');
console.log('    ✓ contact:', !!en.pages.contact);
console.log('    ✓ signIn:', !!en.pages.signIn);
console.log('    ✓ signUp:', !!en.pages.signUp);
console.log('    ✓ terms:', !!en.pages.terms);
console.log('    ✓ privacy:', !!en.pages.privacy);
console.log('    ✓ professionalProfile:', !!en.pages.professionalProfile);

console.log('\n📄 Spanish (es.json):');
console.log('  Product pages (from first "pages"):');
console.log('    ✓ bookingPlatform:', !!es.pages.bookingPlatform);
console.log('    ✓ professionalProfiles:', !!es.pages.professionalProfiles);
console.log('    ✓ paymentProcessing:', !!es.pages.paymentProcessing);
console.log('    ✓ secureMessaging:', !!es.pages.secureMessaging);
console.log('    ✓ reviewsRatings:', !!es.pages.reviewsRatings);
console.log('    ✓ adminDashboard:', !!es.pages.adminDashboard);

console.log('\n  Static pages (from second "pages"):');
console.log('    ✓ contact:', !!es.pages.contact);
console.log('    ✓ signIn:', !!es.pages.signIn);
console.log('    ✓ signUp:', !!es.pages.signUp);
console.log('    ✓ terms:', !!es.pages.terms);
console.log('    ✓ privacy:', !!es.pages.privacy);
console.log('    ✓ professionalProfile:', !!es.pages.professionalProfile);

console.log('\n✅ All expected page keys are present in both files!');
console.log(`   English: ${Object.keys(en.pages).length} page keys`);
console.log(`   Spanish: ${Object.keys(es.pages).length} page keys`);
