import MacroCard from './MacroCard.jsx';

export default function MessageBubble({ message }) {
  const { role, content, macros, isSummary } = message;

  if (role === 'user') {
    return (
      <div className="msg-row user">
        <div className="bubble user">{content}</div>
      </div>
    );
  }

  // AI
  const hasMacros = macros && typeof macros.calories === 'number';
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
      </div>
    </div>
  );
}
