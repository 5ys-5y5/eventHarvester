<!--
SYNC IMPACT REPORT
==================
Version Change: [INITIAL] → 1.0.0
Modified Principles: N/A (initial creation)
Added Sections:
  - All core principles (I-VII)
  - Development Workflow section
  - Governance section
Removed Sections: N/A
Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section exists and will align with principles
  ✅ spec-template.md - Requirements structure supports constitution constraints
  ✅ tasks-template.md - Task categorization supports all principle-driven task types
Follow-up TODOs: None
-->

# eventHarvester Constitution

## Core Principles

### I. Library-First

Every feature MUST start as a standalone library with the following requirements:

- Libraries MUST be self-contained and independently testable
- Each library MUST have a clear, singular purpose
- Libraries MUST NOT exist solely for organizational purposes (no "utils" or "helpers" without specific value)
- All libraries MUST include comprehensive documentation of their API and usage
- Libraries MUST be independently versionable

**Rationale**: Library-first architecture enforces modularity, promotes reusability, enables independent testing, and creates clear boundaries between components. This reduces coupling and improves long-term maintainability.

### II. Multi-Interface Design

Every library MUST expose functionality through multiple interfaces:

- **CLI Interface**: Command-line interface using text I/O protocol (stdin/args → stdout, errors → stderr)
- **Programmatic Interface**: Well-documented API for embedding in other applications
- All interfaces MUST support both JSON and human-readable output formats where applicable
- Error messages MUST be clear and actionable across all interfaces
- Interface documentation MUST include concrete usage examples

**Rationale**: Multi-interface design maximizes accessibility and reusability. CLI enables scripting, automation, and debugging. Programmatic APIs enable integration. Supporting both ensures libraries serve diverse use cases without compromising either.

### III. Test-First Development (NON-NEGOTIABLE)

Test-Driven Development (TDD) is MANDATORY for all feature work:

- Tests MUST be written before implementation begins
- Tests MUST fail initially (Red phase)
- Implementation proceeds only after tests are written and verified to fail
- Code is written to make tests pass (Green phase)
- Refactoring follows only after tests pass (Refactor phase)
- The Red-Green-Refactor cycle MUST be strictly followed
- No exceptions without explicit constitution amendment

**Rationale**: TDD ensures testable design, provides executable specifications, catches regressions early, and serves as living documentation. The strict enforcement prevents technical debt and ensures consistent quality.

### IV. Integration Testing

Integration tests MUST be written for all cross-component interactions:

- **Contract Tests**: Required when creating new library contracts or modifying existing ones
- **Inter-Service Communication**: Required for all service-to-service interactions
- **Shared Schemas**: Required when multiple components depend on shared data structures
- **External Dependencies**: Required for integrations with databases, APIs, or external services
- Integration tests MUST verify behavior at component boundaries, not internal implementation

**Rationale**: Unit tests alone cannot catch integration issues. Contract tests ensure components fulfill their promises to consumers. Integration tests validate the system works as a whole, catching issues that emerge only when components interact.

### V. Observability

All libraries and services MUST be observable and debuggable:

- **Structured Logging**: All components MUST use structured logging (JSON or key-value format)
- **Text I/O Debuggability**: CLI interfaces ensure visibility into all operations through text streams
- **Error Context**: All errors MUST include sufficient context for diagnosis (timestamps, correlation IDs, relevant state)
- **Metrics**: Services MUST expose key performance and health metrics
- **Tracing**: Cross-service operations MUST support distributed tracing when applicable
- Sensitive data MUST NOT appear in logs or debug output

**Rationale**: Software fails. When it does, observability determines whether diagnosis takes minutes or days. Structured logging and text I/O provide powerful debugging capabilities without specialized tools.

### VI. Versioning & Breaking Changes

All libraries and services MUST follow strict versioning practices:

- **Semantic Versioning**: Use MAJOR.MINOR.PATCH format
  - MAJOR: Incompatible API changes, breaking behavior changes
  - MINOR: New functionality added in backward-compatible manner
  - PATCH: Backward-compatible bug fixes
- **Breaking Changes**: MUST be documented in CHANGELOG with migration guidance
- **Deprecation Policy**: Features MUST be deprecated for at least one MINOR version before removal
- **Changelog**: MUST be maintained with each release, following Keep a Changelog format
- **Version Compatibility Matrix**: MUST document compatible version ranges for all dependencies

**Rationale**: Explicit versioning enables consumers to upgrade safely and understand impact. Semantic versioning provides a clear contract. Deprecation periods allow graceful migration. Breaking changes without notice destroy trust and waste engineering time.

### VII. Simplicity & YAGNI (You Aren't Gonna Need It)

Simplicity MUST be the default; complexity MUST be justified:

- **Start Simple**: Choose the simplest solution that solves the current problem
- **No Premature Abstraction**: Create abstractions only when patterns emerge from 3+ concrete uses
- **No Speculative Features**: Implement only what is needed now, not what might be needed later
- **Complexity Justification**: Any deviation from simple, direct implementation MUST be documented with:
  - The specific problem being solved
  - Why simpler alternatives were insufficient
  - The measurable benefit gained
- **Regular Complexity Audits**: Review existing abstractions quarterly to remove unused complexity

**Rationale**: Complexity is expensive - it slows development, introduces bugs, and requires maintenance. YAGNI prevents over-engineering. Most predicted future needs never materialize. Simple code is easier to understand, test, and modify.

### VIII. Security-First Design

Security MUST be considered at every stage of development:

- **Secure Defaults**: All libraries and services MUST use secure defaults (least privilege, fail closed, etc.)
- **Input Validation**: ALL external input MUST be validated and sanitized
- **Threat Modeling**: New features and libraries MUST undergo lightweight threat modeling
- **Sensitive Data Handling**: Secrets, credentials, and PII MUST never be logged, committed, or exposed
- **Dependency Security**: All dependencies MUST be regularly scanned for vulnerabilities
- **Security Testing**: Security-critical code paths MUST include security-focused tests (injection, auth bypass, etc.)

**Rationale**: Security breaches are catastrophic. Building security in from the start is exponentially cheaper than retrofitting. Secure defaults prevent common mistakes. Threat modeling catches issues before they become vulnerabilities.

## Development Workflow

### Code Review & Quality Gates

- All code MUST be reviewed before merging (minimum 1 reviewer)
- All tests MUST pass (unit, integration, contract)
- Code coverage MUST NOT decrease
- Linting and formatting checks MUST pass
- Security scans MUST pass with no critical/high findings

### Compliance Verification

All pull requests and code reviews MUST verify compliance with this constitution:

- Reviewers MUST check for Test-First compliance (tests written before implementation)
- Reviewers MUST verify library-first principle adherence
- Reviewers MUST check for proper versioning and changelog updates
- Reviewers MUST verify observability (logging, error handling)
- Reviewers MUST challenge unjustified complexity

## Governance

### Amendment Process

This constitution supersedes all other development practices and guidelines. Amendments require:

1. **Documentation**: Proposed amendment with full rationale and impact analysis
2. **Review**: Review by project maintainers/technical leads
3. **Approval**: Consensus or majority vote (depending on project governance structure)
4. **Migration Plan**: If amendment affects existing code, migration plan MUST be documented
5. **Version Bump**: Constitution version MUST be incremented per semantic versioning rules

### Complexity Justification Process

When code review identifies potential constitution violations (e.g., unjustified complexity, missing tests, breaking changes without versioning), the following process applies:

1. Reviewer raises the concern with specific constitutional principle cited
2. Author provides written justification or remediation
3. If justification accepted, it MUST be documented in code comments or architecture docs
4. If justification rejected, code MUST be modified to comply
5. Repeated violations trigger architecture review

### Version & Amendment History

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2025-11-12

### Future Amendments

Future amendments to this constitution will be tracked here with version history, date, and summary of changes.
