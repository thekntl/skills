export const LOOP_CONTRACT_ARRAY_FIELDS = Object.freeze([
  "blocked_by",
  "unresolved_decisions",
  "approved_cross_phase_dependencies",
  "owner_only_actions",
]);

export const LOOP_CONTRACT_FLAG_FIELDS = Object.freeze([
  "requires_secret",
  "requires_spend",
  "requires_docker_runtime",
  "requires_deployment_or_runtime",
]);

export const LOOP_CONTRACT_KEYS = Object.freeze([
  "schema_version",
  "phase",
  ...LOOP_CONTRACT_ARRAY_FIELDS,
  ...LOOP_CONTRACT_FLAG_FIELDS,
  "validation_route",
  "validation_verdict",
  "public_product_clock_started_at",
  "launch_gate_evidence_url",
  "claimed_by",
]);

export function emptyLoopContract(phase = "{{PHASE_LABEL}}") {
  return {
    schema_version: 1,
    phase,
    blocked_by: [],
    unresolved_decisions: [],
    approved_cross_phase_dependencies: [],
    owner_only_actions: [],
    requires_secret: false,
    requires_spend: false,
    requires_docker_runtime: false,
    requires_deployment_or_runtime: false,
    validation_route: "{{VALIDATION_ROUTE}}",
    validation_verdict: null,
    public_product_clock_started_at: null,
    launch_gate_evidence_url: null,
    claimed_by: null,
  };
}
