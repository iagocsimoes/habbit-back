import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { EnvService } from '../env/env.module'

export interface CreateBillingResponse {
  id: string
  url: string
  amount: number
  status: string
}

export interface WebhookEvent {
  id: string
  kind: string
  createdAt: string
  billing: {
    id: string
    status: string
    amount: number
    metadata?: Record<string, any>
  }
}

@Injectable()
export class AbacatePayService {
  private client: AxiosInstance | null = null

  constructor(private env: EnvService) {
    const apiKey = this.env.get('ABACATEPAY_API_KEY')
    if (apiKey) {
      this.client = axios.create({
        baseURL: 'https://api.abacatepay.com/v1',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      })
    }
  }

  async createBilling(params: {
    amount: number
    userEmail: string
    userId: string
    description: string
  }): Promise<CreateBillingResponse> {
    if (!this.client) {
      throw new Error('Abacate Pay is not configured')
    }

    // Convert amount to cents (Abacate Pay requires amounts in cents)
    const amountInCents = Math.round(params.amount * 100)

    try {
      const response = await this.client.post('/billing/create', {
        amount: amountInCents,
        description: params.description,
        methods: ['PIX'],
        frequency: 'MULTIPLE_PAYMENTS',
        returnUrl: `${this.env.get('FRONTEND_URL')}/payment/success`,
        completionUrl: `${this.env.get('FRONTEND_URL')}/payment/success`,
        metadata: {
          userId: params.userId,
          userEmail: params.userEmail,
        },
        products: [
          {
            externalId: 'plan-pro',
            name: 'Plano PRO',
            description: params.description,
            quantity: 1,
            price: amountInCents,
          },
        ],
      })

      console.log('✅ Abacate Pay Response:', response.data)

      const billing = response.data.data

      return {
        id: billing.id,
        url: billing.url,
        amount: billing.amount,
        status: billing.status,
      }
    } catch (error: any) {
      console.error('Abacate Pay API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      })
      throw error
    }
  }

  async cancelBilling(billingId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Abacate Pay is not configured')
    }

    await this.client.post(`/billing/${billingId}/cancel`)
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
  ): WebhookEvent | null {
    const webhookSecret = this.env.get('ABACATEPAY_WEBHOOK_SECRET')

    if (!webhookSecret) {
      throw new Error('Webhook secret not configured')
    }

    // Abacate Pay usa HMAC SHA256
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex')

    if (signature !== expectedSignature) {
      return null
    }

    return JSON.parse(payload)
  }
}
