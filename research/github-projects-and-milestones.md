# GitHub Projects and Milestones for a Solo MVP Launch

**Date:** 2026-07-28
**Decision context:** One solo operator shipping one product in 3–7 days; work may include product code, backend/infrastructure, a marketing site, creative production, release operations, and post-launch learning.

## Contents

- Recommendation
- Native object semantics
- Project topology evaluation
- Concrete MVP configuration
- Milestone policy
- Automation and current constraints
- First-party pattern and final rule

## Recommendation

Use **one GitHub Project per bounded product launch**, not one Project per component.

Name it `<PRODUCT> — MVP Launch`. Put every launch-scoped issue and pull request in it, even when the work spans multiple repositories. Represent product, website, backend, creatives, release, and post-launch as native parent/sub-issue groups plus filtered views. GitHub Projects is explicitly designed to expose the same items through multiple table, board, and roadmap views, filtered or grouped by fields and native issue metadata; a separate Project is therefore unnecessary merely to obtain a component-specific view ([About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects), [managing views](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/managing-your-views), [parent and progress fields](https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-parent-issue-and-sub-issue-progress-fields)).

This also matches GitHub's first-party operating guidance: start with a Project for a shorter, bounded deliverable, use saved views for the perspectives individual teams need, close the Project when the deliverable ends, and only then ladder repeated cycles into larger objectives ([GitHub's project-planning guide](https://github.blog/developer-skills/github/getting-started-with-project-planning-on-github/)). A 3–7-day launch is an even stronger case for that model.

Do **not** make a Project mandatory merely because Projects exists. Create it when the skill will create more than a handful of related issues, span workstreams/repositories, or need a launch dashboard. For a genuinely tiny launch that fits in one parent issue and a few sub-issues, the issue hierarchy and milestone already provide enough control.

## What each native object should mean

| Object | Meaning in this workflow | Do not use it for |
| --- | --- | --- |
| Issue | Canonical work item or decision; owns discussion, state, assignee, type, labels, milestone, and relations | A duplicate card made only for a view |
| Parent/sub-issue | Scope decomposition: launch map → phase/workstream → executable work | Execution order |
| Blocked-by/blocking | A real prerequisite that changes what can start | Merely showing that two issues are related |
| Milestone | One repository's bounded, dated outcome or release | Component/category, indefinite backlog, or status |
| Project | A live planning and visualization surface over issues and PRs | A second source of truth for native issue metadata |
| Project view | A workstream, audience, horizon, or question-specific perspective | A reason to create another Project |

GitHub defines milestones as groups of issues and pull requests **in a repository**, with a due date and completion percentage. Projects operate at user or organization level and can present items as tables, boards, and roadmaps ([milestones](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work/about-milestones), [Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)). Project views can filter by repository and milestone; roadmap views can display milestones as date markers ([project filtering](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects), [roadmap layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-roadmap-layout)).

## Evaluation of the three topologies

### A. One Project for the product launch — default

Benefits:

- One queue answers the solo operator's real question: “What is the next unblocked action that moves this launch forward?”
- Cross-workstream dependencies stay visible instead of being split across boards.
- Native metadata remains one source of truth and all component perspectives are saved views.
- One Status field, one automation policy, and one archive lifecycle avoid drift.
- A Project can include issues and PRs from multiple repositories owned by the same user or organization; repository filtering supplies component-specific views ([creating a Project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project), [filtering by repository](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)).

Cost: a single Project needs disciplined fields and filters. That is cheaper than maintaining several Projects for a launch measured in days.

### B. Separate Projects for product, website, creatives, and infrastructure — exception

Use separate component Projects only when a component has become an independently operated stream with at least one material boundary:

- a different durable owner or team;
- different access/visibility;
- a distinct cadence and backlog continuing beyond the launch;
- a genuinely different workflow whose Status vocabulary cannot be shared;
- enough concurrent work that its own reporting is valuable after the launch Project closes.

Repository boundaries alone are insufficient because one Project already supports multiple repositories and repo-filtered views. Creating several Projects gives the same issue independent project-scoped field values; GitHub warns that project fields are scoped to one Project and that duplicating the same concept across project and issue fields causes confusion ([organization issue fields](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/managing-issue-fields-in-your-organization)). The risk is especially high for `Status`, `Priority`, and target date.

If a durable component Project exists, a launch issue may belong to both it and the launch Project. Keep canonical metadata on the issue, use organization issue fields when available, and never maintain two independent Priority or date fields.

### C. Portfolio Project plus component Projects — later-stage model

This is appropriate for multiple concurrent products, durable teams, or several launches that need executive roll-up. It is excessive for one solo MVP.

GitHub Projects contain issues, pull requests, and draft issues—not other Projects—so there is no native Project-of-Projects roll-up ([managing Project items](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project)). A portfolio therefore must either duplicate leaf issues into multiple Projects or contain synthetic/top-level initiative issues. Prefer the latter: put only product/launch parent issues in the portfolio and use native sub-issue progress for roll-up. Keep leaf work in its launch/component Project. This limits duplicate membership and project-field drift.

## Concrete MVP configuration

Create one Project owned by the same account that owns the repositories: organization-owned for organization repositories, user-owned for personal repositories. GitHub only lists a Project in repositories owned by that same user or organization, and an organization Project tracks its organization's repositories ([linking Projects and repositories](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-your-project/adding-your-project-to-a-repository), [creating a Project](https://docs.github.com/en/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project)).

Use native fields first:

- Title, Assignees, Labels, Milestone, Issue type
- Parent issue, Sub-issue progress
- Linked pull requests and Reviewers
- one project-scoped `Status`: `Backlog`, `Ready`, `In progress`, `Blocked`, `In review`, `Done`

Add only metadata that cannot be derived:

- `Workstream` as an organization issue field when available; otherwise one consistent label namespace such as `workstream:product`, `workstream:web`, `workstream:creative`, `workstream:infra`, `workstream:release`
- item Start/Target dates only when individual work actually needs scheduling; do not copy the launch due date onto every item

As of 2026-07-28, organization issue fields are **generally available** for organizations on GitHub Free, Team, Enterprise Cloud, Enterprise Server, and Enterprise Managed Users; project custom fields remain Project-specific. Prefer an available organization issue field for metadata shared across Projects, but detect live availability and fall back to one label namespace when the repository is personal or the field is unavailable ([GitHub's issue-fields GA announcement](https://github.blog/changelog/2026-07-02-issue-fields-are-now-generally-available/)).

Create **Active Frontier** as the baseline view. Add the others only when their content exists:

1. **Active Frontier** — board by Status; open and launch-scoped work.
2. **Workstreams** — only for multiple active workstreams; group by Workstream or parent.
3. **Critical Path** — only when real blocking relationships exist.
4. **Owner Actions** — only while owner-action issues are open.
5. **Decisions** — only while decision or research issues are active.
6. **Launch Roadmap** — only for real Start/Target dates or milestone markers.
7. **Post-launch** — only when stabilization or learning work exists.

Hierarchy view is generally available and supports the full sub-issue tree; sub-issues support up to eight levels and 100 children per parent. Keep this MVP hierarchy to three levels despite the higher platform limit ([hierarchy-view GA](https://github.blog/changelog/2026-03-19-hierarchy-view-in-github-projects-is-now-generally-available/), [sub-issue limits](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)).

## Milestone policy

Milestones are release/timebox commitments, not component containers:

- `validate-first`: `Demand validation — YYYY-MM-DD`; create `MVP public launch — YYYY-MM-DD` only after `GO` or an explicitly approved build-to-learn decision.
- `build-first` or `parallel`: create `MVP public launch — YYYY-MM-DD` at bootstrap.
- Create `Post-launch stabilization — YYYY-MM-DD` only when its scope and due date are committed.
- Leave indefinite ideas and deferred backlog **without a milestone**; expose them through the Post-launch view/label. Assigning an endless backlog to a milestone destroys its completion signal.
- Never create separate `Website`, `Creative`, or `Backend` milestones. Use parent issues, Workstream, and views.

Milestones are repository-scoped, and an issue exposes one milestone value. If all planning issues live in one primary repository, use one milestone there. If executable issues must live in multiple repositories, create matching dated milestones per repository and treat them as synchronized replicas; the Project is the cross-repository roll-up. Read them back and fail on title/due-date drift ([milestone REST API](https://docs.github.com/en/rest/issues/milestones), [issue milestone field](https://docs.github.com/en/rest/issues/issues)).

## Automation and current constraints

- Add every skill-created issue to the Project explicitly and read membership/field values back. Built-in auto-add does not backfill existing matches and is capped at 1 workflow on Free, 5 on Pro/Team, and 20 on Enterprise Cloud; each workflow targets one repository ([auto-add](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/adding-items-automatically)).
- Use built-in close/merge Status automation when available, but do not depend on auto-add for correctness. API or GitHub Actions can add items and update fields ([Project automation](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project)).
- GitHub's REST API version `2026-03-10` can manage Projects, items, fields, and create table/board/roadmap views; GraphQL and `gh project` remain available. Mutations require the appropriate `project`/Projects write permissions ([Projects REST API](https://docs.github.com/en/rest/projects), [Project views API](https://docs.github.com/en/rest/projects/views), [GraphQL guide](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)).
- A Project is limited to 50 fields and 50,000 active-plus-archived items. These limits are irrelevant for one MVP but should be validator guardrails ([field limit](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects), [item limit](https://docs.github.com/en/issues/planning-and-tracking-with-projects/managing-items-in-your-project/archiving-items-from-your-project)).

## First-party pattern and final rule

GitHub's own public roadmap uses one organization Project for many product/feature areas, with issues categorized by release phase, feature area, product/SKU, and delivery horizon rather than a separate Project for each feature ([GitHub public roadmap](https://github.com/github/roadmap), [public roadmap Project](https://github.com/orgs/github/projects/4247)). It is a portfolio-scale example, not a mandate for every team, but it demonstrates the intended leverage: one item set, multiple classifications and views.

The skill rule should therefore be:

> Create the fewest Projects that preserve one coherent delivery outcome. For one MVP launch, default to one launch Project and express components as native hierarchy, metadata, and views. Split a component into its own Project only after a durable ownership, access, cadence, or workflow boundary exists. Add a portfolio Project only when multiple independent products or teams require roll-up.
