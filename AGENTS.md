# School Year Card agent instructions

## Scope

This repository contains the frontend-only Home Assistant Lovelace card for the School Year
integration. Source retrieval, parsing, date correctness, and normalized event ownership remain
in `ha-school-year`.

## Architecture

- Do not depend on Bubble Card or Mushroom; visual compatibility is a design goal only.
- Use the School Year status sensor's normalized `events` attribute as the card contract.
- Prefer bundled, stable dependencies over importing Home Assistant frontend internals.
- Use Home Assistant's standard `ha-form` selectors for the visual editor.
- Use official Material Design Icons and Home Assistant theme variables where practical.
- Treat entity attributes as untrusted input and validate before rendering.

## Workflow

1. Inspect both card and integration contracts before changing cross-repository behavior.
2. Work on a branch and open a pull request after initial repository bootstrap.
3. Run `yarn validate` and `git diff --check` before every push.
4. Add tests only when they protect behavior, compatibility, security, or a meaningful regression.
5. Validate UI changes in a live Home Assistant frontend at desktop and mobile widths.
6. Before any final merge to `main`, request a manual test-environment check unless the user has
   explicitly waived it for that change.

## Security and releases

- Never commit credentials, private URLs, entity IDs from real households, or acceptance output.
- Keep GitHub Actions pinned to immutable commits and use Dependabot for maintenance.
- Release only validated, stable bundles; attach the built JavaScript bundle to the release.
