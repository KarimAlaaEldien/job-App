import { schedule } from 'node-cron';

import User from '../../DB/model/user.model.js';

const cleanExpiredOTPs = async () => {
    const currentTime = new Date();

    await User.updateMany(
        { "OTP.expiresIn": { $lt: currentTime } },
        { $pull: { OTP: { expiresIn: { $lt: currentTime } } } }
    );
};

export const deletOtp = () => {
    schedule('0 */6 * * *', async () => {
        await cleanExpiredOTPs();
    });
};