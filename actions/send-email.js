import { Resend } from "resend";

export async function sendEmail({ to, subject, react }) {
    const resend=new Resend(process.env.RESEND_API_KEY||"");
    try {
        const data = await resend.emails.send({
            from: 'FinGenie <onboarding@resend.dev>',
            to,
            subject,
            react,
          });
        return{sucess:true,data}
        
    } catch (error) {
        console.error("Error sending email:", error);
        return{sucess:false,error}

        
    }
}