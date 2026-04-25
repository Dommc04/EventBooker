import { writeFileSync } from 'fs'
import https from 'https'

// Free to use icon from Icons8 (requires attribution - fine for personal use)
const iconUrl = 'https://img.icons8.com/fluency/256/wine-glasses.png'

https.get(iconUrl, (response) => {
  let data = []
  response.on('data', (chunk) => data.push(chunk))
  response.on('end', () => {
    writeFileSync('build/icon.png', Buffer.concat(data))
    console.log('✓ Downloaded wine glasses icon to build/icon.png')
    console.log('✓ You can now build your installer')
  })
}).on('error', (err) => {
  console.error('Download failed:', err)
})