const socket = io();
const sendButton = document.querySelector("#send-button");
const sendLocation = document.querySelector("#send-location-button");
const input = document.querySelector("#message-input");


const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });



socket.on("welcomeMessage", (message) => {
  
  const chatContainer = document.getElementById("chat-container");
  const messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";

  // Process the message (handle both string and object formats)
  const messageText = typeof message === "string" ? message : message.text;
  const timestamp = typeof message === "string" ? new Date() : new Date(message.createdAt);
  // Format the time (e.g., "3:45 PM")
  const formattedTime = moment(timestamp).format("h:mm A");

  // Convert URLs to links
  const messageWithLinks = autolink(messageText);

  // Create message HTML with timestamp
  messageDiv.innerHTML = `
    <div class="message-user">${message.username}</div>
    <div class="message-content">${messageWithLinks}</div>
    <div class="message-timestamp">${formattedTime}</div>
  `;

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
});
function autolink(input) {
  // Handle both strings and message objects
  const text = typeof input === "string" ? input : input.text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener"> My Current Location </a>`;
  });
}
function sendMessage() {
  
    const message = input.value;
  
    sendButton.setAttribute("disabled", "disabled");
  
    if (message != "")
      socket.emit("sendMessage", message, (message) => {
        console.log("the message was delivered" + message);
        sendButton.removeAttribute("disabled");
        input.value = "";
        input.focus();
      });
    else sendButton.removeAttribute("disabled");
    input.focus();
  }

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});


sendButton.addEventListener("click",  sendMessage);






sendLocation.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser does not support geolocation");
  }

  sendLocation.setAttribute("disabled", "true");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit(
        "sendLocation",
        {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
        },
        (acknowledge) => {
          console.log("Location shared successfully", acknowledge);
          sendLocation.removeAttribute("disabled");
        }
      );
    },
    (error) => {
      console.error("Error getting location:", error);
      alert("Failed to fetch location. Please check permissions.");
      sendLocation.removeAttribute("disabled");
    }
  );
});

socket.emit("join", {username, room},(error) => {
  if(error) {
    alert(error);
    location.href = "/";
  }
 
  
} );

   
    socket.on("roomData", ({ room, users }) => {
     
      
      // Update room name
      document.getElementById('room-name').textContent = room;
      
      // Update user count
      document.getElementById('user-count').textContent = users.length;
      
      // Clear current user list
      const usersList = document.getElementById('online-users-list');
      usersList.innerHTML = '';
      
      // Add each user to the list
      users.forEach(user => {
          const userElement = document.createElement('div');
          userElement.className = 'online-user';
          userElement.textContent = user.username;
          usersList.appendChild(userElement);
      });
  });