import  {EventEmitter}  from "events";
import sendEmails, { subjects } from "./sendEmails.js";
import { formHtml} from "./generateHtml.js";
export const emailEmitter=new EventEmitter();



emailEmitter.on("sendEmail",async(email,message,subject)=>{
        const isSent = await sendEmails({ to: email, subject, html: formHtml(message) });
});