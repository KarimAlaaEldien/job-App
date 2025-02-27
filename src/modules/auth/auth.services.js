import { OAuth2Client } from "google-auth-library";
import User, { expireTime } from "../../DB/model/user.model.js";
import { otpContent, providers, roles } from "../../utils/enum/enum.values.js";
import { compareHash, decrypt, emailEmitter, generatToken, subjects, verifyToken } from "../../utils/index.js";
import Randomstring from "randomstring";


export const signUp = async (req, res, next) => {
    const { firstName, lastName, email, password, mobileNumber, gender, DOB } = req.body;

    const user = await User.findOne({ email });
    if (user) return next(new Error("Email Already Exist....!", { cause: 409 }))
    const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" })

    emailEmitter.emit("sendEmail", email, otp, subjects.confirmEmail);
    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        mobileNumber,
        gender,
        DOB,
        OTP: [{
            code: otp,
            type: otpContent.confirmEmail,
            expiresIn: expireTime(),
        }]
    });
    await newUser.save()
    return res.status(201).json({ success: true, message: "user created successfully" })
};

export const signUpAdmin = async (req, res, next) => {
    const { firstName, lastName, email, password, mobileNumber, role, gender, DOB } = req.body;

    const user = await User.findOne({ email });
    if (user) return next(new Error("Email Already Exist....!", { cause: 409 }))
    const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" })

    emailEmitter.emit("sendEmail", email, otp, subjects.confirmEmail);
    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        mobileNumber,
        gender,
        DOB,
        role: roles.admin,
        OTP: [{
            code: otp,
            type: otpContent.confirmEmail,
            expiresIn: expireTime(),
        }]
    });
    await newUser.save()
    return res.status(201).json({ success: true, message: "user created successfully" })
};

export const confirmOTP = async (req, res, next) => {
    const { email, otp, type } = req.body;

    let user = await User.findOne({ email });
    if (!user) return next(new Error("User not found ....!", { cause: 404 }));

    const otpItem = user.OTP.find(item => item.type === type);

    if (!otpItem) {
        return next(new Error(`No OTP found for ${type}`, { cause: 400 }));
    }

    const currentTime = new Date();
    if (currentTime > otpItem.expiresIn) {
        return next(new Error("OTP has expired", { cause: 400 }));
    }

    if (otp !== decrypt({ cipherText: otpItem.code })) {
        return next(new Error("Invalid OTP", { cause: 400 }));
    }

    if (type === otpContent.confirmEmail) {
        user.isConfirmed = true;
        await user.save();
        return res.status(200).json({ success: true, message: "Email confirmed successfully" });

    } else if (type === otpContent.forgetPassword) {
        user.passwordOTPValid = true
        await user.save()
        return res.status(200).json({ success: true, message: "OTP is valid. You can now reset your password." });
    } else {
        return next(new Error("Invalid OTP type", { cause: 400 }));
    }
};

export const resendOTP = async (req, res, next) => {
    const { email, type } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found ....!", { cause: 404 }));

    let otpItem = user.OTP.find(item => item.type === type);

    if (otpItem) user.OTP = user.OTP.filter(item => item.type !== type);

    const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" });

    emailEmitter.emit("sendEmail", email, otp, type === subjects.confirmEmail ? subjects.confirmEmail : subjects.resetPass);

    user.OTP.push({
        code: otp,
        type: type,
        expiresIn: expireTime(),
    });

    await user.save();

    return res.status(200).json({
        success: true,
        message: `OTP has been resent for ${type === subjects.confirmEmail ? subjects.confirmEmail : subjects.resetPass}. Please check your inbox.`
    });
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found ....!", { cause: 404 }));
    if (!user.isConfirmed) return next(new Error("you must confirm email first", { cause: 400 }));

    if (user.provider !== providers.system) {
        return next(new Error("You must sign In with google", { cause: 400 }));
    }

    const isMatch = compareHash({ plainText: password, hash: user.password });
    if (!isMatch) return next(new Error("Invalid credentials", { cause: 400 }));
    user.deletedAt = undefined;
    await user.save()
    return res.status(200).json({
        success: true,
        message: "Login success",
        access_token: generatToken({
            payload: { id: user._id, email: user.email },
            options: { expiresIn: process.env.ACCESS_TOKEN },
        }),
        refresh_token: generatToken({
            payload: { id: user._id, email: user.email },
            options: { expiresIn: process.env.REFRESH_TOKEN }
        }),
    });
};

export const googleLoginOrSignup = async (req, res, next) => {
    const { idToken } = req.body;

    const client = new OAuth2Client();
    const payload = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,
    });

    const { email_verified, email, name } = payload;

    if (!email_verified) return next(new Error("Invalid email!", { cause: 400 }));

    let user = await User.findOne({ email });

    if (user) {
        return res.status(200).json({
            success: true,
            message: "Login successful",
            access_token: generatToken({
                payload: { id: user._id, email: user.email },
                options: { expiresIn: process.env.ACCESS_TOKEN },
            }),
            refresh_token: generatToken({
                payload: { id: user._id, email: user.email },
                options: { expiresIn: process.env.REFRESH_TOKEN }
            }),
        });
    }

    user = await User.create({ email, userName: name, provider: providers.gmail });

    return res.status(201).json({
        success: true,
        message: "User created and logged in successfully",
        access_token: generatToken({
            payload: { id: user._id, email: user.email },
            options: { expiresIn: process.env.ACCESS_TOKEN },
        }),
        refresh_token: generatToken({
            payload: { id: user._id, email: user.email },
            options: { expiresIn: process.env.REFRESH_TOKEN }
        }),
    });
};

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(new Error("User not found ....!", { cause: 404 }));

    let otpItem = user.OTP.find(item => item.type === otpContent.forgetPassword && new Date(item.expiresIn) > new Date());

    if (otpItem) {
        return res.status(400).json({ success: false, message: "Please check your email for the OTP to reset your password." });
    }

    otpItem = user.OTP.find(item => item.type === otpContent.forgetPassword);
    if (otpItem) {
        user.OTP = user.OTP.filter(item => item.type !== otpContent.forgetPassword);
    }
    const otp = Randomstring.generate({ length: 6, charset: "alphanumeric" });
    emailEmitter.emit("sendEmail", email, otp, subjects.resetPass);

    user.OTP.push({
        code: otp,
        type: otpContent.forgetPassword,
        expiresIn: expireTime(),
    });

    await user.save();

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
};

export const resetPassword = async (req, res, next) => {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email, passwordOTPValid: true });
    if (!user) return next(new Error("User not found ....!", { cause: 404 }));

    user.password = newPassword
    user.passwordOTPValid = false;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
};

export const refreshToken = async (req, res, next) => {
    const { refresh_token } = req.body;
    const payload = verifyToken({ token: refresh_token })

    const user = await User.findById(payload.id);
    if (!user) return next(new Error("user not found ....!....!", { cause: 404 }));
    const accessToken = generatToken({
        payload: { id: user._id, email: user.email },
        options: { expiresIn: process.env.ACCESS_TOKEN }
    })
    return res.status(200).json({ success: true, accessToken });
};