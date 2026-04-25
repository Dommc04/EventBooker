import { app, BrowserWindow, dialog } from 'electron'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let serverProcess = null
let mainWindow = null
let serverStarted = false

function getServerPath() {
  let possiblePaths = []
  
  if (app.isPackaged) {
    // In packaged app, check multiple possible locations
    possiblePaths = [
      path.join(process.resourcesPath, 'app', 'server', 'index.js'),
      path.join(process.resourcesPath, 'server', 'index.js'),
      path.join(__dirname, 'server', 'index.js'),
      path.join(__dirname, '..', 'server', 'index.js'),
      path.join(app.getAppPath(), 'server', 'index.js')
    ]
  } else {
    // Development
    possiblePaths = [
      path.join(__dirname, 'server', 'index.js'),
      path.join(__dirname, '..', 'server', 'index.js')
    ]
  }
  
  for (const serverPath of possiblePaths) {
    console.log('Checking path:', serverPath)
    if (existsSync(serverPath)) {
      console.log('Found server at:', serverPath)
      return serverPath
    }
  }
  
  console.error('Server not found in any location')
  return null
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath()
    
    if (!serverPath) {
      const errorMsg = `Server files not found.\n\nSearched in:\n${possiblePaths.join('\n')}\n\nPlease reinstall the application.`
      dialog.showErrorBox('Server Not Found', errorMsg)
      reject(new Error('Server not found'))
      return
    }
    
    console.log('Starting server:', serverPath)
    
    // Try to use system Node.js
    serverProcess = spawn('node', [serverPath], {
      cwd: path.dirname(serverPath),
      stdio: 'pipe',
      windowsHide: false,
      shell: true
    })
    
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log(`Server: ${output}`)
      if (!serverStarted && (output.includes('running') || output.includes('listening'))) {
        serverStarted = true
        resolve()
      }
    })
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`Server stderr: ${data}`)
      const errorMsg = data.toString()
      if (errorMsg.includes('MODULE_NOT_FOUND')) {
        dialog.showErrorBox('Missing Dependencies', 
          'Node modules not found. Please reinstall the application.')
      }
    })
    
    serverProcess.on('error', (error) => {
      console.error('Server process error:', error)
      if (error.code === 'ENOENT') {
        dialog.showErrorBox('Node.js Not Found', 
          'Node.js is not installed or not in PATH.\n\nPlease install Node.js from:\nhttps://nodejs.org/')
      }
      reject(error)
    })
    
    // Timeout fallback
    setTimeout(() => {
      if (!serverStarted) {
        console.log('Server timeout, continuing anyway...')
        serverStarted = true
        resolve()
      }
    }, 8000)
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Mixer EventBooker',
    backgroundColor: '#f6f5f3',
    show: false
  })

  let indexPath
  if (app.isPackaged) {
    const possiblePaths = [
      path.join(process.resourcesPath, 'app', 'dist', 'index.html'),
      path.join(process.resourcesPath, 'dist', 'index.html'),
      path.join(__dirname, 'dist', 'index.html'),
      path.join(app.getAppPath(), 'dist', 'index.html')
    ]
    
    for (const testPath of possiblePaths) {
      if (existsSync(testPath)) {
        indexPath = testPath
        break
      }
    }
  } else {
    indexPath = path.join(__dirname, 'dist', 'index.html')
  }
  
  console.log('Loading app from:', indexPath)
  
  if (!indexPath || !existsSync(indexPath)) {
    dialog.showErrorBox('App Not Found', `Could not find app files at:\n${indexPath}`)
    app.quit()
    return
  }
  
  mainWindow.loadFile(indexPath)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

async function init() {
  try {
    await startServer()
    createWindow()
  } catch (error) {
    console.error('Init error:', error)
    dialog.showErrorBox('Startup Error', `Failed to start: ${error.message}`)
    app.quit()
  }
}

app.whenReady().then(init)

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})