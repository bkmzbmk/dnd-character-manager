# Инструкция по установке и запуску

## 1. Установка зависимостей

Установи недостающую зависимость:

```bash
npm install --save-dev @types/node
```

## 2. Замена package.json

Замени содержимое `package.json` на содержимое файла `package_updated.json`

## 3. Создание структуры проекта

Создай следующие папки и файлы в корне проекта:

```
dnd-character-manager/
├── src/
│   ├── main/
│   │   ├── main.ts          ← из файла src_main_main.ts
│   │   └── preload.ts       ← из файла src_main_preload.ts
│   │
│   └── renderer/
│       ├── App.tsx          ← из файла src_renderer_App.tsx
│       ├── App.css          ← из файла src_renderer_App.css
│       ├── main.tsx         ← из файла src_renderer_main.tsx
│       │
│       ├── store/
│       │   ├── store.ts     ← из файла src_renderer_store_store.ts
│       │   └── characterSlice.ts  ← из файла src_renderer_store_characterSlice.ts
│       │
│       └── styles/
│           └── globals.css  ← из файла src_renderer_styles_globals.css
│
├── index.html               ← из файла index.html
├── package.json             ← замени на package_updated.json
├── tsconfig.json            ← уже есть
└── vite.config.ts           ← уже есть
```

## 4. Компиляция TypeScript для Electron

Создай отдельный `tsconfig.electron.json` в корне:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "commonjs",
    "outDir": "dist-electron",
    "noEmit": false
  },
  "include": ["src/main/**/*"]
}
```

Скомпилируй main process:

```bash
npx tsc --project tsconfig.electron.json
```

## 5. Запуск в режиме разработки

**Терминал 1** — запусти Vite dev server:
```bash
npm run dev
```

**Терминал 2** — запусти Electron (после того как Vite запустится):
```bash
npm run electron:dev
```

## 6. Загрузка персонажа Ли

Скопируй файл `character_example_li.json` в удобное место и загрузи его через кнопку "Загрузить" в приложении.

## 7. Сборка для продакшена (позже)

```bash
npm run electron:build
```

Готовый установщик будет в папке `release/`

---

## Проверка работоспособности

1. Vite должен запуститься на `http://localhost:5173`
2. Electron откроет окно и загрузит React приложение
3. Должна показаться приветственная страница с кнопками "Создать" и "Загрузить"
4. При загрузке `character_example_li.json` должен отобразиться лист персонажа Ли

## Возможные проблемы под Windows

Если `npm run dev` не работает, попробуй:
```bash
npx vite
```

Если TypeScript ругается на импорты, убедись что установлены все `@types/*` пакеты.
