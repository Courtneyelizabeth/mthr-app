import Stripe from 'stripe'

export const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY!)

export const ITEMS: Record<string, { name: string; cents: number; files: string[] }> = {
  vol1: { name: 'The Golden Season — Volume 1 (PDF)', cents: 999, files: ['vol1'] },
  vol2: { name: 'The Golden Season — Volume 2 (PDF)', cents: 999, files: ['vol2'] },
  bundle: { name: 'The Golden Season — Both Volumes (PDF)', cents: 1500, files: ['vol1', 'vol2'] },
}
