const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const customModal = document.getElementById("customModal");
const confirmButton = document.getElementById("confirmButton");
const cancelButton = document.getElementById("cancelButton");
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
    classifyText(message);
    outputMessage(message);
    // predict(message.text);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if (!msg) {
        return false;
    }

    // Emit message to server
    socket.emit("chatMessage", msg);

    // Clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    const p = document.createElement("p");
    p.classList.add("meta");
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement("p");
    para.classList.add("text");
    para.innerText = message.text;
    div.appendChild(para);
    document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
    const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
    if (leaveRoom) {
        window.location = "../index.html";
    } else {
    }
});

var value = "";
let hashMap = new Map([]);

const threshold = 0.85;
let occurence;
let limit;

function classifyText(message) {
    console.log(message);
    toxicity.load(threshold).then((model) => {
        const sentence = message.text;
        model.classify(sentence).then((predictions) => {
            console.log(predictions);
            value = predictions[6].results[0].match;
            console.log(value);
            // for (let i = 0; i < predictions.length; i++) {}

            if (value) {
                if (hashMap.has(message.username)) {
                    occurence = hashMap.get(message.username);
                    hashMap.set(message.username, occurence + 1);
                    limit = hashMap.get(message.username);
                    if (limit > 1) {
                        socket.emit("alert", message);
                    }
                } else {
                    hashMap.set(message.username, 1);
                }
            }
        });
    });
}
socket.on("event", function (user) {
    // console.log(user);
    // if (confirm("DO you want to block the user!")) {
    //     socket.emit("approvedToBlock", user);
    // } else {
    //     txt = "You pressed Cancel!";
    //     console.log(txt);
    // }
    console.log(user);
    customModal.style.display = "block"; // Display the custom modal

    confirmButton.onclick = function () {
        socket.emit("approvedToBlock", user);
        customModal.style.display = "none"; // Hide the modal
    };

    cancelButton.onclick = function () {
        console.log("You pressed Cancel!");
        customModal.style.display = "none"; // Hide the modal
    };
});
socket.on("block", function (user) {
    window.location = "../index.html";
    socket.emit("disconnect");
});

const classify = async (inputs) => {
    const results = await model.classify(inputs);
    return inputs.map((d, i) => {
        const obj = { text: d };
        results.forEach((classification) => {
            obj[classification.label] = classification.results[i].match;
        });
        return obj;
    });
};

const predict = async (inputs) => {
    model = await toxicity.load();
    labels = model.model.outputNodes.map((d) => d.split("/")[0]);
    const predictions = classify([inputs])
        .then((d) => {
            console.log(d);
            return d;
        })
        .catch((e) => {
            console.log("unsuccesfull Prediction");
        });

    // document.querySelector("#classify-new").addEventListener("submit", (e) => {
    //     const text = document.querySelector("#classify-new-text-input").value;

    //     // Prevent submitting the form which would cause a page reload.
    //     e.preventDefault();
    // });
};

// predict();
