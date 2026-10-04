import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Character {
  meta: any;
  basic: any;
  abilities: any;
  combat: any;
  skills: any[];
  savingThrows: any;
  features: any[];
  spellcasting: any;
  inventory: any[];
  currency: any;
  effects: any[];
  languages: string[];
  proficiencies: any;
  backstory: any;
  notes: any[];
}

interface CharacterState {
  character: Character | null;
  filePath: string | null;
  unsavedChanges: boolean;
}

const initialState: CharacterState = {
  character: null,
  filePath: null,
  unsavedChanges: false
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    loadCharacter: (state, action: PayloadAction<{ character: Character; filePath: string | null }>) => {
      state.character = action.payload.character;
      state.filePath = action.payload.filePath;
      state.unsavedChanges = false;
    },
    updateHp: (state, action: PayloadAction<number>) => {
      if (state.character) {
        state.character.combat.currentHp = action.payload;
        state.unsavedChanges = true;
      }
    },
    addEffect: (state, action: PayloadAction<any>) => {
      if (state.character) {
        state.character.effects.push(action.payload);
        state.unsavedChanges = true;
      }
    },
    removeEffect: (state, action: PayloadAction<string>) => {
      if (state.character) {
        state.character.effects = state.character.effects.filter(
          (e: any) => e.id !== action.payload
        );
        state.unsavedChanges = true;
      }
    },
    useSpellSlot: (state, action: PayloadAction<number>) => {
      if (state.character && state.character.spellcasting) {
        const slot = state.character.spellcasting.spellSlots.find(
          (s: any) => s.level === action.payload
        );
        if (slot && slot.current > 0) {
          slot.current--;
          state.unsavedChanges = true;
        }
      }
    },
    longRest: (state) => {
      if (state.character) {
        // Восстановить все ХП
        state.character.combat.currentHp = state.character.combat.maxHp;
        
        // Восстановить слоты заклинаний
        if (state.character.spellcasting) {
          state.character.spellcasting.spellSlots.forEach((s: any) => {
            s.current = s.max;
          });
        }
        
        // Восстановить умения с ограниченными использованиями
        state.character.features.forEach((f: any) => {
          if (f.uses && f.uses.resetOn === 'long') {
            f.uses.current = f.uses.max;
          }
        });
        
        state.unsavedChanges = true;
      }
    }
  }
});

export const { loadCharacter, updateHp, addEffect, removeEffect, useSpellSlot, longRest } = characterSlice.actions;
export default characterSlice.reducer;
