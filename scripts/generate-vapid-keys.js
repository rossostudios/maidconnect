// Script to generate VAPID keys for push notifications
const webPush = require('web-push');

console.log('Generating VAPID keys for push notifications...\n');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log(`VAPID_SUBJECT="mailto:support@maidconnect.com"`);
console.log('\nIMPORTANT: Keep the private key secret! Never commit it to git.');
