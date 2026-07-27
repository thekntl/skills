Use the canonical GitHub issue as the complete product specification for this unit.

Load only:

- the claimed issue;
- linked confirmed decisions and research;
- repository instructions;
- references required by the affected code.

Implement only the acceptance criteria. Preserve user work. The runner already placed you in an isolated branch/worktree. Do not run `git` or `gh`; do not stage, commit, push, create a pull request, assign or label an issue, or mutate GitHub. The runner owns those operations after your process exits.

Stop and report evidence when:

- a product decision is missing;
- a secret, paid action, legal assent, MFA, campaign activation, budget, or irreversible ownership action is required;
- any Docker, Compose, context, Docker API, Swarm, container runtime, or Docker-backed management operation would be executed;
- work overlaps unsafe user changes;
- the bounded retry policy is exhausted.

You may prepare Dockerfiles, manifests, and owner instructions. The owner executes every Docker runtime action.

Never execute a repository wrapper, package script, build, test, generator, Make/Task/Just target, shell command string, or other indirect command. The runner alone executes the declared static-safe checks after your process exits. Implement tests and verification artifacts when required, but record every unexecuted owner check truthfully in the result contract.

The runner states the verified execution mode in the issue prompt:

- `interactive`: after a substantial implementation or PR, update evidence and prepare the exact manual Ask Matt closeout; wait for the returned result before the next interactive operation.
- `autonomous`: never invoke Ask Matt and never stop merely to wait for it. Update the issue and PR, then let the runner continue with independent eligible work. The final morning report carries one Ask Matt reminder and exact prompt for the returning owner.

Real blockers, unresolved owner decisions, prohibited actions, and unsafe conditions still stop or skip the affected work in both modes.
