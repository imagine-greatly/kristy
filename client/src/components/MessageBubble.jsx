// Kristy is a grocery coach — no macro cards, ever. An AI bubble renders her text,
// the weekly-recap tag, and (for a locked free-user reply) a quiet upgrade link.
export default function MessageBubble({ message, onUpgrade }) {
  const { role, content, isSummary } = message;

  if (role === 'user') {
    return (
      <div className="msg-row user">
        <div className="bubble user">{content}</div>
      </div>
    );
  }

  // AI
  return (
    <div className="msg-row ai">
      <div className="avatar">K</div>
      <div className="ai-col">
        {isSummary && <span className="summary-tag">Weekly recap</span>}
        <div className="bubble ai">{content}</div>
        {/* A locked-feature reply for a free user: Kristy's line lands as a normal
            bubble, with a quiet upgrade link. */}
        {message.upgrade && onUpgrade && (
          <button className="bubble-upgrade" onClick={onUpgrade}>
            Unlock coaching →
          </button>
        )}
      </div>
    </div>
  );
}
