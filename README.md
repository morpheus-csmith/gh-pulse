# 🏥 gh-pulse

> Get a quick health check of any GitHub repository

**gh-pulse** analyzes GitHub repositories and provides a comprehensive health report including activity metrics, issue tracking, PR statistics, contributor insights, and an overall "pulse" score.

## ✨ Features

- 📊 **Health Score** - Overall grade (A+ to F) based on 4 categories
- 🐛 **Issue Analysis** - Open/closed ratio, response times, stale issues
- 🔀 **PR Metrics** - Merge times, approval rates, activity
- 👥 **Contributor Stats** - Top contributors, new contributor trends
- 🎨 **Beautiful CLI** - Colored output with progress bars

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Run with demo data
node src/index.js facebook/react --demo

# Run on a real repo (requires internet)
node src/index.js facebook/react

# Detailed report
node src/index.js vercel/next.js --detailed

# JSON output
node src/index.js microsoft/vscode --json
```

## 📊 Health Score

| Category | Weight | Factors |
|----------|--------|---------|
| Activity | 25 pts | Recent commits, days since last push |
| Maintenance | 25 pts | Issue response time, stale issues, PR merge time |
| Community | 25 pts | Total contributors, new contributors |
| Popularity | 25 pts | Stars, forks, watchers |

## 🤖 Built with GitHub Copilot

This project was built during **Type Mini Hackathon** with GitHub Copilot assistance:
- CLI structure and argument parsing
- GitHub API integration patterns
- Health score algorithm design
- Terminal UI formatting

## 📁 Project Structure
```
gh-pulse/
├── src/
│   ├── index.js    # CLI entry point
│   ├── api.js      # GitHub API calls
│   ├── utils.js    # Scoring & utilities
│   └── display.js  # Terminal rendering
├── tests/
│   └── test.js     # Unit tests
├── .github/
│   └── workflows/
│       └── ci.yml  # GitHub Actions
└── package.json
```

## 🔧 Options

| Option | Description |
|--------|-------------|
| `-d, --detailed` | Show detailed report with recommendations |
| `-j, --json` | Output as JSON |
| `--demo` | Use demo data (no API calls) |

## 📝 License

MIT © morpheus-csmith

---
Built with ❤️ for Type Mini Hackathon
