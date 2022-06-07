export class MailDTO{
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

export class Mail{
    id: string;
    to: string;
    from: string;
    subject: string;
    text: string;
    html: string;
    timestamp: string;
    emailSend: boolean;
}