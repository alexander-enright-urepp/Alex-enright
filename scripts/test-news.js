#!/usr/bin/env node
/**
 * test-news.js - Quick test to verify the news fetcher works
 */

const { main } = require('./fetch-news.js');

console.log('Testing news fetcher...\n');
console.log('Environment check:');
console.log('  NEWSAPI_KEY:', process.env.NEWSAPI_KEY ? 'Set ✓' : 'Not set');
console.log('  GNEWS_KEY:', process.env.GNEWS_KEY ? 'Set ✓' : 'Not set');
console.log('  NYTIMES_KEY:', process.env.NYTIMES_KEY ? 'Set ✓' : 'Not set');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✓' : 'Not set');
console.log('  SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set ✓' : 'Not set');
console.log('');

main()
  .then(result => {
    console.log('\n✅ Test completed successfully!');
    console.log('Results:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
