import React from "react";
import PlayerInfo from "../NHIE/PlayerInfo";
import { useObject, useListVals } from "react-firebase-hooks/database";
import UpdateFinalPoints from "../NHIE/UpdateFinalPoints";
import fire from "../../fire";
import Chat from "./Chat";
import { Link } from "react-router-dom";
import UIfx from "uifx";
import sound from "../../audio/exit.wav";

const db = fire.database();

const EndGame = props => {
  const exit = new UIfx(sound, {
    volume: 0.4, // number between 0.0 ~ 1.0
    throttleMs: 50
  });
  const { players } = props.session;
  const { uid } = props;
  const [playerSnap, loading, error] = useObject(db.ref(`players/${uid}`));
  const [messages, messageLoading, messageError] = useListVals(
    db.ref(`lobbyMessages/${props.code}/messages`)
  );

  if (loading || messageLoading) return "";
  if (error || messageError) return "Error";

  const { totalPoints, totalGamesPlayed, wins } = playerSnap.val();
  const newTP = totalPoints + players[uid].points;
  const newTG = totalGamesPlayed + 1;
  let newWins = wins;
  if (players[uid].points > 0) newWins += 1;
  const updatePointsObj = {
    totalPoints: newTP,
    totalGamesPlayed: newTG,
    wins: newWins
  };

  //need a new reference to players in that session for accurate points
  let winners = [];
  let losers = [];
  props.players.forEach(playerKey => {
    if (players[playerKey].points <= 0) {
      losers.push(playerKey);
    } else {
      winners.push(playerKey);
    }
  });
  let playerKeys = Object.keys(players);
  return (
    <div className="container mt-3">
      <div className="row justify-content-between">
        <div className=" col-6">
          <div
            className="jumbotron text-center border border-dark"
            id="jumboPlayers"
          >
            <h1>Winners</h1>
            {winners.map(winner => (
              <PlayerInfo
                id={winner}
                points={players[winner].points}
                key={winner}
                gameOver={true}
                uid={uid}
                code={props.code}
              />
            ))}
          </div>
        </div>
        <div className="col-6">
          <div
            className="jumbotron text-center border border-dark"
            id="jumboPlayers"
          >
            <h1>Losers</h1>
            {losers.map(loser => (
              <PlayerInfo
                id={loser}
                points={players[loser].points}
                key={loser}
                gameOver={true}
                uid={uid}
                code={props.code}
              />
            ))}
          </div>
        </div>
      </div>
      {playerSnap.ref && (
        <UpdateFinalPoints
          updatePointsObj={updatePointsObj}
          playerSnapRef={playerSnap.ref}
          players={playerKeys}
          userId={uid}
        />
      )}
      <Link to="/games" onClick={() => exit.play()}>
        <button className="btn btn-outline-info">Back to Games</button>
      </Link>
      <Chat
        code={props.code}
        userId={uid}
        players={players}
        messages={messages}
      />
    </div>
  );
};

export default EndGame;
