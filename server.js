import express from "express";
import cors from "cors";
import db from "./config/db.js"
import connectdb from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";


const app = express();
const port = 3000;


// middlewres 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));




//  Db 
connectdb();

//  routes

app.use("/api/user",userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense",expenseRouter);
app.use("/api/dashboard", dashboardRouter)

//API
app.get("/",(req,res)=>{
    res.send("good")
})

app.post("/",(req,res)=>{
    app.post({"name": "bhavesh"})
})

app.listen(port,()=>{
    console.log(`server is running http://localhost:${port}`);
})