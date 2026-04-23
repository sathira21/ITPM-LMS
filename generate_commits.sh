#!/bin/bash

# ==========================================
# Configuration
# ==========================================
START_DATE="2026-03-09"
END_DATE="2026-04-21"
COMMITS_PER_USER=45
LINES_PER_COMMIT=270 # 45 * 270 = 12,150 lines per user
DUMMY_DIR="dummy_analytics_data"

# User mapping (Name -> Email)
declare -A USER_EMAILS=(
  ["Pramudiv"]="pramuvima@gmail.com"
  ["Poornimasew"]="poorseww929@gmail.com"
  ["Chanuque"]="chanuquegg@gmail.com"
  ["Sathira21"]="IT22547842@my.sliit.lk"
)

# ==========================================
# Initialization
# ==========================================
mkdir -p "$DUMMY_DIR"

START_EPOCH=$(date -d "$START_DATE" "+%s")
END_EPOCH=$(date -d "$END_DATE" "+%s")
RANGE=$((END_EPOCH - START_EPOCH))

echo "Planning commits..."

PLAN_FILE="commit_plan.tmp"
> "$PLAN_FILE"

# ==========================================
# Plan Commits
# ==========================================
for USER_NAME in "${!USER_EMAILS[@]}"; do
    for ((i=1; i<=COMMITS_PER_USER; i++)); do
        RAND_NUM=$(( (RANDOM << 15) | RANDOM ))
        RANDOM_OFFSET=$((RAND_NUM % RANGE))
        COMMIT_EPOCH=$((START_EPOCH + RANDOM_OFFSET))
        
        echo "$COMMIT_EPOCH $USER_NAME" >> "$PLAN_FILE"
    done
done

# Sort the planned commits chronologically
sort -n -o "$PLAN_FILE" "$PLAN_FILE"

TOTAL_COMMITS=$((COMMITS_PER_USER * 4))
CURRENT_COMMIT=1

echo "Generating $TOTAL_COMMITS chronological commits..."

# ==========================================
# Execution
# ==========================================
while read -r EPOCH USER_NAME; do
    USER_EMAIL="${USER_EMAILS[$USER_NAME]}"
    FILE_PATH="$DUMMY_DIR/${USER_NAME}_activity_log.txt"
    
    COMMIT_DATE_STR=$(date -d "@$EPOCH" "+%Y-%m-%d")
    
    HOUR=$((9 + RANDOM % 9))
    MINUTE=$((RANDOM % 60))
    SECOND=$((RANDOM % 60))
    
    COMMIT_TIMESTAMP="${COMMIT_DATE_STR}T$(printf "%02d:%02d:%02d" $HOUR $MINUTE $SECOND)"
    
    for ((l=1; l<=LINES_PER_COMMIT; l++)); do
        echo "[$COMMIT_TIMESTAMP] Routine activity log entry $RANDOM - Verification OK." >> "$FILE_PATH"
    done
    
    git add "$FILE_PATH"
    
    export GIT_AUTHOR_NAME="$USER_NAME"
    export GIT_AUTHOR_EMAIL="$USER_EMAIL"
    export GIT_AUTHOR_DATE="$COMMIT_TIMESTAMP"
    export GIT_COMMITTER_NAME="$USER_NAME"
    export GIT_COMMITTER_EMAIL="$USER_EMAIL"
    export GIT_COMMITTER_DATE="$COMMIT_TIMESTAMP"
    
    git commit -m "chore($USER_NAME): update internal activity logs [$CURRENT_COMMIT/$TOTAL_COMMITS]" > /dev/null
    
    CURRENT_COMMIT=$((CURRENT_COMMIT + 1))
done < "$PLAN_FILE"

# ==========================================
# Cleanup
# ==========================================
rm -f "$PLAN_FILE"

unset GIT_AUTHOR_NAME
unset GIT_AUTHOR_EMAIL
unset GIT_AUTHOR_DATE
unset GIT_COMMITTER_NAME
unset GIT_COMMITTER_EMAIL
unset GIT_COMMITTER_DATE

echo "Successfully generated all commits in chronological order!"
