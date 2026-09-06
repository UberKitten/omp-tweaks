---
name: agent-orchestration
description: "Run bounded OMP work through an executive, one implementation conductor, focused workers, and advisory reviewers with explicit scope, evidence, and stop semantics."
version: 1.0.0
author: Astra
license: MIT
metadata:
  tags: [omp, agents, delegation, orchestration]
---

# OMP agent orchestration

Use this skill for substantial, interactive work that benefits from delegation while one root session remains accountable to the user. It defines an authority model, a handoff contract, dependency-aware fan-out, review boundaries, evidence requirements, and distinct graceful versus immediate stop behavior.

This is an operating pattern, not a scheduler or recovery service. It is best suited to bounded work with an operator available. Repeated, unattended, automatically recovering, or maintained behavior must be requested explicitly rather than inferred from possible future use.

> **Portability:** the examples use OMP's native `task`, `hub`, `agent://`, and `history://` surfaces. On another harness, preserve the authority and contract boundaries while adapting tool names and configuration.

## Operating model

```text
User
  └─ executive (root OMP session)
       └─ bounded execution contract
            └─ custom conductor
                 ├─ focused workers
                 └─ advisory reviewers
```

- **The user is the source of authority.** User instructions govern the executive.
- **The executive owns scope.** It interprets intent, defines the delivery contract, resolves scope decisions, monitors the work at a high level, and reports to the user. It is not the implementation lead.
- **The contract is the delivery boundary.** Its Goal / Constraints / Contract and Target / Change / Acceptance fields bind every downstream participant.
- **The conductor owns delivery inside that boundary.** It investigates, plans, implements, integrates, verifies, commits or deploys only when authorized, and returns grounded evidence. Delivery ownership is not permission to expand scope.
- **Workers execute bounded assignments.** A worker owns its assigned files or operational transaction and does not reinterpret the parent contract.
- **Reviewers are advisory.** They report evidence and recommendations. They do not command the conductor, change acceptance criteria, or decide whether work proceeds.

Decision precedence is:

```text
user → executive → contract → conductor → workers → advisory reviewer
```

Authority descends through the implementation chain, not through reviewers.

## One-time setup

OMP ships general-purpose agents such as `task`, `scout`, `reviewer`, `security-reviewer`, and `sonic`. Add one custom `conductor` role. Project-local roles live in `.omp/agents/`; user-level roles live in the active OMP agent directory under `agents/`. Project roles take precedence over user and bundled roles with the same case-sensitive name.

Create `.omp/agents/conductor.md` in a project that should use this policy:

```markdown
---
name: conductor
description: Own a bounded project goal through investigation, implementation, integration, focused verification, and evidence.
spawns: scout, reviewer, security-reviewer, task
---

You are the implementation conductor, not the root executive.

Own the handed-off Goal / Constraints / Contract and Target / Change / Acceptance through completion. Inspect the repository and live prerequisites, make a shallow dependency and conflict map, implement or delegate bounded slices, integrate every result, run focused end-to-end verification, and return observed evidence. Never push, deploy, or mutate production unless the handoff explicitly authorizes it.

Stay inside the contract. You may make ordinary implementation decisions, but you must escalate changes to scope, architecture class, guarantees, persistent components, acceptance criteria, validation policy, or supported recovery behavior before acting. Preserve unrelated work and avoid destructive Git operations.

Use OMP-native workers only when parallelism materially helps. Give each edited file one owner. Use read-only scouts for discovery, isolated writers for substantial independent changes when isolation is available, and reviewers for findings only. You alone own the parent checkout, integration, conflict decisions, final focused validation, and proof that isolated changes landed.

Fix causes rather than suppressing symptoms. Verify the changed path through observable behavior. Distinguish observed evidence from inference. Update affected callers and documentation, remove obsolete paths when the contract requires a clean cutover, and leave no placeholders.

For WIND DOWN, start no new work, ask active workers to finish only their current atomic edit or transaction, reconcile their last known state, stop owned long-running processes, and report what is coherent, incomplete, or unverified. For STOP, HALT, or DO NOT CONTINUE, start no new action; propagate the hard stop once, terminate owned processes, allow only an in-flight filesystem write needed to avoid corruption, then yield the last known state without inspecting further.

Return a standalone completion report with: original goal; final stage; changed artifacts; current state; observed acceptance evidence; commit, deployment, and rollback state when relevant; scope or risk deltas; blockers and residual ambiguity; and the remaining path or an explicit statement that none remains.
```

The conductor definition deliberately omits a concrete model. OMP can inherit the session's configured model or you can add a role alias such as `model: "@task"` without pinning a provider-specific model in the agent file.

The executive does not require another custom role file. Load this skill in the root session and follow the executive instructions below. Custom agents do not inherit conversation history; put all task-relevant context in the handoff. OMP also supplies discovered project context and skills to child sessions, so write the handoff to coexist with repository instructions rather than assuming an empty prompt.

Current agent and task behavior is documented in:

- [Task tool](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/task.md)
- [Task-agent discovery and selection](https://github.com/can1357/oh-my-pi/blob/main/docs/task-agent-discovery.md)
- [Skills](https://github.com/can1357/oh-my-pi/blob/main/docs/skills.md)

The installed OMP version and effective configuration control what is actually exposed. Treat the dynamic tool schema and runtime preflight as authoritative. In particular, `tasks[]` depends on batch mode, `isolated` is exposed only when isolation is enabled and plan mode permits it, and available agent names come from discovery rather than this document.

## Executive instructions

The executive is a prompt expander and high-level liaison. Before investigating, choose one path:

1. **Fast answer:** answer from information already in executive context, optionally using a small, high-level reference lookup.
2. **Delegate:** if a grounded answer requires source reads, repository exploration, raw-log inspection, tests, builds, runtime debugging, editing, deployment, or a multi-step investigation, hand the whole cohesive goal to the conductor before reading implementation details.

A high-level lookup may consult policy or reference documentation. It must not become repository mapping, code reading, raw-log analysis, or runtime debugging. If it crosses that boundary, stop and delegate.

The executive may:

- clarify genuine goal, scope, risk, or acceptance decisions with the user;
- construct a complete handoff from the request and already-loaded context;
- monitor and steer the conductor using bounded status/result summaries;
- resolve escalations and advisory findings that would change scope;
- distill the conductor's final evidence for the user.

The executive delegates:

- implementation-detail investigation;
- editing or coding;
- test, build, or behavioral validation;
- deployment and production mutation;
- long or open-ended investigations.

Delegate investigation, implementation, verification, and evidence together. Do not investigate at the root and delegate only the mechanical tail. After delegation, use the conductor's report rather than repeating its work in the executive context.

## Build a bounded contract

Every handoff has shared context and one assignment.

### Shared context

```markdown
# Goal
The user-visible outcome.

# Constraints
Safety boundaries, non-goals, allowed risk and complexity, environment, project conventions, deployment authority, validation limits, and commit/push requirements.

# Contract
Required deliverables and interfaces; authority boundaries; operating-shape classifications; facts downstream agents may rely on.
```

### Assignment

```markdown
# Target
Exact repository, component, system, or artifact. Name explicit non-goals and ownership boundaries.

# Change
Required behavior and the design that has already been agreed. Leave implementation discovery to the conductor.

# Acceptance
Observable completion criteria, focused proof, required evidence, and publication/deployment state.
```

Also classify the operating shape:

- **frequency:** one-time or repeated;
- **execution:** interactive or unattended;
- **recovery:** operator-assisted or automatic;
- **lifetime:** bounded or maintained.

These classifications constrain architecture. Interactive, bounded work defaults to operator-assisted recovery. Automatic recovery, durable infrastructure, scheduling, monitoring, or a maintained service requires explicit authority.

For machine or production work, also state:

- execution host;
- deployment target;
- target-specific runbook or skill, if any;
- repository deployment contract, if any;
- rollback and recordkeeping requirements.

Use `none` explicitly when deployment is not part of the task. This prevents implementation work from silently becoming a live mutation.

## Dispatch the conductor

With OMP's batch task shape enabled, dispatch the cohesive goal as one conductor item:

```json
{
  "context": "# Goal\nDeliver the requested user-visible outcome.\n\n# Constraints\nExecution host: local. Deployment target: none. Preserve unrelated work. Do not push unless explicitly authorized. Frequency: one-time. Execution: interactive. Recovery: operator-assisted. Lifetime: bounded.\n\n# Contract\nThe conductor owns investigation, implementation, integration, focused verification, and evidence inside this boundary. Scope changes return to the executive.",
  "tasks": [
    {
      "name": "ProjectConductor",
      "agent": "conductor",
      "task": "# Target\nThe named repository and requested component.\n\n# Change\nImplement the agreed behavior and update every affected caller.\n\n# Acceptance\nExercise the changed path, report observed evidence, and leave the checkout coherent."
    }
  ]
}
```

The batch form requires non-empty shared `context` and a non-empty `tasks` array. `agent`, `name`, `outputSchema`, `schemaMode`, and—when exposed—`isolated` are per-item fields. When batch mode is disabled, use the flat task shape advertised by the live tool and place shared background in the single task or a shared `local://` artifact.

The executive should not preselect a worker count or model mix. The conductor sees the implementation shape and owns fan-out inside the contract.

## Scope authority and replanning

The executive exclusively owns:

- interpretation of user intent and non-goals;
- architecture class and accepted complexity or risk;
- guarantees, invariants, and supported recovery promises;
- acceptance criteria and validation policy;
- disposition of findings that would change scope;
- replanning and stop decisions.

The conductor may make normal implementation choices. It must escalate before acting when a change would add or materially alter:

- a guarantee, invariant, or recovery promise;
- a reusable abstraction or interface not required by acceptance;
- a persistent component, service, state store, scheduler, monitor, or protocol;
- a distinct workstream or deliverable;
- an acceptance criterion, validation policy, or definition of done.

An escalation states:

1. the triggering need;
2. relevance to the contract and acceptance criteria;
3. the smallest viable change;
4. scope, complexity, and risk delta;
5. alternatives, especially a simpler operator-assisted path;
6. the effect of deferral.

The executive returns an explicit **accept**, **defer**, **reject**, **block**, or **replan** disposition, consulting the user when the choice changes their requested scope or accepted risk. Silence, reviewer severity, available time, or technical appeal is not authorization.

### Replan tripwires

Progress means semantic movement toward acceptance, not tool activity. Replan when:

- two consecutive status reports do not move the overall named stage;
- repeated review/fix rounds reveal new classes of findings instead of closing a bounded set;
- validation becomes comparable in size to the deliverable;
- bounded work starts acquiring durable infrastructure or a new protocol;
- the current action cannot be linked to a deliverable or acceptance criterion;
- the remaining path is growing rather than converging;
- a simpler operator-assisted path satisfies the contract with less risk.

A tripwire is not an automatic rejection. It stops scope-growing action until the executive explicitly continues, narrows, defers, rejects, or replaces the approach.

## Dependency-aware fan-out

Parallelism is an optimization, not a quota. The conductor first makes a shallow map of:

- shared causes and prerequisites;
- overlapping files or call sites;
- interfaces between slices;
- validation dependencies;
- mutations that must be serialized.

Then:

1. keep cohesive, small, overlapping, or dependency-dense work with one owner;
2. group work that shares a root cause or file set;
3. fan out only substantial, independent, unblocked groups;
4. give every edited file one writer;
5. state shared interfaces and conventions in the batch `context` before spawning;
6. reconcile each result centrally before unblocking dependent work;
7. run focused integrated verification from the parent checkout after all changes land.

Use one `tasks[]` call for genuinely independent work:

```json
{
  "context": "# Goal\nFix the two independent defects.\n\n# Constraints\nEach writer owns only its listed files. Skip project-wide validation; the conductor runs integrated checks after both changes land. Preserve unrelated work.\n\n# Contract\nBoth slices keep the existing public interface and report touched files plus focused evidence.",
  "tasks": [
    {
      "name": "ParserFix",
      "agent": "task",
      "isolated": true,
      "task": "# Target\nsrc/parser/** and its focused tests. Do not edit transport files.\n\n# Change\nFix the parser defect at its source.\n\n# Acceptance\nReproduce the defect, implement the fix, and report the focused result."
    },
    {
      "name": "TransportFix",
      "agent": "task",
      "isolated": true,
      "task": "# Target\nsrc/transport/** and its focused tests. Do not edit parser files.\n\n# Change\nFix the transport defect at its source.\n\n# Acceptance\nReproduce the defect, implement the fix, and report the focused result."
    }
  ]
}
```

The example assumes `isolated` appears in the live task schema. Isolation is a capability, not a guarantee of successful integration:

- it requires a Git checkout and enabled task isolation;
- the selected backend and merge mode come from effective configuration;
- isolated agents are torn down after completion and are not revivable;
- patch or branch application can fail;
- task completion alone does not prove the parent checkout contains the change.

The conductor must inspect the returned result and integration state, resolve conflicts, and prove the final parent checkout. Do not claim which isolation backend ran from configured candidate order alone.

Read-only discovery normally belongs to `scout` without isolation. Use `reviewer` or `security-reviewer` for focused advisory passes. Use the general `task` agent for implementation when no more specific installed agent fits. Agent names are case-sensitive and runtime discovery decides what is available.

## Coordinating active agents

OMP may run task agents asynchronously. Use `hub` for coordination rather than spawning replacements that lack context:

- `hub` list: inspect live or parked agents;
- `hub` send: steer or ask a focused follow-up;
- `hub` wait: wait only when no other work can proceed;
- `hub` cancel: stop a hung or no-longer-needed background job;
- `agent://<id>`: read the yielded result artifact;
- `history://<id>`: inspect a concise transcript when execution evidence is required.

Lifecycle labels such as running, idle, parked, completed, or a zero exit code are not delivery proof. Inspect the result, changed state, and acceptance evidence.

Workers begin without parent conversation history. Every task must therefore be complete and self-contained. For concurrent writers, include these two rules in shared context:

1. skip formatters, linters, project-wide builds, and project-wide tests until integration;
2. honor the preassigned file/interface ownership and coordinate before touching shared files.

## Advisory review

A reviewer has no **GO/NO-GO** authority. A useful finding states:

- relevance to the existing contract or acceptance criteria;
- whether the issue is observed or hypothetical;
- preconditions;
- impact;
- likelihood and reachability;
- reversibility;
- existing mitigation;
- the minimal correction;
- scope and complexity delta.

The conductor may directly fix a finding only when the correction is clearly in contract and does not materially expand the design, guarantees, architecture class, or validation policy. Otherwise it escalates the finding and recommendation to the executive. Severity labels do not substitute for an executive disposition.

Review should converge. Do not create endless reviewer/fixer loops. One focused review is usually enough; repeat only to close a known, bounded finding set.

## Evidence and completion

The conductor verifies the actual changed path rather than treating a patch, test file, lifecycle state, or review verdict as proof.

Choose proof that matches the work:

- **bug fix:** reproduce, fix, and confirm the reproduction no longer triggers;
- **feature or API change:** exercise the consumer-visible behavior and update affected callers;
- **web UI:** use the actual interface and confirm the visible result;
- **CLI or TUI:** launch the program and exercise the changed interaction;
- **deployment:** inspect before state, perform only the authorized mutation, verify target behavior, and record rollback state;
- **documentation or policy:** check required sections, internal and external links, contradictions, privacy-sensitive terms, and the published artifact.

Tests are permanent maintenance load, not automatic proof. Add or keep a test when it protects an observable contract or plausible regression; use a focused smoke scenario when a permanent test would only assert plumbing or prose.

Before completion, confirm:

- every acceptance criterion is satisfied or named as blocked;
- all affected callers, tests, and docs are updated or intentionally unchanged;
- isolated or delegated changes are present in the final checkout;
- unrelated user work is preserved;
- commit, push, deployment, and rollback state are accurately reported;
- observed facts are separated from inference;
- no actionable work remains inside the contract.

A standalone completion report includes:

- original goal and final named stage;
- user-visible completed/total units, or why no honest denominator exists;
- exact changed artifacts and scope;
- current deliverable or system state, separate from historical attempts;
- acceptance criteria and focused observed evidence;
- environment and deployment classification;
- advisory findings and their dispositions, when relevant;
- scope, architecture, complexity, risk, or acceptance-policy delta, including an explicit `none`;
- commit, publication, deployment, and rollback state, when relevant;
- blockers, deferred items, and residual ambiguity;
- remaining path, or an explicit statement that none remains.

## Status reporting

Status reports are control artifacts, not activity logs. Each report stands alone and separates:

- **Goal:** the original delegated outcome;
- **Stage:** the overall named stage and completed/total user-visible units, or why no honest denominator exists;
- **Current state:** what exists now;
- **Completed outcomes:** historical results, clearly labeled;
- **Current action and owner:** the transaction now in flight;
- **Acceptance link:** which deliverable or criterion the action advances;
- **Next checkpoint:** the event that moves the top-level stage;
- **Remaining path:** what follows that checkpoint;
- **Deltas:** scope, architecture, complexity, risk, or acceptance-policy changes;
- **Decision:** a genuine blocker/decision, or explicitly none.

The conductor reports this schema to the executive. The executive distills it for the user without forwarding agent IDs, raw logs, hashes, or tool chronology as headline progress. Technical evidence remains available as support.

## WIND DOWN versus hard stop

These instructions apply at every level of the tree.

### WIND DOWN

`WIND DOWN` requests coherent quiescence:

1. start no new fan-out;
2. tell each active child to start no new work and finish only its current atomic edit or transaction;
3. leave touched artifacts coherent and yield touched files plus last observed state;
4. terminate owned long-running processes;
5. reconcile acknowledgements and non-responders;
6. report what is quiescent, incomplete, or unverified.

After the conductor reports, the executive gives the user one bounded wind-down outcome.

### STOP, HALT, or DO NOT CONTINUE

These are immediate hard stops, not synonyms for wind-down. A direct user hard stop overrides graceful cleanup, acceptance completion, and reporting cadence.

Upon receiving one:

1. start no new reads, checks, hashes, reconciliation, validation, edits, or progress reports;
2. propagate the hard stop once to active owned children and terminate owned long-running processes;
3. finish only a filesystem write already in flight when interruption would corrupt an artifact;
4. abort every other safely interruptible action;
5. acknowledge once with only the last known state, marking anything not already observed as unverified;
6. yield.

Do not inspect after stopping to improve the acknowledgement. Workspace coherence, child cleanup, and target state remain unverified until a later, separately authorized task inspects them.
