import { registerAs } from '@nestjs/config'

export const GoogleDriverConfig = registerAs('google_driver', () => ({
  clientId: process.env.GG_DRIVER_CLIENT_ID,
  clientSecret: process.env.GG_DRIVER_CLIENT_SECRET,
  redirectURI: process.env.GG_DRIVER_REDIRECT_URI,
}))
