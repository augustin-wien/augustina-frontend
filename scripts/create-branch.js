// eslint-disable-next-line no-undef
const { execSync } = require('child_process');
// eslint-disable-next-line no-undef
const pkg = require('../package.json');

const branchName = `update-version-v${pkg.version}`;

execSync(`git checkout -b ${branchName}`);
execSync('git add package.json yarn.lock');
execSync(`git commit -m "Update version to ${pkg.version}"`);
execSync(`git push origin ${branchName}`);
execSync(`gh pr create --title "Update version to ${pkg.version}" --body "This PR updates the version to ${pkg.version}.\n\n"`);
