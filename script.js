// script.js (UPDATED)

// --- DOM Elements ---
const shoutForm = document.getElementById('shout-form');
const shoutInput = document.getElementById('shout-input');
const shoutsContainer = document.getElementById('shouts-container');

// --- The address of our backend server ---
const API_URL = 'https://shout-wall-backend.onrender.com/shouts';

// --- Event Listeners ---
shoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = shoutInput.value.trim();

    if (message) {
        const shoutData = { message };

        // Send the new shout to the backend servergit
        fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(shoutData),
            headers: { 'content-type': 'application/json' }
        })
        .then(res => res.json())
        .then(createdShout => {
            // Add the new shout to the page after it's saved
            addShoutToPage(createdShout);
        });

        shoutInput.value = '';
        shoutInput.focus();
    }
});

// --- Functions ---

function addShoutToPage(shout) {
    const postDiv = document.createElement('div');
    postDiv.className = 'shout-post';

    const messageP = document.createElement('p');
    messageP.textContent = shout.message;

    const dateSmall = document.createElement('small');
    dateSmall.textContent = new Date(shout.createdAt).toLocaleString();

    postDiv.append(messageP, dateSmall);
    shoutsContainer.prepend(postDiv);
}

function loadShouts() {
    // Fetch all shouts from our backend server
    fetch(API_URL)
        .then(res => res.json())
        .then(shouts => {
             shoutsContainer.innerHTML = ''; // Clear the page
             // Add each shout from the server to the page
             shouts.forEach(shout => addShoutToPage(shout));
        });
}

// --- Initial Load ---
loadShouts();