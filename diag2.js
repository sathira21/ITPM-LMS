const { execSync } = require('child_process');
try {
  execSync('node ultimate_rebuild.js', { stdio: 'inherit' });
} catch(e) {
  console.error("FAIL:", e.message);
}
