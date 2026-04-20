# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Structure

Poetry-based monorepo. Key areas:
- `openbb_platform/` — core SDK plus `extensions/`, `providers/`, `obbject_extensions/` (each subdir is its own Poetry package)
- `cli/` — terminal CLI (Poetry package)
- `desktop/` — Tauri + React/Vite/TypeScript app (npm)
- `cookiecutter/` — extension scaffolding template

Standard models live in `openbb_platform/core/openbb_core/provider/standard_models/`. Data fetchers follow the TET pattern (Transform query → Extract data → Transform result).

## Dev setup

```bash
python openbb_platform/dev_install.py -e          # editable install of all sub-packages via Poetry
python openbb_platform/dev_install.py -e --extras # include optional extras
python openbb_platform/dev_install.py -e --cli    # also install the CLI
```

## Auto-generated code — do not edit

`openbb_platform/openbb/package/` is **generated**. Only `__init__.py` may be committed (a pre-commit hook enforces this). After adding/changing extensions, providers, or routers, regenerate it:

```bash
python -c "import openbb; openbb.build()"
```

## Testing

```bash
pytest openbb_platform -m "not integration"   # unit tests
pytest openbb_platform -m integration         # integration tests (requires API server running)
pytest <file> --record=all                    # re-record VCR cassettes
```

Run the API server for integration tests with `openbb-api` or:
```bash
uvicorn openbb_platform.core.openbb_core.api.rest_api:app --host 0.0.0.0 --port 8000 --reload
```

## Lint / format

Configured via `.pre-commit-config.yaml` and `ruff.toml`: ruff (line-length 122, numpy-style docstrings, target py310), black, pylint, mypy, codespell, pydocstyle.

Ruff enforces the import alias `import openbb as obb`.

## Branching (CI-enforced)

- PRs into `develop` must come from `feature/*`, `bugfix/*`, `hotfix/*`, `docs/*`, or `release/*`.
- PRs into `main` only from `hotfix/*`, `docs/*`, or `release/*`.

## Desktop app

Separate npm project in `desktop/`: `npm run dev`, `npm run build`, `npm run test`, `npm run lint`.
