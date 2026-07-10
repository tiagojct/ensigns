# Glauca (Pruina) -- oh-my-zsh theme. Generated from glauca.json.
# Light.
# Truecolor single-line prompt (needs zsh >= 5.7): venv + cwd + git + caret,
# with a slow command's runtime and a failed command's exit code on the right.

zmodload zsh/datetime 2>/dev/null
autoload -Uz add-zsh-hook
_glauca_preexec() { _glauca_start=$EPOCHREALTIME }
# The venv and runtime segments are coloured here, in plain shell, not in the
# prompt string: a %F{...} inside a ${x:+...} confuses prompt brace-matching.
_glauca_precmd() {
  _glauca_dur=''
  if (( ${_glauca_start:-0} )); then
    local e=$(( EPOCHREALTIME - _glauca_start ))
    (( e >= 2 )) && _glauca_dur="%F{#55646d}$(printf '%.1fs' $e)%f"
    _glauca_start=0
  fi
  if [[ -n $VIRTUAL_ENV ]]; then _glauca_venv="%F{#55646d}${VIRTUAL_ENV:t} %f"; else _glauca_venv=''; fi
  local p=${${(%):-%~}//\%/%%}
  if [[ $p == */?* ]]; then _glauca_path="%F{#92a6b0}${p%/*}/%f%F{#35576b}${p##*/}%f"; else _glauca_path="%F{#35576b}${p}%f"; fi
}
add-zsh-hook preexec _glauca_preexec
add-zsh-hook precmd _glauca_precmd

ZSH_THEME_GIT_PROMPT_PREFIX=" %F{#55646d}(%F{#306972}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%F{#55646d})%f"
ZSH_THEME_GIT_PROMPT_DIRTY="%F{#0b62cf}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT='${_glauca_venv}${_glauca_path}$(git_prompt_info) %(?.%F{#3e6d84}.%F{#784a4d})❯%f '
RPROMPT='${_glauca_dur}%(?.. %F{#784a4d}%?%f)'
