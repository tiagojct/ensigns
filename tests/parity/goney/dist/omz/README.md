# Glauca for oh-my-zsh

A single-line prompt in the Glauca palette: **Profundum** (`glauca-dark.zsh-theme`,
dark) and **Pruina** (`glauca.zsh-theme`, light). Truecolor, so the
brand hues render exactly in any terminal; pairs with the Glauca terminal
preset (Ghostty / iTerm).

The whole prompt is cool bloom; the blue mark (dies) lights in one place only,
the git-dirty mark (`*`). A failed command turns the caret red and shows the
exit code on the right; a command that ran two seconds or longer shows its
runtime there too. An active Python venv, the cwd, git, and the caret sit
together on the cursor's line.

Generated from `glauca.json`; edit the json and run `make generate`, never
the theme file.

## Install

Copy a theme into oh-my-zsh's custom themes directory and select it in `~/.zshrc`:

    cp glauca.zsh-theme "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/"
    # then in ~/.zshrc:
    ZSH_THEME="glauca"

Use `glauca-dark` instead for the dark terminal. Needs zsh 5.7+ for
truecolor prompt escapes (macOS ships 5.9). Git segment uses oh-my-zsh's own
`git_prompt_info`, so no extra plugin is required.
