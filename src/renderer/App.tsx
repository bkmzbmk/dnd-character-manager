import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { loadCharacter, updateHp } from './store/characterSlice';
import './App.css';

// Расширяем Window для TypeScript
declare global {
  interface Window {
    electronAPI: {
      loadCharacter: () => Promise<any>;
      saveCharacter: (character: any, filePath: string | null) => Promise<string | null>;
      newCharacter: () => Promise<any>;
    };
  }
}

function App() {
  const dispatch = useDispatch();
  const character = useSelector((state: RootState) => state.character.character);
  const filePath = useSelector((state: RootState) => state.character.filePath);
  const [loading, setLoading] = useState(false);

  // Загрузка персонажа
  const handleLoad = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.loadCharacter();
      if (result) {
        dispatch(loadCharacter(result));
      }
    } catch (error) {
      console.error('Error loading character:', error);
      alert('Ошибка при загрузке персонажа');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение персонажа
  const handleSave = async () => {
    if (!character) return;
    
    setLoading(true);
    try {
      const savedPath = await window.electronAPI.saveCharacter(character, filePath);
      if (savedPath) {
        alert('Персонаж сохранён');
      }
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Ошибка при сохранении персонажа');
    } finally {
      setLoading(false);
    }
  };

  // Новый персонаж
  const handleNew = async () => {
    setLoading(true);
    try {
      const template = await window.electronAPI.newCharacter();
      dispatch(loadCharacter({ character: template, filePath: null }));
    } catch (error) {
      console.error('Error creating new character:', error);
    } finally {
      setLoading(false);
    }
  };

  // Расчёт модификатора характеристики
  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (score: number): string => {
    const mod = getModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  if (!character) {
    return (
      <div className="app">
        <div className="welcome">
          <h1>DnD Character Manager</h1>
          <p>Менеджер листов персонажей D&D 5e</p>
          <div className="welcome-buttons">
            <button onClick={handleNew} disabled={loading}>
              Создать нового персонажа
            </button>
            <button onClick={handleLoad} disabled={loading}>
              Загрузить персонажа
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>{character.basic.name || 'Безымянный персонаж'}</h1>
        <div className="header-controls">
          <button onClick={handleNew} disabled={loading}>Новый</button>
          <button onClick={handleLoad} disabled={loading}>Загрузить</button>
          <button onClick={handleSave} disabled={loading}>Сохранить</button>
        </div>
      </header>

      <main className="app-main">
        {/* Основная информация */}
        <section className="card">
          <h2>Основная информация</h2>
          <div className="info-grid">
            <div><strong>Раса:</strong> {character.basic.race || '—'}</div>
            <div><strong>Класс:</strong> {character.basic.class || '—'}</div>
            <div><strong>Подкласс:</strong> {character.basic.subclass || '—'}</div>
            <div><strong>Уровень:</strong> {character.basic.level}</div>
            <div><strong>Предыстория:</strong> {character.basic.background || '—'}</div>
            <div><strong>Мировоззрение:</strong> {character.basic.alignment || '—'}</div>
          </div>
        </section>

        {/* Боевые показатели */}
        <section className="card">
          <h2>Боевые показатели</h2>
          <div className="combat-grid">
            <div className="hp-block">
              <label>Хиты</label>
              <div className="hp-input">
                <input
                  type="number"
                  value={character.combat.currentHp}
                  onChange={(e) => dispatch(updateHp(parseInt(e.target.value) || 0))}
                  min={0}
                  max={character.combat.maxHp}
                />
                <span> / {character.combat.maxHp}</span>
              </div>
            </div>
            <div>
              <label>Временные ХП</label>
              <div>{character.combat.tempHp}</div>
            </div>
            <div>
              <label>КЗ</label>
              <div className="stat-value">{character.combat.armorClass}</div>
            </div>
            <div>
              <label>Инициатива</label>
              <div className="stat-value">{formatModifier(character.abilities.dexterity)}</div>
            </div>
            <div>
              <label>Скорость</label>
              <div>{character.combat.speed} футов</div>
            </div>
            <div>
              <label>Бонус владения</label>
              <div className="stat-value">+{character.combat.proficiencyBonus}</div>
            </div>
          </div>
        </section>

        {/* Характеристики */}
        <section className="card">
          <h2>Характеристики</h2>
          <div className="abilities-grid">
            {Object.entries(character.abilities).map(([key, value]) => {
              const names: Record<string, string> = {
                strength: 'Сила',
                dexterity: 'Ловкость',
                constitution: 'Телосложение',
                intelligence: 'Интеллект',
                wisdom: 'Мудрость',
                charisma: 'Харизма'
              };
              return (
                <div key={key} className="ability-box">
                  <div className="ability-name">{names[key]}</div>
                  <div className="ability-score">{value}</div>
                  <div className="ability-modifier">{formatModifier(value)}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Заклинания (если есть) */}
        {character.spellcasting && character.spellcasting.spellSlots.length > 0 && (
          <section className="card">
            <h2>Заклинания</h2>
            <div className="spell-info">
              <div><strong>Сл спасброска:</strong> {character.spellcasting.spellSaveDC}</div>
              <div><strong>Атака заклинанием:</strong> +{character.spellcasting.spellAttackBonus}</div>
            </div>
            <div className="spell-slots">
              {character.spellcasting.spellSlots.map((slot) => (
                <div key={slot.level} className="spell-slot">
                  <strong>{slot.level} круг:</strong> {slot.current} / {slot.max}
                </div>
              ))}
            </div>
            <div className="spells-list">
              <h3>Заговоры ({character.spellcasting.cantrips.length})</h3>
              <ul>
                {character.spellcasting.cantrips.map((spell, idx) => (
                  <li key={idx}>{spell.name}</li>
                ))}
              </ul>
              <h3>Подготовленные заклинания ({character.spellcasting.spells.filter(s => s.prepared).length})</h3>
              <ul>
                {character.spellcasting.spells
                  .filter(s => s.prepared)
                  .map((spell, idx) => (
                    <li key={idx}>
                      {spell.name} ({spell.level} круг) {spell.alwaysPrepared && '★'}
                    </li>
                  ))}
              </ul>
            </div>
          </section>
        )}

        {/* Инвентарь */}
        <section className="card">
          <h2>Инвентарь</h2>
          <div className="inventory-list">
            {character.inventory.length === 0 ? (
              <p>Инвентарь пуст</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Количество</th>
                    <th>Вес</th>
                    <th>Категория</th>
                  </tr>
                </thead>
                <tbody>
                  {character.inventory.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.weight} фунт.</td>
                      <td>{item.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Казна */}
        <section className="card">
          <h2>Казна</h2>
          <div className="currency-grid">
            <div><strong>Медь:</strong> {character.currency.copper}</div>
            <div><strong>Серебро:</strong> {character.currency.silver}</div>
            <div><strong>Электрум:</strong> {character.currency.electrum}</div>
            <div><strong>Золото:</strong> {character.currency.gold}</div>
            <div><strong>Платина:</strong> {character.currency.platinum}</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
