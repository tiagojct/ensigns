# Glauca (Pruina) -- oh-my-zsh theme. Generated from glauca.json.
# Light.
# Truecolor prompt (needs zsh >= 5.7). The bloom is the field; the blue mark
# lights only uncommitted work; a red caret/code means the last command failed.

ZSH_THEME_GIT_PROMPT_PREFIX=" %F{#55646d}(%F{#306972}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%F{#55646d})%f"
ZSH_THEME_GIT_PROMPT_DIRTY="%F{#0b62cf}*"
ZSH_THEME_GIT_PROMPT_CLEAN=""

PROMPT='%F{#3e6d84}%~%f$(git_prompt_info)
%(?.%F{#3e6d84}.%F{#784a4d})❯%f '
RPROMPT='%(?..%F{#784a4d}%?%f)'
