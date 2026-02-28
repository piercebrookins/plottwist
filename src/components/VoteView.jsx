import { Screen } from "./Layout";

export const VoteView = ({ session, me, round, onVote, onFinishVoting }) => {
  const mySubmission = round.submissions.find((s) => s.playerId === me.id);
  const myVote = round.votes.find((v) => v.voterId === me.id);

  return (
    <Screen
      title="Vote for your favorite"
      subtitle="Anonymous voting now. Reveal chaos in a sec."
      actions={me.isHost ? <button onClick={onFinishVoting}>Score round</button> : null}
    >
      <div className="card">
        <ul className="clean-list spaced">
          {round.submissions.map((submission) => {
            const disabled = submission.id === mySubmission?.id;
            const selected = myVote?.submissionId === submission.id;
            return (
              <li key={submission.id}>
                <button
                  disabled={disabled}
                  className={`mobile-vote-option ${selected ? "selected" : ""}`}
                  onClick={() => onVote(submission.id)}
                >
                  <span className="mobile-vote-content">
                    <span className="mobile-vote-answer">{submission.generatedScene}</span>
                    <span className="mobile-vote-author">{disabled ? "Your entry" : "Tap to vote"}</span>
                  </span>
                  <span className="mobile-vote-check">✓</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Screen>
  );
};
