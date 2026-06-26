const express=require("express");
const app=express();
const port= process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

app.use(express.json());
app.post("/generate", (req, res) => {
    console.log(req.body);
    res.send("Data recieved.");
});

app.get("/", (req,res)=>{
    cosole.log("Server working.")
})

