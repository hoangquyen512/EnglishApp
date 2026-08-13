# Vocab Pet — Demo UI/UX

Interactive Warm Companion mock (not the Tauri app). Open in a browser:

```bash
# from repo root
python3 -m http.server 8765
# then visit http://localhost:8765/docs/uiux-demo/
```

Or open `index.html` directly.

Screens via `?screen=`:

| Query | Surface |
| --- | --- |
| `onboarding` | Choose Cat / Fox / Dragon |
| `home` | Habitat + study mode + missions |
| `hungry` | Sad/hungry mood + notification |
| `popup` | Flashcard before submit |
| `correct` | “Đúng rồi!” |
| `incorrect` | “Chưa đúng” |

In the popup: keys `1`–`4` select, `Enter` submits / next card, `Esc` returns home.
