# omp-tweaks

Small, standalone extensions for [Oh My Pi](https://github.com/can1357/oh-my-pi).

## Extensions

### User message timestamp

`extensions/user-message-timestamp.ts` adds this annotation to each timestamped user message in the context sent to the model:

```xml
<omp-message-metadata timestamp="2026-08-10T00:57:27.810Z"/>
```

The value is derived from the message's stored timestamp. The extension changes only the outgoing LLM context: the visible prompt and persisted session message remain unchanged. Images, non-user messages, and messages without a finite timestamp are preserved.

OMP discovers extensions when a process starts. Start a new OMP process after installing or updating this package; an already-running process keeps its startup snapshot.

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

OMP resolves the entries declared in `package.json` under `omp.extensions`. Each tweak is a separate entry, so additional extensions can be added without combining their implementations.

## License

[MIT](LICENSE)
