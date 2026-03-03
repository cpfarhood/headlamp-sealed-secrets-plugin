# Contributing to Headlamp Sealed Secrets Plugin

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 20 or later
- npm
- Access to a Kubernetes cluster with Headlamp and Sealed Secrets installed (for testing)
- Git

### Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/headlamp-sealed-secrets-plugin.git
   cd headlamp-sealed-secrets-plugin
   ```

2. **Install dependencies:**
   ```bash
   cd headlamp-sealed-secrets
   npm install
   ```

3. **Start development mode:**
   ```bash
   npm start
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Build the plugin:**
   ```bash
   npm run build
   ```

## Before Submitting

Before creating a pull request, run all checks locally:

```bash
npm run build        # Verify build succeeds
npm run lint         # Check for linting errors
npm run tsc          # Type-check TypeScript
npm test             # Run unit tests
npm run format:check # Check formatting
```

Also ensure:

- Tests are added or updated for any new or changed functionality
- Documentation (README.md, CLAUDE.md) is updated if you added features or changed behavior
- Your branch is up to date with `main`

## Coding Conventions

- **TypeScript strict mode** -- no `any`, use `unknown` with type guards at API boundaries
- **Functional React components only** -- no class components
- **Headlamp components** -- use `@kinvolk/headlamp-plugin/lib/CommonComponents`, not raw MUI
- **Named exports** -- prefer named exports over default exports
- **Conventional Commits** -- use `feat:`, `fix:`, `docs:`, `chore:`, etc. for commit messages
- **Import order** -- React, third-party libraries, Headlamp imports, local imports

## License

By contributing, you agree that your contributions will be licensed under the Apache-2.0 License.
