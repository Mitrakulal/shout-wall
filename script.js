// --- DOM Elements ---
const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const notesCanvas = document.querySelector('main'); // We use the <main> tag as our canvas

// --- Your Live API URL ---
const API_URL = 'https://shout-wall.onrender.com/shouts'; // Use your real backend URL

// --- Drag and Drop Variables ---
let draggedNote = null;
let offsetX = 0;
let offsetY = 0;
let highestZ = 1; // To make sure the dragged note is always on top

// --- Creative Flair: Colors for the notes ---
const noteColors = ['#ffc', '#cfc', '#ccf', '#fcc', '#cff', '#ffb5e8'];

// --- Event Listeners ---
shoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = shoutInput.value.trim();
    if (!message) return;

    const shoutData = { message };
    
    // Send to backend
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(shoutData),
        headers: { 'content-type': 'application/json' }
    })
    .then(res => res.json())
    .then(createdShout => {
        createNote(createdShout); // Create a note on the page
    });

    shoutInput.value = '';
});

// Listen for mouse movement and release on the whole document
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);

// --- Functions ---

/**
 * Creates a new note element and places it randomly on the canvas.
 * @param {object} shout - The shout object from the server.
 */
function createNote(shout) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    
    const messageP = document.createElement('p');
    messageP.textContent = shout.message;
    noteDiv.appendChild(messageP);

    // --- Creative Additions: Random Placement, Rotation, and Color ---
    
    // 1. Random Color
    const randomColor = noteColors[Math.floor(Math.random() * noteColors.length)];
    noteDiv.style.backgroundColor = randomColor;

    // 2. Random Rotation
    const randomRotation = Math.random() * 20 - 10; // between -10 and 10 degrees
    noteDiv.style.transform = `rotate(${randomRotation}deg)`;

    // 3. Random Position
    const canvasWidth = notesCanvas.clientWidth;
    const canvasHeight = notesCanvas.clientHeight;
    const noteWidth = 200; 
    const noteHeight = 200;
    
    const randomX = Math.floor(Math.random() * (canvasWidth - noteWidth));
    const randomY = Math.floor(Math.random() * (canvasHeight - noteHeight));
    
    noteDiv.style.left = `${randomX}px`;
    noteDiv.style.top = `${randomY}px`;

    // Make the note draggable
    makeDraggable(noteDiv);
    
    notesCanvas.appendChild(noteDiv);
}

/**
 * Adds the necessary event listeners to make a note draggable.
 * @param {HTMLElement} note - The note element.
 */
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

/**
 * Handles the mouse move event for dragging.
 * @param {MouseEvent} event - The mouse move event.
 */
function onMouseMove(event) {
    if (!draggedNote) return;

    let newX = event.clientX - offsetX;
    let newY = event.clientY - offsetY;

    draggedNote.style.left = `${newX}px`;
    draggedNote.style.top = `${newY}px`;
}

/**
 * Handles the mouse up event to stop dragging.
 */
function onMouseUp() {
    if (draggedNote) {
        draggedNote.classList.remove('dragging');
    }
    draggedNote = null;
}


/**
 * Loads all existing shouts from the backend when the page opens.
 */
function loadShouts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(shouts => {
             shouts.forEach(shout => createNote(shout));
        });
}

// --- Initial Load ---
loadShouts();