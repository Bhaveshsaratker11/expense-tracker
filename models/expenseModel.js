import mongoose from 'mongoose';
import { timeStamp } from 'node:console';
import { type } from 'node:os';


const expenseSchema = mongoose.Schema({

description:{
    type:String,
    required:true
},
amount:{
    type:Number,
    required:true
},
category:{
type:String,
required:true
},
date:{
    type:Date,
    required:true
},
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true

},

type:{
    type:String,
    default:"expense"
}


}, {timestamps:true})

const expenseModel  = mongoose.model("Expense",expenseSchema)
export default expenseModel;