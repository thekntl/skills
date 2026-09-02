# Creative loop

Read before the first frame of a campaign and again whenever a brief's Results table gains a row.

## Five answers every brief carries

1. Who has the problem? (the niche's persona, in their own words)
2. What is the recognisable before state?
3. What after state can the product truthfully help create?
4. What proof makes it believable? (a scenario on screen, a number the product measured, a quote with a source)
5. What does the person do next? (one CTA, one destination)

A brief with an unanswered line stays a draft.

## The campaign chain

Objective → Persona → Before → After → Value → Proof → Hook → Format → Channel → Destination → CTA → Conversion → KPI

Every creative variant is a hypothesis: one link changed, the others held. The Results row records which link changed and what happened.

## Footage

Every UI frame is a scenario from `docs/design/SCENARIOS.md`, captured on the real runtime or the Design Lab demo with that scenario selected; the scenario slug is written beside the asset path in the brief's Production table. A claim on screen is a claim the product makes today.

## Production order

1. Prototype: a static contact sheet, carousel frames, or a video script with storyboard and shot list. The owner's verdict is taken here: call the Skill tool with `kntl-grilling`, `prototype-first`, the prototypes as the candidates.
2. Generate the approved assets with the `Creative tools` row of `docs/agents/kntl-stack.md`; when the row is absent, add it under Providers from what the machine offers (image generation, the Kickstart `video_*` tools, or the owner's named tool) the way the stack file's header says, then use it. Shot-level prompts for video; a one-prompt video is exploration only.
3. Platform variants: aspect ratio and safe areas per channel, captions, thumbnail, CTA text, the brief's tracking parameters.
4. Publish through the approved mode, read the Results row after the learning window, feed the learning into the next variant.

## Approval

- Organic: the owner approves the first representative posts of each message family; publishing then runs inside the routine's boundaries and stops at its escalation list.
- Paid: every new campaign, budget, material increase, optimisation-event change and market is the owner's written yes; a campaign is created paused with its budget on the ticket.

## Paid learning gate

- One channel first, the one the `Paid learning channel` row of `docs/agents/kntl-stack.md` names, on the accounts its `Ad accounts` row names, and one business-relevant optimisation conversion per campaign.
- Attribution verified end to end on `staging` before the first spend.
- The campaign stays unedited until 50 verified conversions on its optimisation event land inside a rolling seven-day window; the brief's Learning window overrides the seven days when the owner set one.
- Scale only when attribution quality, CPA or ROAS, data quality and creative diversity pass together.
- The second channel receives the validated hypothesis as a new test with its own gate.
