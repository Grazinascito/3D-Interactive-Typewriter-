import { KeyConfig } from '../types';

export const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 0: Numbers & Symbols (12 keys)
  [
    { id: 'key-1', char: '1', shiftChar: '!', code: 'Digit1', row: 0, col: 0, label: '1', subLabel: '!' },
    { id: 'key-2', char: '2', shiftChar: '"', code: 'Digit2', row: 0, col: 1, label: '2', subLabel: '"' },
    { id: 'key-3', char: '3', shiftChar: '#', code: 'Digit3', row: 0, col: 2, label: '3', subLabel: '#' },
    { id: 'key-4', char: '4', shiftChar: '$', code: 'Digit4', row: 0, col: 3, label: '4', subLabel: '$' },
    { id: 'key-5', char: '5', shiftChar: '%', code: 'Digit5', row: 0, col: 4, label: '5', subLabel: '%' },
    { id: 'key-6', char: '6', shiftChar: '&', code: 'Digit6', row: 0, col: 5, label: '6', subLabel: '&' },
    { id: 'key-7', char: '7', shiftChar: "'", code: 'Digit7', row: 0, col: 6, label: '7', subLabel: "'" },
    { id: 'key-8', char: '8', shiftChar: '(', code: 'Digit8', row: 0, col: 7, label: '8', subLabel: '(' },
    { id: 'key-9', char: '9', shiftChar: ')', code: 'Digit9', row: 0, col: 8, label: '9', subLabel: ')' },
    { id: 'key-0', char: '0', shiftChar: '_', code: 'Digit0', row: 0, col: 9, label: '0', subLabel: '_' },
    { id: 'key-minus', char: '-', shiftChar: '+', code: 'Minus', row: 0, col: 10, label: '-', subLabel: '+' },
    { id: 'key-equal', char: '=', shiftChar: '?', code: 'Equal', row: 0, col: 11, label: '=', subLabel: '?' },
  ],
  // Row 1: QWERTY + TAB + BACK (12 keys)
  [
    { id: 'key-tab', char: '\t', code: 'Tab', row: 1, col: 0, label: 'TAB', colorType: 'sage', isSpecial: true },
    { id: 'key-q', char: 'q', shiftChar: 'Q', code: 'KeyQ', row: 1, col: 1, label: 'Q' },
    { id: 'key-w', char: 'w', shiftChar: 'W', code: 'KeyW', row: 1, col: 2, label: 'W' },
    { id: 'key-e', char: 'e', shiftChar: 'E', code: 'KeyE', row: 1, col: 3, label: 'E' },
    { id: 'key-r', char: 'r', shiftChar: 'R', code: 'KeyR', row: 1, col: 4, label: 'R' },
    { id: 'key-t', char: 't', shiftChar: 'T', code: 'KeyT', row: 1, col: 5, label: 'T' },
    { id: 'key-y', char: 'y', shiftChar: 'Y', code: 'KeyY', row: 1, col: 6, label: 'Y' },
    { id: 'key-u', char: 'u', shiftChar: 'U', code: 'KeyU', row: 1, col: 7, label: 'U' },
    { id: 'key-i', char: 'i', shiftChar: 'I', code: 'KeyI', row: 1, col: 8, label: 'I' },
    { id: 'key-o', char: 'o', shiftChar: 'O', code: 'KeyO', row: 1, col: 9, label: 'O' },
    { id: 'key-p', char: 'p', shiftChar: 'P', code: 'KeyP', row: 1, col: 10, label: 'P' },
    { id: 'key-back', char: '\b', code: 'Backspace', row: 1, col: 11, label: 'BACK', colorType: 'sage', isSpecial: true },
  ],
  // Row 2: ASDFGHJKL + RETURN (12 keys)
  [
    { id: 'key-caps', char: '', code: 'CapsLock', row: 2, col: 0, label: 'LOCK', colorType: 'sage', isSpecial: true },
    { id: 'key-a', char: 'a', shiftChar: 'A', code: 'KeyA', row: 2, col: 1, label: 'A' },
    { id: 'key-s', char: 's', shiftChar: 'S', code: 'KeyS', row: 2, col: 2, label: 'S' },
    { id: 'key-d', char: 'd', shiftChar: 'D', code: 'KeyD', row: 2, col: 3, label: 'D' },
    { id: 'key-f', char: 'f', shiftChar: 'F', code: 'KeyF', row: 2, col: 4, label: 'F' },
    { id: 'key-g', char: 'g', shiftChar: 'G', code: 'KeyG', row: 2, col: 5, label: 'G' },
    { id: 'key-h', char: 'h', shiftChar: 'H', code: 'KeyH', row: 2, col: 6, label: 'H' },
    { id: 'key-j', char: 'j', shiftChar: 'J', code: 'KeyJ', row: 2, col: 7, label: 'J' },
    { id: 'key-k', char: 'k', shiftChar: 'K', code: 'KeyK', row: 2, col: 8, label: 'K' },
    { id: 'key-l', char: 'l', shiftChar: 'L', code: 'KeyL', row: 2, col: 9, label: 'L' },
    { id: 'key-semi', char: ';', shiftChar: ':', code: 'Semicolon', row: 2, col: 10, label: ';', subLabel: ':' },
    { id: 'key-return', char: '\n', code: 'Enter', row: 2, col: 11, label: 'RETURN', colorType: 'sage', isSpecial: true },
  ],
  // Row 3: ZXCVBNM + SHIFT (11 keys)
  [
    { id: 'key-shift-l', char: '', code: 'ShiftLeft', row: 3, col: 0, label: 'SHIFT', colorType: 'sage', isSpecial: true },
    { id: 'key-z', char: 'z', shiftChar: 'Z', code: 'KeyZ', row: 3, col: 1, label: 'Z' },
    { id: 'key-x', char: 'x', shiftChar: 'X', code: 'KeyX', row: 3, col: 2, label: 'X' },
    { id: 'key-c', char: 'c', shiftChar: 'C', code: 'KeyC', row: 3, col: 3, label: 'C' },
    { id: 'key-v', char: 'v', shiftChar: 'V', code: 'KeyV', row: 3, col: 4, label: 'V' },
    { id: 'key-b', char: 'b', shiftChar: 'B', code: 'KeyB', row: 3, col: 5, label: 'B' },
    { id: 'key-n', char: 'n', shiftChar: 'N', code: 'KeyN', row: 3, col: 6, label: 'N' },
    { id: 'key-m', char: 'm', shiftChar: 'M', code: 'KeyM', row: 3, col: 7, label: 'M' },
    { id: 'key-comma', char: ',', shiftChar: '<', code: 'Comma', row: 3, col: 8, label: ',', subLabel: '<' },
    { id: 'key-period', char: '.', shiftChar: '>', code: 'Period', row: 3, col: 9, label: '.', subLabel: '>' },
    { id: 'key-shift-r', char: '', code: 'ShiftRight', row: 3, col: 10, label: 'SHIFT', colorType: 'sage', isSpecial: true },
  ],
  // Row 4: Spacebar (1 wide key)
  [
    { id: 'key-space', char: ' ', code: 'Space', row: 4, col: 0, label: '', width: 7.2, isSpecial: false },
  ]
];

export const ALL_KEYS: KeyConfig[] = KEYBOARD_ROWS.flat();
