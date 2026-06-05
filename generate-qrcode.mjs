import QRCode from 'qrcode'
import { writeFileSync } from 'fs'

const url = 'https://memory-card-game-mu-blue.vercel.app'

QRCode.toFile('QRCode.png', url, {
  type: 'png',
  width: 400,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) throw err
  console.log('QR Code 已建立：QRCode.png')
})
