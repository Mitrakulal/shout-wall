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
document.addEventListener('mouseup', onMouseUp);

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

function onMouseUp() {
    if (draggedNote) {
        draggedNote.classList.remove('dragging');
    }
    draggedNote = null;
}

function loadShouts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(shouts => {
             notesCanvas.innerHTML = '';
             notesCanvas.appendChild(shoutForm);
             shouts.forEach(shout => createNote(shout));
        });
}

loadShouts();