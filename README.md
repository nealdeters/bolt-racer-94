# Bolt Racer #94

A kid-friendly 3D racing game for about age 5. Drive **Red Bolt / Bolt Racer #94** — a low, wide red GT40-style endurance racer with white racing stripes, a wrap windshield, and door roundel **#94** — in a 1v1 race against friendly blue **#7**.

This project is an original homage look only. It is **not affiliated with, endorsed by, or associated with Disney or Pixar**. There are no Disney/Pixar names, logos, or official assets.

## Play

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

Production build:

```bash
npm install
npm run build
npm run preview
```

## How to play

1. Tap a track on the menu (5 tracks).
2. Wait for **3-2-1-GO**.
3. Race **exactly 5 laps**.
4. See 1st / 2nd on the results screen, then race again or pick another track.

The camera follows behind your car. Walls are soft. The rival AI is beatable and eases up if it gets too far ahead.

### Tracks

| Track | Vibe |
| --- | --- |
| Sunny Oval | Wide easy loops |
| Twisty Park | Winding trees |
| Desert Dash | Sweeping sand turns |
| Seaside Spin | Beach and water |
| City Loop | Night blocks + a chicane |

## Controls

All devices share one input layer (keyboard + gamepad + touch are merged).

### Keyboard

- **Steer:** Left / Right arrows or **A** / **D**
- **Go:** Up arrow, **W**, or Space
- **Stop:** Down arrow or **S**

### Gamepad (Gamepad API)

- Left stick or D-pad to steer
- Right trigger, A / south face button, or D-pad up to go
- Left trigger, B / east face, or D-pad down to slow down

### Phone / iPad

- Big **◀ ▶** steer buttons (bottom left)
- Big green **GO** pedal and **STOP** (bottom right)
- Portrait-friendly layout
- Page scroll, pinch-zoom, and arrow-key scrolling are blocked so they do not fight the game

## Stack

Vite + React + TypeScript + React Three Fiber + drei + three.js
