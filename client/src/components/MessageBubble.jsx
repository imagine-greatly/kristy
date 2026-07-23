import MacroCard from './MacroCard.jsx';

// macroTracking defaults OFF — the coach default. A macro card only ever renders
// for a user who has explicitly opted into macro tracking, so a stale message (or
// the demo/guest path) can never surface calories to a grocery-only user.
export default function MessageBubble({ message, onUpgrade, macroTracking = false }) {
  const { role, content, macros, isSummary } = message;

  if (role === 'user') {
    return (
      <div className="msg-row user">
        <div className="bubble user">{content}</div>
      </div>
    );
  }

  // AI
  const hasMacros = macroTracking && macros && typeof macros.calories === 'number';
  return (
    <div className="msg-row ai">
      <div className="avatar">K</div>
      <div className="ai-col">
        {isSummary && <span className="summary-tag">Weekly recap</span>}
        {message.image && (
          <img className="ai-photo" src={message.image} alt="Logged meal" />
        )}
        <div className="bubble ai">{content}</div>
        {hasMacros && (
          <MacroCard
            macros={macros}
            insight={macros.insight}
            isEstimate={macros.isEstimate}
            estimateNote={macros.estimateNote}
          />
        )}
        {/* A locked-feature reply (weigh-in / history recall for a free user):
            Kristy's line lands as a normal bubble, with a quiet upgrade link. */}
        {message.upgrade && onUpgrade && (
          <button className="bubble-upgrade" onClick={onUpgrade}>
            Unlock coaching →
          </button>
        )}
      </div>
    </div>
  );
}
