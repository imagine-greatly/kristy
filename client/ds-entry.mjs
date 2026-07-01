// Design-system entry for claude.ai/design (/design-sync).
// Re-exports the scoped presentational components as NAMED exports so they
// surface on window.Kristy.* in the synced bundle. The app does not import
// this file — it exists only as the bundle entry for the design-system sync.
export { default as MacroRing } from './src/components/MacroRing.jsx';
export { default as MacroCard } from './src/components/MacroCard.jsx';
export { default as MessageBubble } from './src/components/MessageBubble.jsx';
export { default as TypingIndicator } from './src/components/TypingIndicator.jsx';
export { default as EmptyState } from './src/components/EmptyState.jsx';
export {
  MenuIcon,
  CloseIcon,
  BarcodeIcon,
  CameraIcon,
  ArrowUpIcon,
} from './src/components/Icons.jsx';
