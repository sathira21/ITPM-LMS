const { execSync } = require('child_process');
const fs = require('fs');

fs.writeFileSync('.gitignore', "node_modules\\npackage-lock.json\\nbuild\\ndist\\n.env");
try { execSync('git add .gitignore'); } catch(e){}
try { execSync('git add .'); } catch(e){}
try { execSync('git reset HEAD package-lock.json backend/package-lock.json frontend/package-lock.json'); } catch(e){}
try { execSync('git commit -m "measure"'); } catch(e){}

const log = execSync('git log -1 --stat').toString();
console.log(log);
const numstat = execSync('git log -1 --numstat').toString();
console.log("NUMSTAT:");
console.log(numstat);
