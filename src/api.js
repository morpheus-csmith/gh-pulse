const fetch = require('node-fetch');
const BASE_URL = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function githubFetch(endpoint) {
  const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'gh-pulse' };
  if (TOKEN) headers['Authorization'] = `token ${TOKEN}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
  if (res.status === 404) throw new Error('404: Repository not found');
  if (res.status === 403 && res.headers.get('X-RateLimit-Remaining') === '0') throw new Error('rate limit exceeded');
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

async function fetchRepoData(owner, repo) {
  return githubFetch(`/repos/${owner}/${repo}`);
}

async function fetchIssues(owner, repo) {
  const open = await githubFetch(`/repos/${owner}/${repo}/issues?state=open&per_page=100`);
  const closed = await githubFetch(`/repos/${owner}/${repo}/issues?state=closed&per_page=100`);
  const openIssues = open.filter(i => !i.pull_request);
  const closedIssues = closed.filter(i => !i.pull_request);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stale = openIssues.filter(i => new Date(i.updated_at) < thirtyDaysAgo);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = [...openIssues, ...closedIssues].filter(i => new Date(i.updated_at) > sevenDaysAgo);
  const labels = {};
  openIssues.forEach(issue => issue.labels.forEach(l => labels[l.name] = (labels[l.name] || 0) + 1));
  let avgResponseTime = null;
  const withComments = closedIssues.filter(i => i.comments > 0).slice(0, 20);
  if (withComments.length) {
    const total = withComments.reduce((acc, i) => acc + (new Date(i.updated_at) - new Date(i.created_at)) / 3600000, 0);
    avgResponseTime = Math.round(total / withComments.length);
  }
  return { total: openIssues.length + closedIssues.length, open: openIssues.length, closed: closedIssues.length,
    avgResponseTime, staleCount: stale.length, recentActivity: recent.length, labels };
}

async function fetchPullRequests(owner, repo) {
  const open = await githubFetch(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);
  const closed = await githubFetch(`/repos/${owner}/${repo}/pulls?state=closed&per_page=100`);
  const merged = closed.filter(pr => pr.merged_at);
  const justClosed = closed.filter(pr => !pr.merged_at);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = [...open, ...closed].filter(pr => new Date(pr.updated_at) > sevenDaysAgo);
  let avgMergeTime = null;
  if (merged.length) {
    const total = merged.slice(0, 20).reduce((acc, pr) => acc + (new Date(pr.merged_at) - new Date(pr.created_at)) / 3600000, 0);
    avgMergeTime = Math.round(total / Math.min(merged.length, 20));
  }
  return { total: open.length + closed.length, open: open.length, merged: merged.length, closed: justClosed.length,
    avgMergeTime, recentActivity: recent.length };
}

async function fetchContributors(owner, repo) {
  const contribs = await githubFetch(`/repos/${owner}/${repo}/contributors?per_page=100`);
  const top = contribs.slice(0, 5).map(c => ({ login: c.login, contributions: c.contributions }));
  const commits = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=100`);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAuthors = new Set(commits.filter(c => new Date(c.commit.author.date) > thirtyDaysAgo).map(c => c.author?.login).filter(Boolean));
  return { total: contribs.length, topContributors: top, newContributors: Math.min(recentAuthors.size, contribs.length) };
}

module.exports = { fetchRepoData, fetchIssues, fetchPullRequests, fetchContributors };