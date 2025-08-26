// shim: keep compatibility for imports that expect "./datamatrix/encoder.js"
export * from './encoder/index.js';

// （念のため主要な default export を名前付きで再公開しておく）
export { default as DefaultPlacement } from './encoder/DefaultPlacement.js';
export { default as ErrorCorrection }  from './encoder/ErrorCorrection.js';
export { default as HighLevelEncoder } from './encoder/HighLevelEncoder.js';
export { default as SymbolInfo }      from './encoder/SymbolInfo.js';
