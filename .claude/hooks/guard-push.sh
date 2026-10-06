#!/usr/bin/env bash
cmd=$(jq -r '.tool_input.command // ""')
if echo "$cmd" | grep -Eq '\bgit\b.*\bpush\b'; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"ask","permissionDecisionReason":"git push needs manual approval"}}'
fi
exit 0