const isProduction = process.env.NODE_ENV === 'production'
const baseUrl = isProduction ? 'https://kapi.sre.gotokeep.com' : ''
export default {
  baseUrl,
}