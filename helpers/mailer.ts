import nodemailer from 'nodemailer';
import User from '@/models/Usermodel';
import bcryptjs from 'bcryptjs';

interface SendEmailParams {
    email: string;
    emailType: "VERIFY" | "RESET";
    userId: string;
}

export const sendEmail = async ({ email, emailType, userId }: SendEmailParams) => {
    try {
        // 1. Create a hashed token for security
        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        // 2. Update the user record with the token and expiry
        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000 // 1 hour from now
            });
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, {
                forgotPasswordToken: hashedToken,
                forgotPasswordTokenExpiry: Date.now() + 3600000
            });
        }

        // 3. Create the transporter (using Mailtrap credentials from screenshot)
        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "c194f6f6788975", // Use your actual credentials from .env instead
                pass: "c531241396417d", 
            }
        });

        // 4. Define mail options with dynamic HTML
        const mailOptions = {
            from: 'hitesh@hitesh.ai',
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to 
            ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
            or copy and paste the link below in your browser. <br> 
            ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`
        };

        // 5. Send mail
        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;

    } catch (error: any) {
        throw new Error(error.message);
    }
};