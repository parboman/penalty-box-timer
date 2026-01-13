/**
 * Penalty Box Timer - Standalone web app for roller derby scrimmages
 * Simplified penalty timing: 30 sec default, whole seconds, jammer swap releases other
 */

// State management
const state = {
    jamRunning: false,
    periodTimeSec: 30 * 60, // 30 minutes in seconds
    jamTimeSec: 2 * 60,     // 2 minutes in seconds
    lastTickTime: null,

    // Seats indexed by "team-position" key
    seats: {}
};

// Initialize seat state for both teams
['1', '2'].forEach(team => {
    ['jammer', 'blocker1', 'blocker2', 'blocker3'].forEach(position => {
        const key = `${team}-${position}`;
        state.seats[key] = {
            team,
            position,
            isRunning: false,
            isPaused: false,
            timeLeftSec: 30,
            enabled: true, // all seats enabled
            timeLocked: false // jammer only: tracks if already released early (for ABA detection)
        };
    });
});

// DOM elements
const elements = {
    periodTime: document.getElementById('periodTime'),
    jamTime: document.getElementById('jamTime'),
    startJamBtn: document.getElementById('startJamBtn'),
    stopJamBtn: document.getElementById('stopJamBtn'),
    popupOverlay: document.getElementById('popupOverlay'),
    popupTimeLeft: document.getElementById('popupTimeLeft'),
    btnAddTime: document.getElementById('btnAddMin'),
    btnSubTime: document.getElementById('btnSubMin'),
    btnPause: document.getElementById('btnPause'),
    btnCancel: document.getElementById('btnCancel'),
    btnClose: document.getElementById('btnClose')
};

let currentPopupSeat = null;

// Format seconds to M:SS
function formatTime(sec) {
    if (sec < 0) sec = 0;
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get seat element by key
function getSeatElement(key) {
    const [team, position] = key.split('-');
    return document.querySelector(`.seat[data-team="${team}"][data-position="${position}"]`);
}

// Update seat display
function updateSeatDisplay(key) {
    const seat = state.seats[key];
    const el = getSeatElement(key);
    if (!el) return;

    const timerEl = el.querySelector('.timer');

    // Update enabled/disabled state
    el.classList.toggle('disabled', !seat.enabled);

    if (!seat.enabled) {
        timerEl.textContent = '--:--';
        return;
    }

    // Update timer display
    if (seat.isRunning) {
        timerEl.textContent = formatTime(seat.timeLeftSec);
    } else {
        timerEl.textContent = '0:30';
    }

    // Update running/paused state
    el.classList.toggle('running', seat.isRunning && !seat.isPaused);
    el.classList.toggle('paused', seat.isRunning && seat.isPaused);

    // Update warning colors
    el.classList.remove('warning-stand', 'warning-release');
    if (seat.isRunning && seat.timeLeftSec > 0) {
        if (seat.timeLeftSec <= 3) {
            el.classList.add('warning-release');
        } else if (seat.timeLeftSec <= 10) {
            el.classList.add('warning-stand');
        }
    }
}


// Start penalty for a seat
// Jammer logic based on WFTDA rules 7.3.x
function startPenalty(key) {
    const seat = state.seats[key];

    // For jammers: complex swap logic
    if (seat.position === 'jammer') {
        const otherTeam = seat.team === '1' ? '2' : '1';
        const otherKey = `${otherTeam}-jammer`;
        const otherJammer = state.seats[otherKey];

        // Case 1: No other jammer in box - simple, serve 30 seconds
        if (!otherJammer.isRunning) {
            seat.isRunning = true;
            seat.isPaused = false;
            seat.timeLeftSec = 30;
            seat.timeLocked = false;
            updateSeatDisplay(key);
            return;
        }

        // Case 2: Both jammers at exactly 30 seconds (simultaneous sit)
        // WFTDA 7.3.2 - both get reduced time (5 seconds, scaled from 10s/60s)
        if (otherJammer.timeLeftSec === 30) {
            seat.isRunning = true;
            seat.isPaused = false;
            seat.timeLeftSec = 5;
            otherJammer.timeLeftSec = 5;
            updateSeatDisplay(key);
            updateSeatDisplay(otherKey);
            return;
        }

        // Case 3: ABA scenario - this jammer was released early and is returning
        // while their replacement is still serving
        // WFTDA 7.3.1 - both serve, no release (jammerless jam)
        if (seat.timeLocked || otherJammer.timeLocked) {
            seat.isRunning = true;
            seat.isPaused = false;
            seat.timeLeftSec = 30;
            // Reset time locks - we're back in sync
            seat.timeLocked = false;
            otherJammer.timeLocked = false;
            updateSeatDisplay(key);
            return;
        }

        // Case 4: Normal swap - new jammer serves time other already served
        // Other jammer released, this jammer becomes time-locked
        const timeServed = 30 - otherJammer.timeLeftSec;

        // Release the other jammer
        otherJammer.isRunning = false;
        otherJammer.timeLeftSec = 30;
        updateSeatDisplay(otherKey);

        // New jammer serves only the time already served by other
        seat.isRunning = true;
        seat.isPaused = false;
        seat.timeLeftSec = Math.max(timeServed, 1); // at least 1 second
        seat.timeLocked = true; // can't be released early again (ABA protection)
        updateSeatDisplay(key);
        return;
    }

    // Blockers: simple 30 seconds
    seat.isRunning = true;
    seat.isPaused = false;
    seat.timeLeftSec = 30;
    updateSeatDisplay(key);

}

// Cancel a penalty
function cancelPenalty(key) {
    const seat = state.seats[key];
    seat.isRunning = false;
    seat.isPaused = false;
    seat.timeLeftSec = 30;
    seat.timeLocked = false; // reset for jammers
    updateSeatDisplay(key);

}

// Main timer update loop (ticks every second)
let tickInterval = null;

function tick() {
    // Update period and jam clocks
    if (state.jamRunning) {
        state.periodTimeSec--;
        state.jamTimeSec--;

        if (state.periodTimeSec < 0) state.periodTimeSec = 0;
        if (state.jamTimeSec <= 0) {
            state.jamTimeSec = 0;
            stopJam();
        }
    }

    // Update clock displays
    elements.periodTime.textContent = formatTime(state.periodTimeSec);
    elements.jamTime.textContent = formatTime(state.jamTimeSec);

    // Update all penalty timers
    Object.keys(state.seats).forEach(key => {
        const seat = state.seats[key];
        if (seat.isRunning && !seat.isPaused && state.jamRunning) {
            seat.timeLeftSec--;

            // Check if penalty complete
            if (seat.timeLeftSec <= 0) {
                seat.isRunning = false;
                seat.timeLeftSec = 30;
                seat.timeLocked = false; // reset for jammers

            }

            updateSeatDisplay(key);
        }
    });

    // Update popup if open
    if (currentPopupSeat) {
        const seat = state.seats[currentPopupSeat];
        elements.popupTimeLeft.textContent = formatTime(seat.timeLeftSec);
    }
}

// Jam controls
function startJam() {
    state.jamRunning = true;
    state.jamTimeSec = 2 * 60;
    elements.startJamBtn.classList.add('hidden');
    elements.stopJamBtn.classList.remove('hidden');
}

function stopJam() {
    state.jamRunning = false;
    elements.startJamBtn.classList.remove('hidden');
    elements.stopJamBtn.classList.add('hidden');
}

// Show popup for running timer
function showPopup(key) {
    const seat = state.seats[key];
    currentPopupSeat = key;
    elements.popupTimeLeft.textContent = formatTime(seat.timeLeftSec);
    elements.btnPause.textContent = seat.isPaused ? 'Resume' : 'Pause';
    elements.popupOverlay.classList.remove('hidden');
}

function hidePopup() {
    elements.popupOverlay.classList.add('hidden');
    currentPopupSeat = null;
}

// Event handlers
function handleSeatClick(e) {
    const seatEl = e.target.closest('.seat');
    if (!seatEl) return;

    // Ignore clicks on duration buttons
    if (e.target.closest('.duration-btn')) return;

    const team = seatEl.dataset.team;
    const position = seatEl.dataset.position;
    const key = `${team}-${position}`;
    const seat = state.seats[key];

    // Ignore disabled seats
    if (!seat.enabled) return;

    // If running, show popup
    if (seat.isRunning) {
        showPopup(key);
        return;
    }

    // Start penalty (30 seconds)
    startPenalty(key);
}

// Initialize
function init() {
    // Jam controls
    elements.startJamBtn.addEventListener('click', startJam);
    elements.stopJamBtn.addEventListener('click', stopJam);

    // Seat clicks
    document.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', handleSeatClick);
    });

    // Popup controls
    elements.btnClose.addEventListener('click', hidePopup);
    elements.popupOverlay.addEventListener('click', (e) => {
        if (e.target === elements.popupOverlay) hidePopup();
    });

    elements.btnAddTime.addEventListener('click', () => {
        if (!currentPopupSeat) return;
        const seat = state.seats[currentPopupSeat];
        seat.timeLeftSec += 30;
        elements.popupTimeLeft.textContent = formatTime(seat.timeLeftSec);
    });

    elements.btnSubTime.addEventListener('click', () => {
        if (!currentPopupSeat) return;
        const seat = state.seats[currentPopupSeat];
        seat.timeLeftSec = Math.max(seat.timeLeftSec - 30, 1);
        elements.popupTimeLeft.textContent = formatTime(seat.timeLeftSec);
    });

    elements.btnPause.addEventListener('click', () => {
        if (!currentPopupSeat) return;
        const seat = state.seats[currentPopupSeat];
        seat.isPaused = !seat.isPaused;
        elements.btnPause.textContent = seat.isPaused ? 'Resume' : 'Pause';
        updateSeatDisplay(currentPopupSeat);
    });

    elements.btnCancel.addEventListener('click', () => {
        if (!currentPopupSeat) return;
        cancelPenalty(currentPopupSeat);
        hidePopup();
    });

    // Initial display update
    Object.keys(state.seats).forEach(updateSeatDisplay);
    elements.periodTime.textContent = formatTime(state.periodTimeSec);
    elements.jamTime.textContent = formatTime(state.jamTimeSec);

    // Start tick loop (every 1 second)
    tickInterval = setInterval(tick, 1000);
}

// Start app when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
