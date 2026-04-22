import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

const JWT_SECRET = 'bhavesh_11';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })

// register a user 
export const userRegister = async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: " All fields are required "
        })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            message: "invalid email",
            success: false
        })
    }
    if (password.length < 8) {
        return res.status(400).json({
            message: "password lenght atleast 8 characters",
            success: false
        })
    }

    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({
                message: "User already exist ",
                success: false
            })
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed });
        const token = createToken(user._id);
        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, password: user.password }

        })

    } catch (error) {
        console.log(error);
    }
}


// login user 

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "both fields are required",
            success: false
        })
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "invalid email or password"
            })
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "invalid email or password"
            })
        }

        const token = createToken(user._id);
        res.json({
            success: true,
            message: "user logged in",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

//  to get login user detail

export const getuser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("name email");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }

        res.json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}

// update the user 

export const updateUser = async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "valid email and name are required",
        });
    }

    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id } })
        if (exists) {
            return res.status(409).json({
                message: "email  already exist",
                success: false
            })
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true, select: "name email" }
        )

        res.json({
            success: true,
            user
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }

}


// to change the password

export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'password invalid or too short '
        })
    }
    try {
        const user = await User.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({
                message: "user not found",
                succes: false

            })
        }

        const match = await bcrypt.compare(currentPassword.trim(), user.password);
     console.log(currentPassword);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "current password is incorrect"
            });
        }


        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({
            succes: true,
            message: "password changed"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }

}