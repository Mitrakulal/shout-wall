// script.js - UPDATED WITH COLOR PICKER LOGIC

// --- DOM Elements ---
const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const notesCanvas = document.getElementById('notes-canvas');
const addNoteBtn = document.getElementById('add-note-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeBtn = document.querySelector('.close-btn');
// ** NEW: Select the color picker elements **
const colorSwatches = document.querySelectorAll('.color-swatch');

// --- Your Live API URL ---
const API_URL = 'https://shout-wall.onrender.com/shouts'; // Use your real backend URL

// --- State Variables ---
let draggedNote = null;
let offsetX = 0;
let offsetY = 0;
let highestZ = 1;
// ** NEW: Variable to store the selected color **
let selectedColor = '#ffc'; // Default color

// --- Creative Flair: Colors for the notes ---
// This array is now used for old notes that don't have a color saved
const defaultNoteColors = ['#ffc', '#cfc', '#ccf', '#fcc', '#cff', '#ffb5e8'];

// --- Event Listeners ---

// ** NEW: Logic for handling color selection **
colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        // Remove 'selected' class from all swatches
        colorSwatches.forEach(s => s.classList.remove('selected'));
        // Add 'selected' class to the clicked one
        swatch.classList.add('selected');
        // Update the selectedColor variable
        selectedColor = swatch.dataset.color;
    });
});

addNoteBtn.addEventListener('click', () => modalOverlay.classList.remove('hidden'));
closeBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));
modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) modalOverlay.classList.add('hidden');
});

shoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = shoutInput.value.trim();
    if (!message) return;

    // ** UPDATED: Include the selected color in the data sent to the backend **
    const shoutData = { message, color: selectedColor };

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(shoutData),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(createdShout => {
        createNote(createdShout);
        modalOverlay.classList.add('hidden');
    });

    shoutInput.value = '';
});

// --- Functions ---
function createNote(shout) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    
    const messageP = document.createElement('p');
    messageP.textContent = shout.message;
    noteDiv.appendChild(messageP);

    // ** UPDATED: Use the saved color, or a default/random one if it doesn't exist **
    if (shout.color) {
        noteDiv.style.backgroundColor = shout.color;
    } else {
        // Fallback for old notes without a color
        noteDiv.style.backgroundColor = defaultNoteColors[Math.floor(Math.random() * defaultNoteColors.length)];
    }

    const randomRotation = Math.random() * 20 - 10;
    noteDiv.style.transform = `rotate(${randomRotation}deg)`;

    const canvasWidth = notesCanvas.clientWidth;
    const canvasHeight = notesCanvas.clientHeight;
    const randomX = Math.floor(Math.random() * (canvasWidth - 200));
    const randomY = Math.floor(Math.random() * (canvasHeight - 200));
    
    noteDiv.style.left = `${randomX}px`;
    noteDiv.style.top = `${randomY}px`;

    makeDraggable(noteDiv);
    notesCanvas.appendChild(noteDiv);
}

function loadShouts() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            return response.json();
        })
        .then(shouts => {
             const existingNotes = notesCanvas.querySelectorAll('.note');
             existingNotes.forEach(note => note.remove());
             shouts.forEach(shout => createNote(shout));
        })
        .catch(error => console.error('Error loading shouts:', error));
}


// --- Drag and Drop Functions (No changes here) ---
function makeDraggable(note) { /* ... same as before ... */ }
function onDragStart(event) { /* ... same as before ... */ }
function onDragMove(event) { /* ... same as before ... */ }
function onDragEnd() { /* ... same as before ... */ }
// For completeness, here they are again:
function makeDraggable(note) {
    note.addEventListener('mousedown', onDragStart);
    note.addEventListener('touchstart', onDragStart);
}
function onDragStart(event) {
    if (event.type === 'touchstart') { event.preventDefault(); }
    draggedNote = this;
    draggedNote.classList.add('dragging');
    highestZ += 1;
    draggedNote.style.zIndex = highestZ;
    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;
    offsetX = clientX - draggedNote.offsetLeft;
    offsetY = clientY - draggedNote.offsetTop;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
}
function onDragMove(event) {
    if (!draggedNote) return;
    if (event.type === 'touchmove') { event.preventDefault(); }
    const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;
    let newX = clientX - offsetX;
    let newY = clientY - offsetY;
    draggedNote.style.left = `${newX}px`;
    draggedNote.style.top = `${newY}px`;
}
function onDragEnd() {
    if (draggedNote) { draggedNote.classList.remove('dragging'); }
    draggedNote = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchend', onDragEnd);
}

// --- Initial Load ---
loadShouts();