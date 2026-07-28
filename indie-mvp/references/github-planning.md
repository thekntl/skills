# GitHub Native Planning Contract

## Contents

- Applicability rule
- Native object semantics
- Issue metadata
- Hierarchy and dependencies
- Milestones
- Projects
- Mutation and readback protocol
- Lifecycle maintenance
- Failure behavior

## Applicability rule

Before creating or changing tracker items, inspect the repository owner, enabled GitHub features, available issue types, permissions, existing milestones, and existing Projects.

Use every native planning feature that is applicable to the work and available to the repository. A feature is applicable only when its meaning is true. Do not invent an assignee, dependency, date, type, or status merely to populate a field.

Native metadata is canonical. A body checklist or Markdown link may explain a relationship, but it never substitutes for a supported native parent, sub-issue, blocked-by, blocking, milestone, Project membership, issue type, assignee, label, linked pull request, or state reason.

## Native object semantics

| Object | Meaning |
| --- | --- |
| Issue | One canonical decision, research result, owner action, defect, or executable outcome |
| Parent/sub-issue | Scope decomposition and progress roll-up |
| Blocked-by/blocking | A real prerequisite that changes whether work can start |
| Milestone | One repository's bounded, dated delivery commitment |
| Project | A planning and visualization surface over canonical issues and pull requests |
| Project view | A filtered perspective for a workstream, audience, horizon, or question |

Do not create duplicate draft Project items for existing issues. Do not use hierarchy to imply execution order or milestones to classify components.

## Issue metadata

For each issue:

- choose the closest enabled native issue type; use labels only when no suitable type exists;
- apply one phase label plus the smallest useful workflow, priority, and workstream labels;
- assign only a confirmed responsible GitHub account;
- keep unattended `ready-for-agent` implementation issues unassigned until the loop claims them;
- link the focused pull request natively and close with the correct `completed` or `not planned` state reason;
- pin the Product Launch Map when repository support and permission permit it;
- use Project Start/Target dates only when the item has a real schedule distinct from the milestone due date.

Do not create new organization-wide issue types or fields without authority. Prefer existing native fields, then an organization issue field when available, then one consistent label namespace.

## Hierarchy and dependencies

Use this default three-level tree:

1. `Product Launch Map` is the parentless root.
2. Every phase issue is a direct sub-issue of the map.
3. Every decision, research, implementation, defect, and owner-action issue is a direct sub-issue of the phase that owns its outcome.

Give an issue exactly one meaningful parent. For cross-phase work, keep the parent that owns the outcome and model actual prerequisites with native blocked-by/blocking links.

Create a dependency only when the dependent work cannot safely start or finish without the prerequisite. GitHub maintains the inverse direction; verify both directions during readback. Do not use dependencies for loose relevance, sequencing preferences, or shared context.

## Milestones

Use milestones for dated delivery outcomes:

- `validate-first`: create `Demand validation — YYYY-MM-DD` at bootstrap. Create `MVP public launch — YYYY-MM-DD` only after `GO` or `BUILD-TO-LEARN`.
- `build-first` or `parallel`: create `MVP public launch — YYYY-MM-DD` at bootstrap.
- Create `Post-launch stabilization — YYYY-MM-DD` only after its scope and due date are committed.

Assign every issue and pull request to the earliest active commitment that contains its outcome:

- validation work goes to the demand-validation milestone;
- launch work goes to the public-launch milestone;
- an owner action goes to the earliest milestone it can block;
- the Product Launch Map follows the active commitment and moves from validation to public launch after a qualifying verdict;
- indefinite ideas and deferred learning backlog remain without a milestone.

Never create `Website`, `Creative`, `Backend`, or other component milestones. Represent components with hierarchy, workstream metadata, and views.

Milestones are repository-scoped. For multi-repository launches, create matching title/due-date milestones in each participating repository, read them back, and fail on drift. The Project provides the cross-repository roll-up.

## Projects

Create the fewest Projects that preserve one coherent delivery outcome.

Default to one `<PRODUCT> — MVP Launch` Project when the launch has at least six planned issues, multiple workstreams or repositories, or needs a shared launch dashboard. Skip Projects only for a genuinely tiny launch that fits one map plus at most four child issues in one repository; record that reason on the map.

Keep product code, marketing site, backend, creatives, release, and post-launch work in the same launch Project. Express components through hierarchy, metadata, and views. Split a component into another Project only after a durable ownership, access, cadence, backlog, or workflow boundary exists. Add a portfolio Project only for multiple independent products or teams; include top-level launch issues rather than duplicating every leaf item.

Use native fields first: Title, Assignees, Labels, Milestone, Issue type, Parent issue, Sub-issue progress, linked pull requests, and reviewers. Add one Project `Status` field:

`Backlog` → `Ready` → `In progress` → `In review` → `Done`, with `Blocked` as the interruption state.

Create `Active Frontier` when the Project is required. Add only views that answer a live planning question:

- add `Workstreams` for multiple active workstreams;
- add `Critical Path` when real blocking links exist;
- add `Owner Actions` when owner-action issues exist;
- add `Decisions` while decision or research issues are active;
- add `Launch Roadmap` only for real item dates or milestone markers;
- add `Post-launch` when stabilization or learning work exists.

Add each skill-created launch issue and pull request explicitly. Do not depend on auto-add for correctness. Read back Project membership, Status, fields, and views.

## Mutation and readback protocol

Treat tracker construction as a fail-closed transaction:

1. **Discover:** inspect permissions and live feature support. Inspect the installed `gh` help and current API schema instead of assuming flags or fields.
2. **Create:** create or reuse labels, milestones, the optional launch Project, and all canonical issues. Record stable URLs and numbers.
3. **Wire:** apply native type, labels, assignee, milestone, parent/sub-issue, blocked-by/blocking, Project membership, Project Status, dates, and pinning.
4. **Read back:** fetch each issue individually plus the milestone and Project. Compare actual values with the planned hierarchy and dependency graph.
5. **Publish:** update human-readable map sections and declare the tracker ready only after readback passes.

Prefer the connected GitHub integration when it supports the exact mutation and readback. Otherwise use current `gh` commands. Use current REST or GraphQL mutations for unsupported native operations. A successful issue-creation response does not prove that relationships, milestone assignment, or Project membership succeeded.

Use two passes when related issue numbers do not yet exist: create all nodes first, then attach every relationship. Make reruns idempotent by reusing canonical items and comparing before mutating.

## Lifecycle maintenance

Whenever scope or state changes:

- update native metadata before mirroring it in the issue body or map;
- remove obsolete blockers and verify newly unblocked work;
- move Project Status consistently with claim, pull-request, review, close, reopen, or block events;
- preserve milestone completion signal by moving de-scoped work to `not planned` or to an unmilestoned backlog;
- close the bounded launch Project after its delivery cycle instead of turning it into an indefinite backlog.

Run the complete native readback again after bootstrap, every phase-gate transition, bulk issue creation, dependency change, milestone transition, and Project repair.

## Failure behavior

If an applicable native operation is unsupported, unauthorized, or cannot be verified:

- do not replace it with body-only links or claim completion;
- leave affected work out of `ready-for-agent`;
- record the exact missing capability, attempted path, and required owner action;
- retry through the next supported integration path;
- stop the affected tracker transition until native readback succeeds.
