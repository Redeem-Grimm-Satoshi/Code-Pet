<img width="2559" height="1032" alt="Screenshot" src="https://github.com/user-attachments/assets/56aad4b2-f7cc-4fee-8a38-abb234ac317d" />

# Code Companion Pet (VS Code Extension)

A non-interrupting sidebar coding companion.

## What it does

- Lives in the Activity Bar as **Code Pet**
- Reacts to syntax quality:
  - happy when syntax is clean
  - angry when syntax errors are detected
- Tracks cursor movement inside the panel (eyes + head)
- Gains XP and streak on clean saves
- Supports character switch:
  - `dog` (default)
  - `pika`
- Optional soft puppy sounds in dog mode

## Settings namespace

All settings now use:

- `codeCompanionPet.petName` (default: `Zolix`)
- `codeCompanionPet.petCharacter` (`dog` or `pika`)
- `codeCompanionPet.petPuppySounds` (`true`/`false`)

## Commands

- `Code Companion Pet: Test Happy`
- `Code Companion Pet: Test Angry`

## Run locally

1. `npm install`
2. `npm run compile`
3. Press `F5` to launch Extension Development Host
4. Open **Code Pet** icon in the Activity Bar

## Package as VSIX

```bash
npm i -g @vscode/vsce
vsce package
```
