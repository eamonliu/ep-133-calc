<p align="center">
  <img src="./public/favicon.svg" alt="EP-133 Calc icon" width="72" height="72" />
</p>

# EP-133 Calc

A tactile web calculator inspired by the industrial hardware language of the Teenage Engineering EP-133 K.O. II. The project combines a working basic calculator with a skeuomorphic device-style interface: recessed key slots, physical keycaps, an LCD-style display, mode buttons, indicator LEDs, and a DSEG 7-segment readout.

![EP-133 Calc interface](https://github.com/user-attachments/assets/d6f896a0-805b-43a7-a0ad-fb18d55deee9)

## Features

- Basic calculator operations: addition, subtraction, multiplication, division, percent, sign toggle, decimal input, delete, and clear.
- Hardware-inspired interface with EP-133-style panel sections, speaker grille, knobs, key slots, and tactile button shadows.
- LCD readout using the DSEG 7SEG font family.
- Keyboard support for digits, operators, decimal point, Enter, Backspace, Escape, and percent.
- 
- Tailwind CSS v4 token-based styling with CSS variables for colors, radii, shadows, fonts, and surfaces.
- shadcn/ui-style `Button` component built on Radix Slot, CVA, `clsx`, and `tailwind-merge`.

## Getting Started

### Prerequisites

- Node.js 22 or newer is recommended.
- npm 11 or newer is recommended.

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Vite starts the app on `127.0.0.1`. If the default port is already in use, Vite will choose the next available port.

### Build

```bash
npm run build
```

This runs TypeScript type checking with `tsc --noEmit` and then creates a production build with Vite.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```text
.
├── public/
│   └── favicon.svg
├── src/
│   ├── components/ui/button.tsx
│   ├── lib/utils.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── components.json
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Design Notes

The UI is designed as a compact hardware object rather than a flat web form. Key visual details include:

- A gray plastic chassis with subtle noise texture.
- A black LCD panel with orange DSEG 7-segment numbers.
- Recessed black key slots and raised keycaps.
- Separate visual treatments for light, dark, and orange keys.
- Operator LEDs that sit beside the lower key labels and light up when an operator is active.
- Small rectangular mode keys that update the LCD status badge.

> [!NOTE]
> The calculator intentionally keeps the math feature set basic. The `SCI`, `CONV`, and `MATH` controls currently act as visual display modes, not full scientific or conversion modes.

## Keyboard Shortcuts

| Key                | Action            |
| ------------------ | ----------------- |
| `0-9`              | Enter digits      |
| `+`, `-`, `*`, `/` | Choose operator   |
| `.`                | Decimal point     |
| `%`                | Percent           |
| `Enter`, `=`       | Calculate result  |
| `Backspace`        | Delete last digit |
| `Escape`, `Delete` | Clear calculator  |

## Customization

Most visual tokens live in `src/index.css`:

- Color variables such as `--primary`, `--secondary`, `--muted`, and `--lcd-foreground`.
- Shape variables such as `--radius-control` and `--radius-shell`.
- Shadow variables for keycaps, display, shell, and knobs.
- DSEG LCD font configuration via `@font-face` and `--font-lcd`.

The calculator behavior and key layout are defined in `src/App.tsx`, especially the `keys` array and calculator state handlers.

## License

This project is licensed under the MIT License. Feel free to copy, modify, and integrate these premium animations and offscreen recorders into your own web applications!
