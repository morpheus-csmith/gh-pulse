const { calculateHealthScore, formatNumber, timeAgo } = require("../src/utils");

console.log("🧪 Running tests...\n");
let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log("✅ " + name); passed++; }
  catch (e) { console.log("❌ " + name + ": " + e.message); failed++; }
}

test("formatNumber handles thousands", () => {
  if (formatNumber(1500) !== "1.5K") throw new Error("Expected 1.5K");
});

test("formatNumber handles millions", () => {
  if (formatNumber(2500000) !== "2.5M") throw new Error("Expected 2.5M");
});

test("timeAgo handles recent", () => {
  if (timeAgo(new Date().toISOString()) !== "Today") throw new Error("Expected Today");
});

test("calculateHealthScore returns valid score", () => {
  const data = {
    repo: { stargazers_count: 1000, pushed_at: new Date().toISOString() },
    issues: { open: 10, closed: 50, avgResponseTime: 24, staleCount: 2, recentActivity: 5 },
    pullRequests: { open: 5, merged: 30, avgMergeTime: 36, recentActivity: 3 },
    contributors: { total: 25, newContributors: 3 }
  };
  const result = calculateHealthScore(data);
  if (result.total < 0 || result.total > 100) throw new Error("Invalid score");
  if (!result.grade) throw new Error("Missing grade");
});

console.log("\n" + "─".repeat(40));
console.log("Tests: " + (passed+failed) + " | Passed: " + passed + " | Failed: " + failed);
process.exit(failed > 0 ? 1 : 0);
