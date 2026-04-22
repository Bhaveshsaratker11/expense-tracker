import incomeModel from "../models/incomeModel.js";
import XLSX from 'xlsx';
import getDateRange from "../utils/dataFilter.js";
import jwt from 'jsonwebtoken';


const JWT_SECRET = 'bhavesh_11';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })



export const addIncome = async (req, res) => {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).josn({
                message: "all fields are required",
                success: false
            })
        }

        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date
        });
        await newIncome.save();
        res.json({
            success: true,
            message: "income added successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}


// to get income (all)

export const getAllIncome = async (req, res) => {
    const userId = req.user._id;
    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });
        res.json(income)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// update an income 
export const updateIncome = async (req, res) => {
    const { id, description, amount, category, date } = req.body;
    const userId = req.user._id;

    try {
        const updatedIncome = await incomeModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount, category, date },
            { new: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "income not found"
            });
        }

        res.json({
            success: true,
            message: "income updated successfully",
            data: updatedIncome
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};
//  to delete an income

export const deleteIncome = async (req, res) => {
    try {
        const income = await incomeModel.findByIdAndUpdate({ _id: req.params.id });
        if (!income) {
            return res.status(404).json({
                success: false,
                message: "income not found"
            });
        }
        res.json({
            success: true,
            message: "income deleted "
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// to download the data in an excel sheet

export const downloadIncome = async (req, res) => {
    const uderId = req.user._id;
    try {
        const income = await incomeModel.find({ useerId }).sort({ date: -1 })
        const plainData = income.map((inc) => ({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString(),
        }))

        const workSheet = XLSX.utils.json_to_sheet(plainData);
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "incomeModel");
        XLSX.writeFile(workBook, "income_details.xlsx");
        res.download("income_details.xlsx");
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// to get inncome overview

export const getIncomeOverview = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.body;
        const { start, end } = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: { $gte: start, $lte: end },
        }).sort({ date: -1 });


        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;
        const recentTransactions = incomes.slice(0, 9);

        res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
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
