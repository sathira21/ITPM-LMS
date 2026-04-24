#!/bin/sh

# Backup current refs
rm -rf .git/refs/original/

git filter-branch -f --env-filter '
# Current Identities (from previous turn)
# ID1: Sathira <IT22547842@my.sliit.lk> (Rank 1)
# ID2: Chanuque <chanuquegg@gmail.com> (Rank 2)
# ID3: Pramudiv <pramuvima@gmail.com> (Rank 3)
# ID4: Poornima <poorseww929@gmail.com> (Rank 4)

# Targets
# Chanuque -> Rank 1
# Sathira -> Rank 2
# Poornima -> Rank 3
# Pramudiv -> Rank 4

# We Use the OLD_EMAIL to decide the new identity

OLD_AUTHOR_EMAIL="$GIT_AUTHOR_EMAIL"
OLD_COMMITTER_EMAIL="$GIT_COMMITTER_EMAIL"

# Sathira <IT22547842@my.sliit.lk> was #1. Now make him Chanuque.
if [ "$OLD_AUTHOR_EMAIL" = "IT22547842@my.sliit.lk" ]; then
    export GIT_AUTHOR_NAME="Chanuque"
    export GIT_AUTHOR_EMAIL="chanuquegg@gmail.com"
elif [ "$OLD_AUTHOR_EMAIL" = "chanuquegg@gmail.com" ]; then
    export GIT_AUTHOR_NAME="Sathira"
    export GIT_AUTHOR_EMAIL="IT22547842@my.sliit.lk"
elif [ "$OLD_AUTHOR_EMAIL" = "pramuvima@gmail.com" ]; then
    export GIT_AUTHOR_NAME="Poornima"
    export GIT_AUTHOR_EMAIL="poorseww929@gmail.com"
elif [ "$OLD_AUTHOR_EMAIL" = "poorseww929@gmail.com" ]; then
    export GIT_AUTHOR_NAME="Pramudiv"
    export GIT_AUTHOR_EMAIL="pramuvima@gmail.com"
fi

if [ "$OLD_COMMITTER_EMAIL" = "IT22547842@my.sliit.lk" ]; then
    export GIT_COMMITTER_NAME="Chanuque"
    export GIT_COMMITTER_EMAIL="chanuquegg@gmail.com"
elif [ "$OLD_COMMITTER_EMAIL" = "chanuquegg@gmail.com" ]; then
    export GIT_COMMITTER_NAME="Sathira"
    export GIT_COMMITTER_EMAIL="IT22547842@my.sliit.lk"
elif [ "$OLD_COMMITTER_EMAIL" = "pramuvima@gmail.com" ]; then
    export GIT_COMMITTER_NAME="Poornima"
    export GIT_COMMITTER_EMAIL="poorseww929@gmail.com"
elif [ "$OLD_COMMITTER_EMAIL" = "poorseww929@gmail.com" ]; then
    export GIT_COMMITTER_NAME="Pramudiv"
    export GIT_COMMITTER_EMAIL="pramuvima@gmail.com"
fi
' --tag-name-filter cat -- --branches --tags
