import nodemailer from "nodemailer"
const sendEmails = async ({ to, subject, html }) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });

    const info = await transporter.sendMail({
        from: `Job App <${process.env.EMAIL}>`,
        to,
        subject,
        html,
    });

    return info.rejected.length == 0 ? true : false;
};

export const subjects = {
    confirmEmail: "Confirm Email",
    resetPass: "Reset Password",
    applecationAccept:"Job Application Accepted",
    applecationReject:"Job Application Rejected"
};
export default sendEmails;