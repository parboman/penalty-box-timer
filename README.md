# Penalty Box Timer

A standalone, offline-capable web app for managing penalty box timing during roller derby scrimmages. Optimized for tablets.

**Try it live:** [box.derbyshop.se](https://box.derbyshop.se)

## Features

- **30-second penalties** with synced countdown
- **Two teams** side-by-side with Jammer + 3 Blocker seats each
- **Full WFTDA jammer rules** (7.3.x):
  - Simultaneous sit: both jammers get 5 seconds
  - Jammer swap: new jammer serves time other already sat, other released
  - ABA scenario: returning jammer serves full time, no release
- **Visual warnings**: yellow at 10s (stand), red at 3s (release)
- **Works offline**: just open the HTML file in a browser

## Usage

1. Open `index.html` in any modern browser
2. Tap **Start Jam** to begin the period/jam clocks
3. Tap a seat to start a 30-second penalty
4. Tap a running timer to pause, adjust time, or cancel

## Credits

**Developed by** [Derbyshop.se](https://derbyshop.se)

### Standing on the shoulders of giants

The penalty box timing logic in this app is based on the excellent work done by the [CRG ScoreBoard](https://github.com/rollerderby/scoreboard) project. Special thanks to:

- **Mr Temper** - Creator of the Carolina Rollergirls ScoreBoard
- **Rob Thomas (The G33k)** - Original penalty timing implementation

Their open-source work made this tool possible.

## License

This project is dual-licensed under either:

- **GNU General Public License v3.0** (or later) - see [LICENSE-GPL](LICENSE-GPL)
- **Apache License 2.0** - see [LICENSE-APACHE](LICENSE-APACHE)

You may choose either license at your option.

---

Free for anyone to use and develop from.
