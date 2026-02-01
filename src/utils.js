function calculateHealthScore(data) {
  const { repo, issues, pullRequests, contributors } = data;
  const scores = { activity: 0, maintenance: 0, community: 0, popularity: 0 };
  
  // Activity (0-25)
  const daysSincePush = repo.pushed_at ? Math.floor((Date.now() - new Date(repo.pushed_at)) / 86400000) : 999;
  if (daysSincePush <= 1) scores.activity = 25;
  else if (daysSincePush <= 7) scores.activity = 20;
  else if (daysSincePush <= 30) scores.activity = 15;
  else if (daysSincePush <= 90) scores.activity = 10;
  else scores.activity = 5;
  scores.activity = Math.min(25, scores.activity + Math.min((issues.recentActivity + pullRequests.recentActivity) * 0.5, 5));

  // Maintenance (0-25)
  if (issues.avgResponseTime !== null) {
    if (issues.avgResponseTime <= 24) scores.maintenance = 20;
    else if (issues.avgResponseTime <= 72) scores.maintenance = 15;
    else if (issues.avgResponseTime <= 168) scores.maintenance = 10;
    else scores.maintenance = 5;
  } else scores.maintenance = 10;
  const staleRatio = issues.open > 0 ? issues.staleCount / issues.open : 0;
  if (staleRatio > 0.5) scores.maintenance -= 5;
  else if (staleRatio > 0.3) scores.maintenance -= 3;
  if (pullRequests.avgMergeTime && pullRequests.avgMergeTime <= 48) scores.maintenance += 5;
  scores.maintenance = Math.max(0, Math.min(25, scores.maintenance));

  // Community (0-25)
  if (contributors.total >= 100) scores.community = 20;
  else if (contributors.total >= 50) scores.community = 15;
  else if (contributors.total >= 20) scores.community = 12;
  else if (contributors.total >= 10) scores.community = 8;
  else scores.community = 5;
  if (contributors.newContributors >= 5) scores.community += 5;
  else if (contributors.newContributors >= 2) scores.community += 3;
  scores.community = Math.min(25, scores.community);

  // Popularity (0-25)
  const stars = repo.stargazers_count || 0;
  if (stars >= 10000) scores.popularity = 25;
  else if (stars >= 5000) scores.popularity = 22;
  else if (stars >= 1000) scores.popularity = 18;
  else if (stars >= 500) scores.popularity = 15;
  else if (stars >= 100) scores.popularity = 12;
  else if (stars >= 50) scores.popularity = 8;
  else scores.popularity = 5;

  const total = scores.activity + scores.maintenance + scores.community + scores.popularity;
  let grade;
  if (total >= 90) grade = 'A+';
  else if (total >= 85) grade = 'A';
  else if (total >= 80) grade = 'A-';
  else if (total >= 75) grade = 'B+';
  else if (total >= 70) grade = 'B';
  else if (total >= 65) grade = 'B-';
  else if (total >= 60) grade = 'C+';
  else if (total >= 55) grade = 'C';
  else if (total >= 50) grade = 'C-';
  else if (total >= 40) grade = 'D';
  else grade = 'F';

  return { total, grade, breakdown: scores, details: { daysSincePush, staleRatio: Math.round(staleRatio * 100) } };
}

function formatNumber(num) {
  if (num == null) return 'N/A';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function timeAgo(date) {
  if (!date) return 'Never';
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function progressBar(value, max, width = 20) {
  const pct = Math.min(value / max, 1);
  const filled = Math.round(pct * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

module.exports = { calculateHealthScore, formatNumber, timeAgo, progressBar };