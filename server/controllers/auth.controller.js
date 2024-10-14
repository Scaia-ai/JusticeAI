import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createSuccess } from "../utils/success.js";
import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    try {
        const { email, username, firstName, lastName, password, phoneNumber } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return next(createError(400, "A user with the same email or username is already registered."));
        }

        const role = await Role.findOne({ role: 'User' });
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            phoneNumber: phoneNumber.trim(),
            email: email.trim(),
            password: hashPassword,
            roles: [role._id]
        });

        await newUser.save();
        return next(createSuccess(201, "User registered successfully."));
    } catch (error) {
        console.error("Error in register:", error);
        return next(createError(500, "Internal Server Error."));
    }
};

export const login = async (req, res, next) => {
    try {
        var user = await User.findOne({email: req.body.username})
        .populate("roles", "role");

        if(!user)
        {
            user = await User.findOne({username: req.body.username})
            .populate("roles", "role");;
        }
        if(!user)
        {
            return next(createError(400, "User not found!."));
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return next(createError(400, "Password is incorrect."));
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin, roles: user.roles },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('access_token', token, { httpOnly: true })
            .status(200)
            .json({
                message: "Login successful.",
                token: token
            });
    } catch (error) {
        console.error("Error in login:", error);
        return next(createError(500, "Internal Server Error."));
    }
};