const user =io();
const ChatBox=document.getElementById("ChatBox");

//show chat history 

user.on("history",msgs=>{
msgs.forEach(msg=>addMessage(msg));
})

//show new message 
user.on("chat",msg=>addMessage(msg));

//send message 

async function send() {
    console.log("1");
    const username=document.getElementById("name").value;
    const message=document.getElementById("msg").value;
    const file=document.getElementById("media").files[0];
    let mediaPath="";

// if file uploaded 

if(file) {
    const formData = new FormData();
    formData.append("file",file);
    const res =await fetch("/uploads",{method:"POST",body:formData});
    const data =await   res.json();
    mediaPath = data.filepath;
}
user.emit("chat",{username,message,media:mediaPath});
   
//empty that value :

    document.getElementById("name").value="";
    document.getElementById("msg").value="";
    document.getElementById("media").value="";
    

}

//add messge to Chat Box :

function addMessage(msg) {
    console.log("2");
    const div=document.createElement("div");
    div.classList.add("message");
    div.innerHTML=`<b> ${msg.username}: </b> ${msg.message||""}`;
    if(msg.media) {
        if(msg.media.endsWith(".mp4")) {
            div.innerHTML+=`<video src="${msg.media}" controls></video>`;
        }
        else {
            div.innerHTML += `<img src="${msg.media}" width="150"/>`;
        }
    }

    ChatBox.appendChild(div);
    ChatBox.scrollTop=ChatBox.scrollHeight; 
}