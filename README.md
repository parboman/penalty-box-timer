# Penalty Box Timer

A standalone, offline-capable web app for managing penalty box timing during roller derby scrimmages. Optimized for tablets.

## Features

- **30-second penalties** with synced countdown
- **Two teams** side-by-side with Jammer + 3 Blocker seats each
- **Full WFTDA jammer rules** (7.3.x):
  - Simultaneous sit: both jammers get 5 seconds
  - Jammer swap: new jammer serves time other already sat, other released
  - ABA scenario: returning jammer serves full time, no release
- **Blocker seat logic**: max 2 in box, seat 3 enables when one is about to leave
- **Visual warnings**: yellow at 10s (stand), red at 3s (release)
- **Works offline**: just open the HTML file in a browser

## Usage

1. Open `index.html` in any modern browser
2. Tap **Start Jam** to begin the period/jam clocks
3. Tap a seat to start a 30-second penalty
4. Tap a running timer to pause, adjust time, or cancel

## Credits

**Developed by:** [Derbyshop.se](https://derbyshop.se)

**Penalty box logic based on:** [CRG ScoreBoard](https://github.com/rollerderby/scoreboard)
Original penalty timing code by Rob Thomas (The G33k) and Mr Temper.

## License

This project is dual-licensed under either:

- **GNU General Public License v3.0** (or later) - see [LICENSE-GPL](LICENSE-GPL)
- **Apache License 2.0** - see [LICENSE-APACHE](LICENSE-APACHE)

You may choose either license at your option.

---

Free for anyone to use and develop from.
