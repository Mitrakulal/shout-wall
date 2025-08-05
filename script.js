// --- DOM Elements ---
const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const notesCanvas = document.getElementById('notes-canvas');
// ** NEW: Select the new elements **
const addNoteBtn = document.getElementById('add-note-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeBtn = document.querySelector('.close-btn');


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

// ** NEW: Listeners to show and hide the modal **
addNoteBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

function closeModal() {
    modalOverlay.classList.add('hidden');
}

closeBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (event) => {
    // Close the modal if the user clicks on the dark background
    if (event.target === modalOverlay) {
        closeModal();
    }
});


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
        closeModal(); // ** NEW: Close the modal after successfully posting **
    });

    shoutInput.value = '';
});


// --- Drag and Drop Functions (No changes here) ---
function makeDraggable(note) { /* ... same as before ... */ }
function onDragStart(event) { /* ... same as before ... */ }
function onDragMove(event) { /* ... same as before ... */ }
function onDragEnd() { /* ... same as before ... */ }

// ... (Paste the full draggable functions from the previous code here)
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
// --- End of Draggable Functions ---


// --- Main Functions (No changes here) ---
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
        .catch(error => {
            console.error('Error loading shouts:', error);
        });
}

// --- Initial Load ---
loadShouts();