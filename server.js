require("dotenv").config(); 
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const multer =require("multer");
const http = require("http");
const {Server} = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT=process.env.PORT;

//connect MONGO DB
mongoose.connect("mongodb://127.0.0.1:27017/chatApis")
.then(()=>console.log("database connected successfully"))
.catch((err)=>console.log("database error occur",err));

//mongoose Schema 

const chatSchema = new mongoose.Schema({
    username:String,
    message:String,
    media:String, //filepath
    createAt:{type:Date , default:Date.now}
})

//mongoose model 

const Chat = mongoose.model("chat",chatSchema);

//static files

app.use(express.static("public"))
app.use("/uploads",express.static(path.join(__dirname,"uploads")));    

//file upload setup 

const storage = multer.diskStorage({     
    destination:"uploads",
    filename:(req,file,cb)=>{
        cb(null, Date.now()+path.extname(file.originalname));
    }
});
 
const upload = multer({storage});

//api for upload media 

app.post("/uploads",upload.single("file"),(req,res)=>{
    res.json({filepath:"/uploads/"+req.file.filename})
});

io.on("connection",(socket)=>{
    console.log("socket connected");

    //send chat history :

    Chat.find().sort({createdAt:1}).then(msgs=>{
        socket.emit("history",msgs);
    })

    //receive message :

    socket.on("chat", async(data)=>{
        const chat= new Chat({
            username:data.username,
            message:data.message||"",
            media:data.media||""

        });
        await chat.save();
        io.emit("chat",chat); //boradcast to all 
    });
});

server.listen(3000,()=>console.log("Server is Started"))