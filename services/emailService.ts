import { IUserResponse } from '../models/interfaces';

export class EmailService {
    public static async sendResponse(response: IUserResponse): Promise<boolean> {
        try {
            console.log('Enviando resposta por email:', response);
            await this.simulateEmailSend(response);
            return true;
        } catch (error) {
            console.error('Erro ao enviar email:', error);
            return false;
        }
    }

    private static simulateEmailSend(response: IUserResponse): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Email enviado com sucesso para: encontro@exemplo.com');
                resolve();
            }, 1000);
        });
    }
}