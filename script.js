// script.js - UPDATED FOR POSITION SAVING

// --- DOM Elements ---
const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const notesCanvas = document.querySelector('main');

// --- Your Live API URL ---
const API_URL = 'https://shout-wall.onrender.com/shouts'; // Use your real backend URL

// --- Drag and Drop Variables ---
let draggedNote = null;
let offsetX = 0;
let offsetY = 0;
let highestZ = 1;

// --- Creative Flair: Colors for the notes ---
const noteColors = ['#ffc', '#cfc', '#ccf', '#fcc', '#cff', '#ffb5e8'];

// --- Event Listeners ---
shoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = shoutInput.value.trim();
    if (!message) return;

    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(createdShout => {
        createNote(createdShout);
    });
    shoutInput.value = '';
});

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp); // This function will now save the position

// --- Functions ---

function createNote(shout) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    // ** NEW: Store the note's unique ID on the element itself **
    noteDiv.dataset.id = shout._id;

    const messageP = document.createElement('p');
    messageP.textContent = shout.message;
    noteDiv.appendChild(messageP);

    // --- Creative Additions ---
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    noteDiv.style.backgroundColor = randomColor;

    const randomRotation = Math.random() * 20 - 10;
    noteDiv.style.transform = `rotate(${randomRotation}deg)`;

    // --- Position Logic ---
    // ** NEW: Check if position is saved. If so, use it. If not, generate a random one. **
    if (shout.x !== undefined && shout.y !== undefined) {
        noteDiv.style.left = `${shout.x}px`;
        noteDiv.style.top = `${shout.y}px`;
    } else {
        const canvasWidth = notesCanvas.clientWidth;
        const canvasHeight = notesCanvas.clientHeight;
        const randomX = Math.floor(Math.random() * (canvasWidth - 200));
        const randomY = Math.floor(Math.random() * (canvasHeight - 200));
        noteDiv.style.left = `${randomX}px`;
        noteDiv.style.top = `${randomY}px`;
    }

    makeDraggable(noteDiv);
    notesCanvas.appendChild(noteDiv);
}

function makeDraggable(note) {
    note.addEventListener('mousedown', (event) => {
        draggedNote = note;
        note.classList.add('dragging');
        highestZ += 1;
        note.style.zIndex = highestZ;
        offsetX = event.clientX - note.offsetLeft;
        offsetY = event.clientY - note.offsetTop;
    });
}

function onMouseMove(event) {
    if (!draggedNote) return;
    let newX = event.clientX - offsetX;
    let newY = event.clientY - offsetY;
    draggedNote.style.left = `${newX}px`;
    draggedNote.style.top = `${newY}px`;
}

/**
 * ** NEW: This function now saves the final position to the backend **
 */
function onMouseUp() {
    if (draggedNote) {
        draggedNote.classList.remove('dragging');

        // Get the note's ID and final position
        const noteId = draggedNote.dataset.id;
        const finalX = draggedNote.offsetLeft;
        const finalY = draggedNote.offsetTop;

        // Send the update to the backend API
        fetch(`${API_URL}/${noteId}`, { // The URL is now /shouts/12345
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ x: finalX, y: finalY })
        });
    }
    draggedNote = null;
}

function loadShouts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(shouts => {
             notesCanvas.innerHTML = ''; // Clear canvas before loading
             shoutForm.style.display = 'block'; // Ensure form is visible
             shouts.forEach(shout => createNote(shout));
        });
}

// --- Initial Load ---
loadShouts();