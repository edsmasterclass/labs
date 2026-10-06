# Schedule block

The schedule block represents one conference day. Add one row per session and
keep rows in the order they should appear. Each row has four cells:

1. **Time:** Required. Use a readable time or time range, such as
   `9:00 AM – 9:30 AM`.
2. **Session title:** Required. Use a level-two heading.
3. **Speakers:** Optional. Use one paragraph per speaker. Leave the cell empty
   when no speaker is listed.
4. **Room or track:** Optional. Use a short text label such as
   `Room: Main auditorium` or `Track: Community`.

Do not add a header row. Empty speaker or room/track cells are supported.
Rows without a time or title are skipped. If no complete sessions remain, the
block displays an empty-state message. Multiple days, parallel sessions, and
track filtering are not supported.

## Display behavior

- Sessions remain in authored order; the block does not infer dates or reorder
  time labels.
- On narrow screens, each session's time appears above its details. From
  768px, time and session details appear side by side.
- Long text wraps instead of causing horizontal scrolling.
- Incomplete rows are skipped and reported in the browser console.
