import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const URL = process.env.LIGHTHOUSE_URL || 'http://localhost:3000';
const THRESHOLD = 90;

async function run() {
  const chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });

  try {
    const result = await lighthouse(URL, {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['accessibility'],
    });

    if (!result || !result.lhr || !result.lhr.categories?.accessibility) {
      console.error('Lighthouse did not return a valid accessibility report');
      process.exit(1);
    }

    const score = Math.round(result.lhr.categories.accessibility.score * 100);
    console.log(`Lighthouse accessibility score: ${score}`);

    if (result.lhr.categories.accessibility.auditRefs) {
      const failed = result.lhr.categories.accessibility.auditRefs
        .filter(ref => {
          const audit = result.lhr.audits[ref.id];
          return audit && audit.score !== null && audit.score < 1;
        })
        .map(ref => {
          const audit = result.lhr.audits[ref.id];
          return `  - ${audit.title}: ${audit.displayValue || 'failed'}`;
        });

      if (failed.length > 0) {
        console.log('\nFailed audits:');
        console.log(failed.join('\n'));
      }
    }

    if (score < THRESHOLD) {
      console.error(`\nFAIL: Score ${score} is below threshold ${THRESHOLD}`);
      process.exit(1);
    }

    console.log(`\nPASS: Score ${score} meets threshold ${THRESHOLD}`);
  } finally {
    await chrome.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
