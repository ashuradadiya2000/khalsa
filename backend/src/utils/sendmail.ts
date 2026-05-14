import nodemailer, { SendMailOptions, Transporter } from "nodemailer";

interface IMailParamas {
    toEmail: string
    subject: string
    html: string
    attachments?: {
        filename: string;
        path: string;
        contentType?: string;
    }[];
}

export const sendEmail = async (params: IMailParamas) => {
    try {
        const transporter: Transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST as string,
            port: parseInt(process.env.MAILPORT as string),
            secure: false,
            auth: {
                user: process.env.EMAIL as string,
                pass: process.env.PASS as string,
            },
        });

        var mailOptions: SendMailOptions = {
            from: process.env.EMAIL,
            to: params.toEmail,
            subject: params.subject,
            html: params.html,
            attachments: params?.attachments
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", params.subject, error);
    }
};