// script.js - UPDATED WITH TOUCH SUPPORT

const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const notesCanvas = document.getElementById('notes-canvas');

// Make sure your live backend URL is here!
const API_URL = 'https://shout-wall.onrender.com/shouts'; 

let draggedNote = null;
let offsetX = 0;
let offsetY = 0;
let highestZ = 1;

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

// --- Functions ---
function createNote(shout) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    
    const messageP = document.createElement('p');
    messageP.textContent = shout.message;
    noteDiv.appendChild(messageP);

    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    noteDiv.style.backgroundColor = randomColor;

    const randomRotation = Math.random() * 20 - 10;
    noteDiv.style.transform = `rotate(${randomRotation}deg)`;

    const canvasWidth = notesCanvas.clientWidth;
    const canvasHeight = notesCanvas.clientHeight;
    const randomX = Math.floor(Math.random() * (canvasWidth - 200));
    const randomY = Math.floor(Math.random() * (canvasHeight - 200));
    
    noteDiv.style.left = `${randomX}px`;
    noteDiv.style.top = `${randomY}px`;

    // Make the note draggable by both mouse and touch
    makeDraggable(noteDiv);
    
    notesCanvas.appendChild(noteDiv);
}

function makeDraggable(note) {
    // Add event listeners for both mouse and touch events
    note.addEventListener('mousedown', onDragStart);
    note.addEventListener('touchstart', onDragStart);
}

// --- Unified Drag and Drop Functions ---

function onDragStart(event) {
    // This function now handles both mousedown and touchstart
    if (event.type === 'touchstart') {
        // Prevent default touch behavior like scrolling
        event.preventDefault();
    }

    draggedNote = this; // 'this' refers to the note element
    draggedNote.classList.add('dragging');

    highestZ += 1;
    draggedNote.style.zIndex = highestZ;

    // Get the initial cursor/touch position
    const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY;

    offsetX = clientX - draggedNote.offsetLeft;
    offsetY = clientY - draggedNote.offsetTop;

    // Add the move and end listeners to the whole document
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchend', onDragEnd);
}

function onDragMove(event) {
    if (!draggedNote) return;
    
    // Prevent scrolling on mobile while dragging
    if (event.type === 'touchmove') {
        event.preventDefault();
    }

    // Get the current cursor/touch position
    const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX;
    const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY;

    let newX = clientX - offsetX;
    let newY = clientY - offsetY;

    draggedNote.style.left = `${newX}px`;
    draggedNote.style.top = `${newY}px`;
}

function onDragEnd() {
    if (draggedNote) {
        draggedNote.classList.remove('dragging');
    }
    draggedNote = null;

    // IMPORTANT: Remove the listeners from the document to clean up
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchend', onDragEnd);
}


function loadShouts() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(shouts => {
             const existingNotes = notesCanvas.querySelectorAll('.note');
             existingNotes.forEach(note => note.remove());
             
             shouts.forEach(shout => createNote(shout));
        })
        .catch(error => {
            console.error('Error loading shouts:', error);
        });
}

// --- Initial Load ---
loadShouts();