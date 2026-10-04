import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  loadCharacter: () => ipcRenderer.invoke('load-character'),
  saveCharacter: (character: any, filePath: string | null) => 
    ipcRenderer.invoke('save-character', { character, filePath }),
  newCharacter: () => ipcRenderer.invoke('new-character')
});
