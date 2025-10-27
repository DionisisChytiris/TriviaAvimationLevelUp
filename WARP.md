# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Expo (React Native), TypeScript, Redux Toolkit
- Entry: index.ts registers App via Expo; App.tsx wraps the UI with a Redux Provider
- State: src/redux with three slices (quiz, modal, coins) combined in src/redux/store.ts
- UI: App.tsx renders the quiz screen; src/components/LevelModal.tsx handles the animated level modal
- Data: src/data/questions.ts; styling system in src/lib/theme.ts

Common commands
- Install dependencies
```bash
npm install
```

- Start development server (Expo)
```bash
npm run start
```

- Launch on a specific platform
```bash
npm run android
npm run ios
npm run web
```

- Type-check the project (no emit)
```bash
npx tsc --noEmit
```

- Lint all files
```bash
npm run lint
```

- Autofix lint issues
```bash
npm run lint:fix
```

- Run all tests
```bash
npm test
```

- Watch tests
```bash
npm run test:watch
```

- Run a single test file (example)
```bash
npm run test:file -- __tests__/LevelModal.test.tsx
```

Notes
- Linting (ESLint) and testing (Jest with jest-expo) are configured. A sample test exists in __tests__/LevelModal.test.tsx.
- TypeScript strict mode is enabled via tsconfig.json (extends expo/tsconfig.base).
- No native build configuration (EAS or equivalent) is present in this repo; development flows are via Expo start commands above.

High-level architecture and data flow
1) App entry and provider setup
- index.ts calls registerRootComponent(App) to integrate with Expo
- App.tsx wraps the UI with <Provider store={store}> from src/redux/store.ts

2) Redux store and slices
- src/redux/store.ts configures reducers: quiz, modal, coins
- src/redux/slices/quizSlice.ts
  - Tracks quiz progress: currentLevel, currentQuestionIndex, lastColoredLevel
  - Also defines modal-related fields (showModal, modalInfo, highlightedLevel), but these are not used by the current UI layer
- src/redux/slices/modalSlice.ts
  - Dedicated modal state used by the UI: visible, info, highlightedLevel
  - Actions: showModal/hideModal control visibility and the modal payload
- src/redux/slices/coinsSlice.ts
  - Tracks and persists coin count; provides async thunks loadCoins/saveCoins using @react-native-async-storage/async-storage

3) Orchestration in the hook layer
- src/hooks/useQuiz.ts centralizes domain interactions for the Quiz screen
  - Selects quiz, modal, coins from the store
  - answerQuestion(wasCorrect)
    - On correct: computes a reward based on currentLevel (milestones at 3/6/10) and schedules two timeouts:
      1) After 600ms: dispatch showModal({ success: true, rewardCoins, title })
      2) After 2000ms: dispatch setLevel(currentLevel + 1) and incrementCoins(reward)
    - On incorrect: dispatch showModal({ success: false, subtitle: "Keep your progress" })
  - closeModalNow(): hides modal and advances to the next question

4) UI components
- App.tsx renders the quiz screen with header (level and coins), question card, choices, and LevelModal
- src/components/LevelModal.tsx displays a vertically scrollable list of levels (10..1)
  - Highlights the current/milestone level; animates when highlightedLevel increases
  - Shows milestone rewards visually (+10, +20, +50) — note this mirrors the reward logic in the hook

5) Data and styling
- src/data/questions.ts: simple in-memory question set (10 items)
- src/lib/theme.ts: design tokens (spacing, radii, type, colors)

Important implementation notes and gotchas
- Modal state source of truth: The UI consumes state from modalSlice. quizSlice also defines modal-related fields (showModal, modalInfo, highlightedLevel) but these are not wired to the current UI. Prefer modalSlice for modal state to avoid divergence.
- Duplicated reward logic: Reward amounts are computed in useQuiz.ts and also implicitly represented in LevelModal.getRewardForLevel. To prevent drift, consider centralizing reward computation in a single utility (e.g., src/lib/rewards.ts) and reusing it in both places.
- Persistence: coinsSlice includes load/save AsyncStorage thunks. App.tsx currently does not invoke loadCoins on mount (comment hints exist). If persistence on app start is desired, add a useEffect to dispatch loadCoins().

Environment specifics
- Expo 54, React Native 0.81, React 19, TypeScript ~5.9
- tsconfig.json extends expo/tsconfig.base with strict: true
- No README.md, CLAUDE.md, Cursor or Copilot rule files detected in this repo at the time of writing
