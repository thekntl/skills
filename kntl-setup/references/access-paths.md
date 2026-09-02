# Resolving an access path

The order (plugin → MCP → host CLI → browser) and the drop rule live in `docs/agents/kntl-conventions.md` → Tool access. This file is the checklist for filling the `Access path` and `Ready?` columns of `docs/agents/kntl-stack.md`, so that at runtime a skill reads its path instead of discovering one.

## Check each level, top down

1. **Plugin / skill.** The skill is in the Skill tool listing or under `~/.claude/skills/<name>`; MCP-served skills load from `skill://<server>/<name>/SKILL.md` (Figma: `read_skill_uri`).
2. **MCP.** Search the tools by the capability's keyword first (they load on demand), then read the configured roster (`claude mcp list` on the host, or the session's server list). A server listed as requiring authentication is `needs auth: <where>`: claude.ai connector settings for connectors, `/mcp` in an interactive session for local servers.
3. **Host CLI**, run outside the sandbox: `gh auth status` (the login name fills the GitHub row), `xcode-select -p` and `xcrun simctl list devices available`, `pnpm -v`, `go version`, `adb version`, `docker compose version`.
4. **Browser.** The browser MCP; the recorded path only for capabilities with no other level (Search Console) and for side-effectful web steps done with the owner's approval.

## Row format

`<category> | <choice> | <alternatives considered> | <level> <name> (<tools or commands>) | <ready?>`

- `GitHub | host gh | — | host gh, authorised as thekntl; repo thekntl/<slug> | ready`
- `Design inspiration | Mobbin | Dribbble | MCP mobbin_mcp (search_screens, search_flows, search_sections) | ready`
- `Design tool | Figma | — | MCP <figma-server> (get_design_context, get_screenshot) + skill://figma/figma-swiftui/SKILL.md | ready`
- `Product analytics | PostHog · D-012 | GA4, Amplitude | MCP <posthog-server> (read tools) | ready`
- `MMP / attribution | AppsFlyer | Adjust | MCP appsflyer | needs auth: claude.ai connector settings`
- `SEO | Google Search Console | — | browser only | owner: verify the domain`

`Ready?` values, the `none` rule, and where the ledger id sits: the header of `docs/agents/kntl-stack.md`.

## GitHub

Mandatory in every project. The row is filled from `gh auth status` run on the host: `host gh, authorised as <login>`. A sandboxed failure means rerun on the host; when the host call also fails, the row reads `owner: gh auth login` and the closing message hands the owner that command. Repositories live under `thekntl`, private by default.
