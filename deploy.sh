#!/usr/bin/env bash
# ============================================================
#  硬糖的地理芝士 — 一键发布到 GitHub Pages
#
#  用法：
#    ./deploy.sh              # 发布到名为 geo-cheese 的公开仓库
#    ./deploy.sh my-repo      # 自定义仓库名
#    ./deploy.sh my-repo private
#
#  前置条件：已执行 `gh auth login`（登录你的 GitHub 账号）
#  若尚未安装 gh：winget install --id GitHub.cli
# ============================================================
set -euo pipefail

REPO="${1:-geo-cheese}"
VISIBILITY="${2:-public}"
cd "$(dirname "$0")"

# --- 定位 gh ---
if command -v gh >/dev/null 2>&1; then
  GH="gh"
elif [ -x "/c/Users/latis/.workbuddy-ai/binaries/gh/gh.exe" ]; then
  GH="/c/Users/latis/.workbuddy-ai/binaries/gh/gh.exe"
elif [ -x "$HOME/.workbuddy-ai/binaries/gh/gh.exe" ]; then
  GH="$HOME/.workbuddy-ai/binaries/gh/gh.exe"
else
  echo "✗ 找不到 gh。请先安装：winget install --id GitHub.cli  然后执行 gh auth login" >&2
  exit 1
fi

echo "==> 使用 $($GH --version | head -1)"

# --- 检查登录 ---
if ! $GH auth status >/dev/null 2>&1; then
  echo "✗ 未登录 GitHub。请先执行： gh auth login" >&2
  exit 1
fi

# --- 提交本地改动 ---
if [ -n "$(git status --porcelain)" ]; then
  echo "==> 检测到未提交改动，自动提交"
  git add -A
  git commit -m "chore: 更新教学资料 $(date '+%Y-%m-%d %H:%M')"
fi

# --- 创建/推送仓库 ---
if $GH repo view "$REPO" >/dev/null 2>&1; then
  echo "==> 仓库 $REPO 已存在，改为推送更新"
  $GH repo set-default "$REPO" 2>/dev/null || true
  git remote remove origin 2>/dev/null || true
  git remote add origin "$($GH repo view "$REPO" --json sshUrl --jq .sshUrl)"
  git push -u origin HEAD
else
  echo "==> 创建仓库 $REPO（$VISIBILITY）并推送"
  $GH repo create "$REPO" --"$VISIBILITY" --source=. --remote=origin --push
fi

echo "==> 开启 GitHub Pages（source: main / root）"
$GH api "repos/$REPO/pages" -X POST \
  -f source[branch]=main -f source[path]=/ \
  --jq '.html_url' 2>/dev/null || echo "   （Pages 可能已开启，或请在仓库 Settings → Pages 中确认）"

echo ""
echo "✅ 完成。你的讲义地址（稍等 1–2 分钟生效）："
$GH api "repos/$REPO/pages" --jq '.html_url' 2>/dev/null || \
  echo "   https://<你的用户名>.github.io/$REPO/"
