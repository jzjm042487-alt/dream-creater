# Player Character Animation Assets

## Runtime Sheet

`player_run_sheet_8f.png` is the UI prototype runtime sheet.

- Canvas: `1024 x 1536`
- Grid: `4 x 6`
- Cell: `256 x 256`
- Rows `0..1`: facing down, eight frames
- Rows `2..3`: horizontal movement, eight frames
- Rows `4..5`: facing up, eight frames
- Facing left mirrors the horizontal frames in CSS

## References

`player_run_sheet.png` is the earlier `4 x 3` directional reference and is not
loaded by the current UI prototype. Original generated files stay under
`sources/` so future cleanup or re-export does not overwrite runtime assets.
