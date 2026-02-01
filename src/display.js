const chalk = require('chalk');
const boxen = require('boxen');
const { formatNumber, timeAgo, progressBar } = require('./utils');

function getGradeColor(grade) {
  if (grade.startsWith('A')) return 'green';
  if (grade.startsWith('B')) return 'cyan';
  if (grade.startsWith('C')) return 'yellow';
  return 'red';
}

function renderScoreBar(label, score, max) {
  const pct = score / max;
  let color = pct >= 0.8 ? 'green' : pct >= 0.6 ? 'yellow' : pct >= 0.4 ? 'cyan' : 'red';
  const bar = chalk[color](progressBar(score, max, 20));
  console.log(`   ${label.padEnd(12)} ${bar} ${chalk.white(score + '/' + max)}`);
}

function renderDashboard(data, healthScore) {
  const { repo, issues, pullRequests, contributors } = data;
  const color = getGradeColor(healthScore.grade);
  
  console.log(boxen(`${chalk[color].bold(healthScore.grade)}  ${chalk.white(healthScore.total + '/100')}`, 
    { padding: { left: 2, right: 2 }, borderColor: color, borderStyle: 'round', title: '🏥 Health Score', titleAlignment: 'center' }));

  console.log(chalk.bold('\nℹ️ Repository Info'));
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(`   ${chalk.cyan('Name:')}        ${repo.full_name}`);
  console.log(`   ${chalk.cyan('Description:')} ${repo.description || chalk.gray('None')}`);
  console.log(`   ${chalk.cyan('Language:')}    ${repo.language || chalk.gray('N/A')}`);
  console.log(`   ${chalk.cyan('Last Push:')}   ${timeAgo(repo.pushed_at)}`);

  console.log(chalk.bold('\n⭐ Engagement'));
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(`   ⭐ ${chalk.yellow(formatNumber(repo.stargazers_count))} stars    🍴 ${chalk.blue(formatNumber(repo.forks_count))} forks`);

  console.log(chalk.bold('\n⟦ Issues'));
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(`   ${chalk.green(issues.closed + ' closed')} / ${chalk.red(issues.open + ' open')}`);
  if (issues.staleCount > 0) console.log(`   ${chalk.yellow('⚠ Stale: ' + issues.staleCount)}`);

  console.log(chalk.bold('\n🔀 Pull Requests'));
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(`   ${chalk.green(pullRequests.merged + ' merged')} / ${chalk.yellow(pullRequests.open + ' open')}`);

  console.log(chalk.bold('\n③⑩ Contributors'));
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(`   ${contributors.total} total`);
  if (contributors.newContributors > 0) console.log(`   ${chalk.green('+' + contributors.newContributors + ' new (last 30 days)')}`);

  console.log(chalk.bold('\nⓉ Score Breakdown'));
  console.log(chalk.gray('────────────────────────────────────────'));
  renderScoreBar('Activity', healthScore.breakdown.activity, 25);
  renderScoreBar('Maintenance', healthScore.breakdown.maintenance, 25);
  renderScoreBar('Community', healthScore.breakdown.community, 25);
  renderScoreBar('Popularity', healthScore.breakdown.popularity, 25);
  console.log('');
}

function renderDetailedReport(data, healthScore) {
  renderDashboard(data, healthScore);
  console.log(chalk.bold('💡 Recommendations'));
  console.log(chalk.gray('────────────────────────────────────────'));
  const { breakdown, details } = healthScore;
  if (details.daysSincePush > 30) console.log(`   ${chalk.yellow('●')} Last commit was ${details.daysSincePush} days ago`);
  if (details.staleRatio > 30) console.log(`   ${chalk.yellow('●')} ${details.staleRatio}% of issues are stale`);
  if (breakdown.community < 15) console.log(`   ${chalk.cyan('▿')} Consider adding "good first issue" labels`);
  if (breakdown.activity >= 20 && breakdown.maintenance >= 20) console.log(`   ${chalk.green('✓ Great job!')} Repo is active and well-maintained`);
  console.log('');
}

module.exports = { renderDashboard, renderDetailedReport };