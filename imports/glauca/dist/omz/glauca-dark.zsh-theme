# Glauca (Profundum) -- oh-my-zsh theme. Generated from glauca.json.
# Dark.
# Truecolor prompt (needs zsh >= 5.7). The bloom is the field; the blue mark
# lights only uncommitted work; a red caret/code means the last command failed.

ZSH_THEME_GIT_PROMPT_PREFIX=" %F{#4d7391}(%F{#45a3ad}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%F{#4d7391})%f"
ZSH_THEME_GIT_PROMPT_DIRTY="%F{#007aff}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT='%F{#93b7c9}%~%f$(git_prompt_info) %(?.%F{#4d7391}.%F{#c96a6a})❯%f '
RPROMPT='%(?..%F{#c96a6a}%?%f)'
