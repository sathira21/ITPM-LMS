const { execSync } = require('child_process');
try {
  execSync('git add .', {stdio: 'inherit'});
  const numstat = execSync('git diff --cached --numstat').toString();
  console.log('NUMSTAT:', numstat);
} catch(e) {
  console.error('ERROR:', e.message);
}
