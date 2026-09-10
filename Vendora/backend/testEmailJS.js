// EmailJS end-to-end + reliability burst test
require('dotenv').config({ path: './config/.env' });
const sendMail = require('./utils/sendMail.js');
const fs = require('fs');

(async () => {
  const recipient = 'b6c49a001@smtp-bridge.com';

  // 1) Warm-up: a single real EmailJS send
  console.log('=== SENDING 1 (warm-up via EmailJS) ===');
  const warm = await sendMail({
    email: recipient,
    subject: 'Vendora — EmailJS live test 🎉',
    html: '<h1>EmailJS is live</h1><p>This message was sent via the EmailJS HTTP API. If you see it, the integration is working end-to-end.</p>',
  });
  console.log('warm-up result:', warm);

  // 2) Burst 1: 10 concurrent sends
  console.log('=== SENDING 10 (concurrent) ===');
  const t10 = Date.now();
  const b10 = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      sendMail({
        email: recipient,
        subject: 'Vendora — burst 10',
        html: '<p>Burst message #' + i + '</p>',
      })
    )
  );
  const ms10 = Date.now() - t10;
  const e10 = b10.filter((x) => x && x.provider === 'emailjs').length;

  // 3) Burst 2: 30 concurrent sends
  console.log('=== SENDING 30 (concurrent) ===');
  const t30 = Date.now();
  const b30 = await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      sendMail({
        email: recipient,
        subject: 'Vendora — burst 30',
        html: '<p>Burst message #' + i + ' of 30</p>',
      })
    )
  );
  const ms30 = Date.now() - t30;
  const e30 = b30.filter((x) => x && x.provider === 'emailjs').length;

  const out =
    'RESULTS:\n' +
    'warm-up provider=' + warm.provider + '\n' +
    '10/10 via emailjs=' + e10 + '/10 (ms=' + ms10 + ')\n' +
    '30/30 via emailjs=' + e30 + '/30 (ms=' + ms30 + ')\n';

  console.log(out);
  fs.writeFileSync('emailjs_test_results.txt', out);
})().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
