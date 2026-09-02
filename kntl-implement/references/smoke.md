# Smoke on the real runtime

Smoke is the walk a user would take through the ticket's scenario, on the development runtime, with the real modules behind it. The PR (or, in a chain, the Hikaye comment on the ticket) carries the evidence from this walk.

## Before the walk

- **Scenario.** The ticket's `flow:<slug>` label names an entry in `docs/design/SCENARIOS.md`. Walk its happy path and its named error path; the ticket's acceptance criteria say which steps the change touches, and those steps get the closest look.
- **Real modules.** Start the local development services yourself (containers on your own machine are yours to run) and confirm the development configuration binds the real database, auth and adapters. An in-memory store, a fake adapter or a bypassed login on the scenario's path is a finding: replace it, then walk again; environment parity in `docs/agents/kntl-conventions.md` is the rule.

## Evidence

For every scenario step, three things: what you did (one line), what you saw (one line), one screenshot. The smoke directory is `docs/kntl/smoke/<N>/` in the repo, so the owner sees the evidence on GitHub: files are `<smoke-dir>/<step>.png`, kept small (`sips -Z 800 <file>`) and committed with the ticket, and the PR's `## Smoke on the real runtime` section (in a chain, the Hikaye comment) lists each step with its observation and the file's repo path. A step you could not perform is written as such with its reason and becomes a hand-off line under `## Human validation`.

Zero console, log or crash errors on the walked path is part of the evidence: say that you checked, and how.

## Web: in-app browser tools (`mcp__Claude_Browser__*`)

1. `preview_start` with the dev server entry from `.claude/launch.json`; when the file is missing, create it from the run command in `kntl-stack.md` and commit it with the ticket, then start. `preview_logs` shows build and server errors.
2. Walk: `navigate` to the entry URL; `find` or `read_page` for element refs; `computer` for clicks, typing and keys; `form_input` for fields; `computer` `screenshot` after every step to inspect. The file copy comes from `screencapture -x <smoke-dir>/<step>.png` while the pane shows the step (`-R x,y,w,h` limits it to the pane), or from headless Chrome (`--headless --screenshot=<smoke-dir>/<step>.png <url>`) when the step's state is reachable by URL. Phone layouts: `resize_window` preset `mobile`, then reload; reset to `desktop` when done.
3. At the end: `read_console_messages` with `onlyErrors`, `read_network_requests` for failed calls.
4. The observation for a state that carries data quotes the `get_page_text` excerpt.

## iOS: simulator tools (`mcp__Claude_Code_iOS_Simulator__*`)

1. `control` `attach` first so the panel is visible; a "nothing booted" error is harmless, boot or build, then retry.
2. Build with the server's `build` tool (load it with ToolSearch) or `xcodebuild -scheme <scheme> -destination 'platform=iOS Simulator,name=<device>' build` per `kntl-stack.md`; then `control` `launch` with `app_path` and `bundle_id`. The launch result reports the screen size in points.
3. Walk with `tap`, `swipe`, `text`, `button`, `open_url`; coordinates are points from the top-left, and a swipe that starts within 4pt of an edge is an OS gesture, so start further in. `screenshot` after every step to inspect; the file copy comes from `xcrun simctl io booted screenshot <smoke-dir>/<step>.png`.
4. Crash check: a new `.ips` file under `~/Library/Logs/DiagnosticReports` since launch, or `xcrun simctl spawn booted log show --last 10m --predicate 'process == "<app>"'` for errors.

## Android: emulator through the host CLI

1. `emulator -list-avds`; `emulator -avd <name> &`; `adb wait-for-device`.
2. Build and install per `kntl-stack.md` (`./gradlew installDebug` by default); `adb shell am start -n <package>/<activity>`.
3. Walk: `adb shell uiautomator dump && adb pull /sdcard/window_dump.xml` gives element bounds; then `adb shell input tap <x> <y>`, `adb shell input text '<text>'`, `adb shell input keyevent <KEY>`, `adb shell input swipe x1 y1 x2 y2`. Screenshot: `adb exec-out screencap -p > <smoke-dir>/<step>.png`.
4. Crash check: `adb logcat -d '*:E' | grep <package>`.

## macOS app: host CLI

1. `xcodebuild -scheme <scheme> -configuration Debug build`; the app path is `BUILT_PRODUCTS_DIR` from `xcodebuild -showBuildSettings` plus the product name; `open <path>.app`.
2. Walk with `osascript` and System Events (`click menu item`, `click button`, `keystroke`). The terminal needs the Accessibility permission, which the owner grants once in System Settings; while it is missing, hand the owner the steps and record the walk as a hand-off.
3. Screenshot: `screencapture -x <smoke-dir>/<step>.png`.
4. Crash check: a new `<app>*.ips` under `~/Library/Logs/DiagnosticReports` since launch.
