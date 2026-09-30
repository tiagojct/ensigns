# Glauca (Profundum) -- oh-my-zsh theme. Generated from glauca.json.
# Dark.
# Truecolor single-line prompt (needs zsh >= 5.7): venv + cwd + git + caret,
# with a slow command's runtime and a failed command's exit code on the right.

zmodload zsh/datetime 2>/dev/null
autoload -Uz add-zsh-hook 2>/dev/null
_glauca_preexec() { _glauca_start=$EPOCHREALTIME }
# The venv and runtime segments are coloured here, in plain shell, not in the
# prompt string: a %F{...} inside a ${x:+...} confuses prompt brace-matching.
_glauca_precmd() {
  _glauca_dur=''
  if (( ${_glauca_start:-0} )); then
    local e=$(( EPOCHREALTIME - _glauca_start ))
    (( e >= 2 )) && _glauca_dur="%F{#8c8c8c}$(printf '%.1fs' $e)%f"
    _glauca_start=0
  fi
  if [[ -n $VIRTUAL_ENV ]]; then _glauca_venv="%F{#8c8c8c}${VIRTUAL_ENV:t} %f"; else _glauca_venv=''; fi
  local p=${${(%):-%~}//\%/%%}
  if [[ $p == */?* ]]; then _glauca_path="%F{#526672}${p%/*}/%f%F{#93b7c9}${p##*/}%f"; else _glauca_path="%F{#93b7c9}${p}%f"; fi
}
# Register defensively: if add-zsh-hook is unavailable (broken fpath), skip the timing
# feature silently rather than spilling 'function definition file not found' at every prompt.
if (( $+functions[add-zsh-hook] )); then
  add-zsh-hook preexec _glauca_preexec 2>/dev/null
  add-zsh-hook precmd _glauca_precmd 2>/dev/null
fi

ZSH_THEME_GIT_PROMPT_PREFIX=" %F{#4d7391}(%F{#45a3ad}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%F{#4d7391})%f"
ZSH_THEME_GIT_PROMPT_DIRTY="%F{#007aff}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT='${_glauca_venv}${_glauca_path}$(git_prompt_info) %(?.%F{#4d7391}.%F{#c96a6a})❯%f '
RPROMPT='${_glauca_dur}%(?.. %F{#c96a6a}%?%f)'
