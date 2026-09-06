# omp-tweaks

Small, standalone extensions and skills for [Oh My Pi](https://github.com/can1357/oh-my-pi).

## Extensions

### User message timestamp

`extensions/user-message-timestamp.ts` adds this annotation to each timestamped user message in the context sent to the model:

```xml
<omp-message-metadata timestamp="2026-08-10T00:57:27.810Z"/>
```

The value is derived from the message's stored timestamp. The extension changes only the outgoing LLM context: the visible prompt and persisted session message remain unchanged. Images, non-user messages, and messages without a finite timestamp are preserved.

OMP discovers extensions when a process starts. Start a new OMP process after installing or updating this package; an already-running process keeps its startup snapshot.

## Skills

### Agent orchestration

[`skills/agent-orchestration/SKILL.md`](skills/agent-orchestration/SKILL.md) provides a self-contained OMP operating pattern for bounded work: an executive owns scope, one conductor owns delivery, focused workers handle independent slices, and reviewers remain advisory. It includes role setup, handoff templates, dependency-aware fan-out and isolation guidance, evidence requirements, and graceful versus immediate stop semantics.

## Install

Clone the repository, then configure its directory as an extension path:

```sh
git clone https://github.com/UberKitten/omp-tweaks.git ~/projects/omp-tweaks
```

Add the package directory to the `extensions` list in `~/.omp/agent/config.yml`:

```yaml
extensions:
  - ~/projects/omp-tweaks
```

OMP resolves the entries declared in `package.json` under `omp.extensions` and discovers the package's `skills/` directory. Each tweak remains a separate entry, so additional extensions or skills can be added without combining their implementations.

## License

[MIT](LICENSE)
