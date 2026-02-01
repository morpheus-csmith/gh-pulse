#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { fetchRepoData, fetchIssues, fetchPullRequests, fetchContributors } = require('./api');
const { calculateHealthScore } = require('./utils');
const { renderDashboard, renderDetailedReport } = require('./display');

program
  .name('gh-pulse')
  .description('Get a quick health check of any GitHub repository')
  .version('1.0.0')
  .argument('<repo>', 'Repository in format owner/repo')
  .option('-d, --detailed', 'Show detailed report')
  .option('-j, --json', 'Output as JSON')
  .option('--demo', 'Use demo data')
  .action(async (repo, options) => {
    if (!repo.includes('/')) {
      console.error(chalk.red('Invalid format. Use: owner/repo'));
      process.exit(1);
    }
    const [owner, repoName] = repo.split('/');
    console.log(chalk.cyan('\\n  ╔═╗╦ ╦   ╔═╗╦ ╦╬  ╔═╗╔═╗\\n  ║ ╦╠╣───╠═╝║ ║║  ╚═╗║╣ \\n  ╚═╝╩ ╩   ╩  ╚═╝╩═╝╚═╝╚═╝\\n'));
    console.log(chalk.gray(`  Analyzing ${repo}...\\n`));
    const spinner = options.json ? null : ora('Fetching data...').start();
    try {
      let data;
      if (options.demo) {
        data = getDemoData(owner, repoName);
        await new Promise(r => setTimeout(r, 500));
      } else {
        const repoData = await fetchRepoData(owner, repoName);
        const issues = await fetchIssues(owner, repoName);
        const pullRequests = await fetchPullRequests(owner, repoName);
        const contributors = await fetchContributors(owner, repoName);
        data = { repo: repoData, issues, pullRequests, contributors };
      }
      if (spinner) spinner.succeed('Done!');
      const healthScore = calculateHealthScore(data);
      if (options.json) {
        console.log(JSON.stringify({ ...data, healthScore }, null, 2));
      } else if (options.detailed) {
        renderDetailedReport(data, healthScore);
      } else {
        renderDashboard(data, healthScore);
      }
    } catch (err) {
      if (spinner) spinner.fail('Failed');
      console.error(chalk.red(err.message));
      process.exit(1);
    }
  });

function getDemoData(o, r) {
  return {
    repo: { name: r, full_name: o+'/'+r ,description: 'Demo repository',
      stargazers_count: 42847, forks_count: 8234, watchers_count: 1523,
      language: 'JavaScript', pushed_at: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
      license: { name: 'MIT' } },
    issues: { total: 847, open: 234, closed: 613, avgResponseTime: 18, staleCount: 45, recentActivity: 12,
      labels: { bug: 89, enhancement: 156 } },
    pullRequests: { total: 1523, open: 67, merged: 1398, closed: 58, avgMergeTime: 36, recentActivity: 8 },
    contributors: { total: 342, newContributors: 23,
      topContributors: [{ login: 'dev1', contributions: 1247 }, { login: 'dev2', contributions: 834 }] }
  };
}

program.parse();