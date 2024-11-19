const socket = io("https://chat-amjrpuc9g-ayashs-projects-79a76d74.vercel.app");
const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messagesContainer = document.getElementById("messages");
const logoutButton = document.getElementById("logoutButton");
const onlineUsersContainer = document.getElementById("online-users");
const activeUsers = document.getElementById("active-users");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: "https://ayash911.github.io" }));

const userDetailsList = document.getElementById("user-details");
let groupName = "Group Chat";

const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.textContent = message;
  messageElement.classList.add("message", position);
  messagesContainer.append(messageElement);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

let name = prompt("Enter your name: ");
while (!name) {
  alert("Name cannot be blank.");
  name = prompt("Enter your name: ");
}
socket.emit("new-user-joined", name);

const updateUserList = (users) => {
  userDetailsList.innerHTML = "";

  const count = Object.keys(users).length;
  for (const id in users) {
    const { name, ipAddress, loginTime } = users[id];
    const userItem = document.createElement("li");
    userItem.textContent = `${name} (${ipAddress}) - Joined at ${loginTime}`;
    userDetailsList.appendChild(userItem);
  }
  document.getElementById("user-count").textContent = `${count}`;
};

socket.on("user-joined", ({ name, loginTime }) => {
  append(`${name} joined the chat at ${loginTime}`, "left");
});

socket.on("receive", (data) => {
  append(`${data.name}: ${data.message}`, "left");
});

socket.on("user-left", ({ name, logoutTime }) => {
  if (name) append(`${name} left the chat at ${logoutTime}`, "left");
});

socket.on("update-user-list", updateUserList);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("send", message);
    append(`You: ${message}`, "right");
    messageInput.value = "";
  } else {
    alert("Message cannot be blank.");
  }
});

logoutButton.addEventListener("click", () => {
  socket.emit("logout", name);
  location.reload();
});

function toggleUserDetails() {
  activeUsers.style.backgroundColor =
    activeUsers.style.backgroundColor === "white" ? "#6a5acd" : "white";
  onlineUsersContainer.style.display =
    onlineUsersContainer.style.display === "none" ? "block" : "none";
}

function changeGroupPhoto() {
  document.getElementById("groupPhotoInput").click();
}

document.getElementById("groupPhotoInput").addEventListener("change", () => {
  const file = document.getElementById("groupPhotoInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newPhoto = e.target.result;
      document.querySelector(".group-photo").src = newPhoto;
      socket.emit("group-photo-changed", newPhoto);
    };
    reader.readAsDataURL(file);
  }
});

socket.on("group-photo-updated", (newPhoto) => {
  document.querySelector(".group-photo").src = newPhoto;
});

socket.on("group-name-updated", (newName) => {
  document.querySelector(".group-name").textContent = newName;
});

function editGroupName() {
  const newName = prompt("Enter new group name:", groupName);
  if (newName) {
    groupName = newName;
    document.querySelector(".group-name").textContent = groupName;
    socket.emit("group-name-changed", groupName);
  }
}
