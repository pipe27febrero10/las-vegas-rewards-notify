import { Injectable } from '@nestjs/common';
import { INotification } from './interfaces/notification.interface';
import { Client, LocalAuth } from 'whatsapp-web.js';
const qrcode = require('qrcode-terminal');

@Injectable()
export class NotificationsService implements INotification {
    private client : Client = null;
    private clientReady : boolean = false;
    constructor(){
        this.client = new Client({   
        });
        this.client.on('qr', (qr) => {
            qrcode.generate(qr, {small: true});
            console.log('QR RECEIVED', qr);
        });

        this.client.on('ready', () => {
            this.clientReady = true;
        });
        
        this.client.initialize();
    }

    sendMessage(message: string,mobileNumber: string): void {
        if(!this.clientReady) throw new Error('Client not ready');
        const chatId = mobileNumber.substring(1) + "@c.us";
        this.client.sendMessage(chatId, message);
    }
}
