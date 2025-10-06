import { Injectable } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { EnvService } from '../env/env.module'

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor(private env: EnvService) {
    this.transporter = nodemailer.createTransport({
      host: this.env.get('SMTP_HOST'),
      port: this.env.get('SMTP_PORT'),
      secure: this.env.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.env.get('SMTP_USER'),
        pass: this.env.get('SMTP_PASS'),
      },
    })
  }

  async sendWelcomeEmail(params: {
    to: string
    email: string
    password: string
  }) {
    const { to, email, password } = params

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Bem-vindo ao Habbit! 🎉</h1>

        <p>Seu pagamento foi confirmado com sucesso!</p>

        <p>Sua conta PRO foi criada e você já pode começar a usar o sistema.</p>

        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #333;">Seus dados de acesso:</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Senha temporária:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 4px;">${password}</code></p>
        </div>

        <p style="color: #666; font-size: 14px;">
          <strong>⚠️ Importante:</strong> Recomendamos que você altere sua senha após o primeiro login.
        </p>

        <p>
          <a href="${this.env.get('FRONTEND_URL')}/login"
             style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            Fazer Login
          </a>
        </p>

        <p style="margin-top: 30px; color: #999; font-size: 12px;">
          Se você não solicitou esta conta, por favor ignore este email.
        </p>
      </div>
    `

    await this.transporter.sendMail({
      from: `"Habbit" <${this.env.get('SMTP_FROM')}>`,
      to,
      subject: '🎉 Bem-vindo ao Habbit - Sua conta PRO foi ativada!',
      html,
    })
  }
}
