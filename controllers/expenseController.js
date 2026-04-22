import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from 'xlsx';
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'bhavesh_11';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

export const addExpense = async (req, res) => {
    const { description, amount, category, date } = req.body;
    const userId = req.user.id;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                message: "all fields are required",
                success: false
            });
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date
        });
        await newExpense.save();
        res.json({
            success: true,
            message: "expense added successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// to get all expense

export const getAllExpense = async (req, res) => {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json({ expense });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }

}


// to update expense  


export const updateExpense = async (req, res) => {
    const userId = req.user._id;
    const { description, amount } = req.body;

    try {
        const updateExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updateExpense) {
            return res.status(404).json({
                success: false,
                message: 'expense not found'
            })
        }
        res.json({
            success: true,
            message: "expense update successfully",
            data: updateExpense
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

//   to delete the expense 



export const deleteExpense = async (req, res) => {
    try {
        const expense = await expenseModel.findByIdAndUpdate({ _id: req.params.id });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "expense not found"
            });
        }
        res.json({
            success: true,
            message: "expense deleted "
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}


//  to download the expense


export const downloadExpense = async (req, res) => {
    const uderId = req.user._id;
    try {
        const expense = await expenseModel.find({ useerId }).sort({ date: -1 })
        const plainData = expense.map((exp) => ({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString(),
        }))

        const workSheet = XLSX.utils.json_to_sheet(plainData);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "expenseModel");
        XLSX.writeFile(workBook, "expense_details.xlsx");
        res.download("expense_details.xlsx");
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// to get inncome overview

export const getExpenseOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.body;
        const { start, end } = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });

 const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;
    const numberOfTransactions = expense.length;
 const recentTransaction = expense.slice(0, 5);
        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

