#!/bin/bash
# CineSync Autonomous Dev Loop
# Gebruik: cp .env.loop.example .env.loop && ./scripts/dev-loop.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Laad tokens uit .env.loop (staat in .gitignore)
if [ -f "$REPO_DIR/.env.loop" ]; then
  source "$REPO_DIR/.env.loop"
fi

: "${LINEAR_API_KEY:?Stel LINEAR_API_KEY in in .env.loop}"
: "${GITHUB_TOKEN:?Stel GITHUB_TOKEN in in .env.loop}"
: "${ANTHROPIC_API_KEY:?Stel ANTHROPIC_API_KEY in in .env.loop}"

PROJECT_ID="bfc8e21f-3d15-4c79-8809-525da6e34ddf"
GITHUB_REPO="r3ck3rs/cinesync"
TODO_STATE="cba60cb3-9779-49a4-b770-64de4f2f1aa1"
DOING_STATE="40a3e4f6-9ce6-47f9-b591-f875647839fd"
DONE_STATE="4c166869-6a76-4689-a340-70a784ab9b9f"
MODEL="claude-opus-4-5"

linear_query() {
  curl -s -X POST https://api.linear.app/graphql \
    -H "Authorization: $LINEAR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$1"
}

echo "🎬 CineSync Dev Loop gestart (model: $MODEL)..."

while true; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # 1. Volgende Todo ophalen (hoogste prioriteit eerst)
  NEXT=$(linear_query "{\"query\": \"{ project(id: \\\"$PROJECT_ID\\\") { issues(filter: { state: { id: { eq: \\\"$TODO_STATE\\\" } } }, orderBy: priority) { nodes { id identifier title description } } } }\"}" | \
    python3 -c "
import sys,json
d=json.load(sys.stdin)
issues=d['data']['project']['issues']['nodes']
if not issues:
    print('DONE')
else:
    i=issues[0]
    print(i['id']+'|||'+i['identifier']+'|||'+i['title']+'|||'+(i['description'] or ''))
")

  if [ "$NEXT" = "DONE" ]; then
    echo "🏁 Alle issues Done! Pipeline klaar."
    break
  fi

  ISSUE_ID=$(echo "$NEXT" | cut -d'|||' -f1)
  ISSUE_IDENTIFIER=$(echo "$NEXT" | cut -d'|||' -f2)
  ISSUE_TITLE=$(echo "$NEXT" | cut -d'|||' -f3)
  ISSUE_DESC=$(echo "$NEXT" | cut -d'|||' -f4)

  echo "📌 $ISSUE_IDENTIFIER — $ISSUE_TITLE"

  # 2. → Doing in Linear
  linear_query "{\"query\": \"mutation { issueUpdate(id: \\\"$ISSUE_ID\\\", input: { stateId: \\\"$DOING_STATE\\\" }) { success } }\"}" > /dev/null
  echo "🔄 Linear: Doing"

  # 3. Pull latest code
  cd "$REPO_DIR"
  git pull "https://$GITHUB_TOKEN@github.com/$GITHUB_REPO.git" main --quiet 2>/dev/null || true

  # 4. Fresh claude -p sessie (nieuwe sessie = geen AI rot, Opus voor kwaliteit)
  echo "🤖 Bouwen met $MODEL..."
  claude -p "
Je werkt aan CineSync — mobile-first social cinema app.
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, PWA.
Repo: $REPO_DIR

Taak: $ISSUE_IDENTIFIER — $ISSUE_TITLE
$ISSUE_DESC

Schrijf productieklare TypeScript. Geen placeholders.
Gebruik bestaande bestanden als basis (lees src/ eerst).
Zeg TASK_COMPLETE als je klaar bent.
" \
    --model "$MODEL" \
    --allowedTools "Write,Read,Edit,Bash" \
    --max-turns 30 2>&1

  # 5. Commit & push
  cd "$REPO_DIR"
  git add -A
  if ! git diff --cached --quiet; then
    git -c user.email="bot@cinesync.app" -c user.name="CineSync Bot" \
      commit -m "feat($ISSUE_IDENTIFIER): $ISSUE_TITLE"
    git push "https://$GITHUB_TOKEN@github.com/$GITHUB_REPO.git" main --quiet
    echo "📦 Gepusht naar GitHub"
  else
    echo "⚠️  Niets te committen"
  fi

  # 6. → Done in Linear
  linear_query "{\"query\": \"mutation { issueUpdate(id: \\\"$ISSUE_ID\\\", input: { stateId: \\\"$DONE_STATE\\\" }) { success } }\"}" > /dev/null
  echo "✅ Linear: Done"

  # Sessie gesloten → volgende iteratie = nieuwe claude -p sessie
  echo "🔁 Sessie gesloten. Volgende taak..."
  sleep 2
done
