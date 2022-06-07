import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { DateTime } from 'luxon'; 
import { Mail, MailDTO } from './dtos/mail.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MailService {
    constructor(){
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    }

    async sendMail(mailDTO : MailDTO) : Promise<boolean>
    {
        const {to, from, subject, text, html } = mailDTO;
        const currentDate : string = DateTime.utc().toISO();

        const mail : Mail = {
            id: uuidv4(),
            to,
            from,
            subject,
            text,
            html,
            timestamp: currentDate,
            emailSend: false
        }

        try
        {
            await sgMail.send(mailDTO)
            mail.emailSend = true
        }
        catch(err)
        {
            console.log(err)
        }
        return true
    }
}
