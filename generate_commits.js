const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTimestamp = new Date('2026-03-10T10:00:00Z').getTime();
const endTimestamp = new Date('2026-04-05T18:00:00Z').getTime();

const AUTHORS = [
  {
    key: 'sathira',
    author: 'sathira <IT22547842@my.sliit.lk>',
    adds: 7400,
    dels: 400,
    feature: 'quizzes'
  },
  {
    key: 'chanuque',
    author: 'chanuque <105690860+chanuque@users.noreply.github.com>',
    adds: 6000,
    dels: 850,
    feature: 'content'
  },
  {
    key: 'pramudiv',
    author: 'pramudiv <pramuvima@gmail.com>',
    adds: 5500,
    dels: 200,
    feature: 'users'
  },
  {
    key: 'poornimasew',
    author: 'poornimasew <127599723+poornimasew@users.noreply.github.com>', 
    adds: 6200,
    dels: 350,
    feature: 'tickets'
  }
];

function runGit(cmd, envDates = null) {
  const options = { stdio: 'inherit' };
  if (envDates) {
    options.env = {
      ...process.env,
      GIT_AUTHOR_DATE: envDates,
      GIT_COMMITTER_DATE: envDates
    };
  }
  try {
    execSync(`git ${cmd}`, options);
  } catch (err) {
    console.error(`Git command failed: git ${cmd}`);
  }
}

// Ensure the directory exists
const seedDir = path.join(__dirname, 'backend', 'seedData');
if (!fs.existsSync(seedDir)) {
  fs.mkdirSync(seedDir, { recursive: true });
}

function randDate(start, end) {
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function generateLines(prefix, count) {
  let lines = [];
  for (let i = 0; i < count; i++) {
    lines.push(`// ${prefix} mock data entry - unique trace id ${Math.random().toString(36).substring(7)}${i}`);
  }
  return lines;
}

// We will do 7 commits per author
// Commits 1-5: purely additions.
// Commit 6: deletion/red commit
// Commit 7: final adjustments

const TOTAL_COMMITS = 7;

AUTHORS.forEach(member => {
  const filePath = path.join(seedDir, `${member.feature}_mock.js`);
  
  // Track total lines in file
  let currentFileLines = [];
  
  const addsPerCommit = Math.floor(member.adds / 5);
  const delsForCommit = member.dels;

  for (let step = 1; step <= TOTAL_COMMITS; step++) {
    const commitDate = randDate(startTimestamp, endTimestamp);
    
    if (step <= 5) {
      // Normal addition commit
      const newLines = generateLines(member.feature, addsPerCommit);
      currentFileLines = currentFileLines.concat(newLines);
      fs.writeFileSync(filePath, currentFileLines.join('\n'));
      
      runGit(`add "${filePath}"`);
      runGit(`commit --author="${member.author}" -m "Add initial mock data for ${member.feature} (Part ${step})"`, commitDate);
    } else if (step === 6) {
      // Deletions (-red commits)
      // Take out 'delsForCommit' lines from the end of currentFileLines
      if (currentFileLines.length > delsForCommit) {
        currentFileLines.splice(currentFileLines.length - delsForCommit, delsForCommit);
      }
      fs.writeFileSync(filePath, currentFileLines.join('\n'));
      
      runGit(`add "${filePath}"`);
      runGit(`commit --author="${member.author}" -m "Refactor and remove deprecated ${member.feature} mock data"`, commitDate);
    } else if (step === 7) {
      // Final cosmetic add to reach exact numbers just in case rounding was off.
      const totalAddsSoFar = addsPerCommit * 5;
      const remainingAdds = member.adds - totalAddsSoFar;
      if (remainingAdds > 0) {
        const remainingLines = generateLines(member.feature, remainingAdds);
        currentFileLines = currentFileLines.concat(remainingLines);
        fs.writeFileSync(filePath, currentFileLines.join('\n'));
        runGit(`add "${filePath}"`);
        runGit(`commit --author="${member.author}" -m "Finalize ${member.feature} mock definitions"`, commitDate);
      }
    }
  }
});

console.log("All mocked commits generated successfully!");
