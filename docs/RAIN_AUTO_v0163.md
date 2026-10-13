# v0.16.3-review - conditional exact rainfall and period-specific auto-selection

- Exact rainfall appears directly below the checkbox only while checked.
- Auto-selection uses positive or trace rainfall for the current period: intermediate Section 3 6RRR7; main 06/12/18 UTC Section 1 6RRR1; 00 UTC Section 5 2RRRR covering 18-24 UTC. Zero, missing, wrong-duration and 24-hour-only groups do not auto-select.
- Manual overrides remain possible and are preserved during edits while the matching rainfall groups stay unchanged. A new observation re-evaluates the matching code.
- T or Trace, case insensitive, are accepted as trace.
- Three-hour values remain separate from six-hour totals. Saved review stays in the popup. Existing pressure, cloud, visibility, structure and history rules are retained.
