"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
var prikaziPoruke = false;
var poruka = false;

connection.on("ReceiveMessageList", function (messagesFromRoom) {
    document.getElementById("messagesList").innerHTML="";
    for(var i = 0; i<messagesFromRoom.length; i++ )
    {
        console.log("IZ PRVOG: " + JSON.stringify(messagesFromRoom[i]))
        var li = document.createElement("li");
        document.getElementById("messagesList").appendChild(li);
        let user = messagesFromRoom[i].user;
        let message = messagesFromRoom[i].text;
        let image = messagesFromRoom[i].image;
        let dateTime = messagesFromRoom[i].time;
        var dt = new Date(dateTime);
        var date = dt.toLocaleDateString();
        var time = dt.toLocaleTimeString("sr-Latn-RS", {hour: '2-digit', minute:'2-digit'});
        var mybr = document.createElement('br');
        
        if(message == ""){
            var img = document.createElement('img');
            img.className = "imageMessage";
            img.src = 'data:image/jpeg;base64, ' + btoa(image);
            li.textContent = `${user}: ${date} ${time}`;
            li.appendChild(mybr);
            li.appendChild(img);
        }
        else if(image == null){
            li.textContent = `${user}: ${message} ${date} ${time}`;
        }
    }
});

connection.on("ReceiveActiveRooms", (activeRooms) => {
    console.log("Active rooms:", activeRooms);

    updateRoomList(activeRooms);
});

connection.on("InvalidUsername", (errorMessage) => {
    console.error("Invalid username:", errorMessage);
});

function updateRoomList(activeRooms) {
    const roomList = document.getElementById("roomSelector");
    roomList.innerHTML = "";

    activeRooms.forEach((room) => {
        const li = document.createElement("option");
        li.textContent = room;
        roomList.appendChild(li);
    });
}

connection.on("ReceiveMessage", function (msg) {
        console.log(msg);
        var li = document.createElement("li");
        document.getElementById("messagesList").appendChild(li);
        let user = msg.user;
        let message = msg.text;
        let image = msg.image;
        let dateTime = msg.time;
        var dt = new Date(dateTime);
        var date = dt.toLocaleDateString();
        var time = dt.toLocaleTimeString("sr-Latn-RS", {hour: '2-digit', minute:'2-digit'});
        var mybr = document.createElement('br');

        if(message == ""){
            var img = document.createElement('img');
            img.className = "imageMessage";
            img.src = 'data:image/jpeg;base64, ' + btoa(image);
            li.textContent = `${user}: ${date} ${time}`;
            li.appendChild(mybr);
            li.appendChild(img);
        }
        else if(image == null){
            li.textContent = `${user}: ${message} ${date} ${time}`;
        }
});

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("JoinedRoom", (roomName) => {
    console.log(`Joined room: ${roomName}`);
});

function createRoom() {
    const newRoomName = prompt("Enter the name of the new room:");
    if (newRoomName) {
        connection.invoke("CreateRoom", newRoomName);
    }
}

document.getElementById("addRoom").addEventListener("click", function (event) {
    var room = document.getElementById("roomName").value;
    connection.invoke("CreateRoom", room).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
    alert("Succesfully created room " + room);
});



document.getElementById("joinRoom").addEventListener("click", function (event) {
    let x = document.getElementById("userInput").value;
    if (x == "") {
        alert("Username must be filled out");
        return false;
    }
    document.querySelector("#sendButton").style.visibility = 'visible';
    document.querySelector("#messageInput").style.visibility = 'visible';
    document.querySelector("#messageParagraph").style.visibility = 'visible';
    document.getElementById("selectImgLbl").style.visibility = 'visible';
    document.getElementById("slika").style.visibility = 'visible';
    var room = document.getElementById("roomSelector").value;
    document.querySelector(".currentRoom").value = room;
    document.body.style.backgroundColor = "#402b80";
    document.body.style.color = "white";
    document.body.style.transition = '1500ms';
    document.getElementById("userInput").disabled = true;
    connection.invoke("JoinRoom", room).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
    alert("Successfully joined room " + room);
});

window.addEventListener("load", function() {
    document.querySelector("#sendButton").style.visibility = 'hidden';
    document.querySelector("#messageInput").style.visibility = 'hidden';
    document.querySelector("#messageParagraph").style.visibility = 'hidden';
    document.getElementById("selectImgLbl").style.visibility = 'hidden';
    document.getElementById("slika").style.visibility = 'hidden';
})

var binImage;

function uploadFile(inputElement) {
    var file = inputElement.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        var data=(reader.result).split(',')[1];
        var binaryBlob = atob(data);
        console.log('Encoded Binary File String:', binaryBlob);
        var currentRoom = document.getElementById("roomSelector").value;
        var user = document.getElementById("userInput").value;
        connection.invoke("SendImage", binaryBlob, currentRoom, user).catch(function (err) {
            return console.error(err.toString());
        });
    }
    reader.readAsDataURL(file);
  }

  connection.on("SendImage", (blob) => {
        binImage = blob;
  })



document.getElementById("slika").addEventListener("change", function() {
    document.getElementById("messageInput").disabled = true;
})

document.getElementById("messageInput").addEventListener("keyup", function() {
    if(this.value.length != 0) {
        document.getElementById("slika").disabled = true;
        document.getElementById("submitImgBtn").disabled = true;
    }
    else {
        document.getElementById("slika").disabled = false;
        document.getElementById("submitImgBtn").disabled = false;
    }
})

function updateDiv()
{ 
    $( "#messagesList" ).load(window.location.href + " #messagesList" );
}

document.getElementById("sendButton").addEventListener("click", function (event) {
    var user = document.getElementById("userInput").value;
    var currentRoom = document.getElementById("roomSelector").value;
    var message = document.getElementById("messageInput").value;
    var image = binImage;
    document.getElementById("slika").disabled = false;
    document.getElementById("messageInput").value = "";
    document.getElementById("messageInput").disabled = false;
    
    connection.invoke("SendMessage", currentRoom, user, message, image).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});