import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'DnD Character Manager',
    backgroundColor: '#1a1a1a'
  });

  // В режиме разработки загружаем из Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // В продакшене загружаем собранный HTML
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ===== IPC Handlers =====

// Загрузка персонажа из JSON
ipcMain.handle('load-character', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Character Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const character = JSON.parse(data);
    return { character, filePath };
  } catch (error) {
    console.error('Error loading character:', error);
    throw new Error('Не удалось загрузить файл персонажа');
  }
});

// Сохранение персонажа в JSON
ipcMain.handle('save-character', async (_event, { character, filePath }) => {
  let targetPath = filePath;

  if (!targetPath) {
    const result = await dialog.showSaveDialog({
      defaultPath: `${character.basic.name}.json`,
      filters: [
        { name: 'Character Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    targetPath = result.filePath;
  }

  try {
    // Обновляем метку времени
    character.meta.modified = new Date().toISOString();
    
    const jsonData = JSON.stringify(character, null, 2);
    fs.writeFileSync(targetPath, jsonData, 'utf-8');
    
    return targetPath;
  } catch (error) {
    console.error('Error saving character:', error);
    throw new Error('Не удалось сохранить файл персонажа');
  }
});

// Новый персонаж
ipcMain.handle('new-character', async () => {
  const template = {
    meta: {
      version: '1.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    },
    basic: {
      name: 'Новый персонаж',
      race: '',
      class: '',
      subclass: '',
      level: 1,
      background: '',
      alignment: '',
      experiencePoints: 0
    },
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    combat: {
      currentHp: 10,
      maxHp: 10,
      tempHp: 0,
      hitDice: { total: 1, current: 1, type: 'd6' },
      armorClass: 10,
      initiative: 0,
      speed: 30,
      proficiencyBonus: 2,
      deathSaves: { successes: 0, failures: 0 }
    },
    skills: [],
    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false
    },
    features: [],
    spellcasting: {
      ability: 'intelligence',
      spellSaveDC: 10,
      spellAttackBonus: 2,
      sorceryPoints: { max: 0, current: 0 },
      spellSlots: [],
      cantrips: [],
      spells: []
    },
    inventory: [],
    currency: { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 },
    effects: [],
    languages: ['Общий'],
    proficiencies: {
      armor: [],
      weapons: [],
      tools: []
    },
    backstory: {
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      appearance: '',
      history: ''
    },
    notes: []
  };

  return template;
});
