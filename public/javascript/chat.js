const socket = io();

const messages = document.querySelector('#messages');
const messageForm = document.querySelector('#message-form')
const messageBox = document.querySelector('#message-box');
const messageButton = document.querySelector('#message-button');
const locationButton = document.querySelector('#send-location');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplate, {
        username: message.user,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (message) => {
    console.log(message);

    const html = Mustache.render(locationTemplate, {
        username: message.user,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
});

socket.on('updateRoom', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar__content').innerHTML = html;
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (messageBox.value.trim() != '') {
        messageButton.setAttribute('disabled', 'disabled');

        socket.emit('sendMessage', messageBox.value.trim(), () => {
            messageButton.removeAttribute('disabled');
            messageBox.value = '';
            messageBox.focus();

            console.log('Message delivered!');
        });
    }
});

locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Cannot connect to location services');
    }

    navigator.geolocation.getCurrentPosition((location) => {
        const { coords } = location;
        const { latitude, longitude } = coords;

        socket.emit('sendLocation', latitude, longitude, () => {
            console.log('Location shared!');
        });
    });
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});