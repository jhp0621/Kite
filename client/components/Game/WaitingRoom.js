import React, { useState, useEffect } from "react";
import fire from "../../fire";
import { useObjectVal, useListVals } from "react-firebase-hooks/database";
import SessionPlayer from "./SessionPlayers";
import { Button } from "react-bootstrap";
import NotFound from "../NotFound";
import axios from "axios";
import { useHistory } from "react-router";
import Chat from "./Chat";
import { generateTargetWord } from "../RopeDude/util";
import ViewRP from "./ViewRP";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UIfx from "uifx";
import sound from "../../audio/pop.ogg";
import sound2 from "../../audio/cancel.ogg";

const db = fire.database();

// eslint-disable-next-line complexity
const WaitingRoom = props => {
  const enter = new UIfx(sound, {
    volume: 0.3, // value must be between 0.0 ⇔ 1.0
    throttleMs: 50
  });
  const cancel = new UIfx(sound2, {
    volume: 0.3, // value must be between 0.0 ⇔ 1.0
    throttleMs: 50
  });

  let history = useHistory();
  //getting that session info
  const { code, userId, host, gameId } = props;
  const [game, gameLoading, gameErr] = useObjectVal(db.ref(`games/${gameId}`));
  const gameSession = db.ref("gameSessions/" + code);
  const [session, loading, error] = useObjectVal(gameSession);
  const [messages, messageLoading, messageError] = useListVals(
    db.ref(`lobbyMessages/${props.code}/messages`)
  );
  const [toggle, setToggle] = useState(false);

  //play sound when a new player enters the room
  useEffect(() => {
    db.ref(`gameSessions/${code}/players`).on("child_added", playerSnap => {
      enter.play();
    });
  }, []);

  if (loading || gameLoading || messageLoading) return "";
  if (error || gameErr || messageError) return "Error";
  if (!session)
    return (
      <div>
        <NotFound />
      </div>
    );

  //getting players from the session
  let players = Object.keys(session.players);

  const handleClick = () => {
    try {
      //for rope dude, generate a random word for the session
      if (gameId === "2") {
        const targetWord = generateTargetWord();
        db.ref(`gameSessions/${code}/targetWord`).set(targetWord);
      }
      //for drawing a blank, generate a random word per player
      if (gameId === "3") {
        players.forEach(player => {
          const targetWord = generateTargetWord();
          db
            .ref(`gameSessions/${code}/players/${player}/targetWord`)
            .set(targetWord);
          db.ref(`gameSessions/${code}/turnTimeStarted`).set(Date.now());
        });
      }
      //updating that session status to playing
      axios.post(`/api/games/${code}`, { status: "playing" });
    } catch (err) {
      console.log("error switching game to playing");
    }
  };
  const cancelGame = () => {
    cancel.play();
    history.push("/games");
    gameSession.remove();
  };

  return (
    <>
      {players.includes(`${userId}`) ? (
        <Container>
          <Row className="justify-content-between align-items-center mt-3">
            <button
              type="button"
              className="btn btn-outline-info"
              onClick={() => setToggle(!toggle)}
            >
              View Recent Players
            </button>
            {toggle && <ViewRP uid={userId} code={code} gameId={gameId} />}
            {host && (
              <Button
                className="btn alert-danger border border-danger btn-outline-danger"
                onClick={cancelGame}
              >
                Cancel Game
              </Button>
            )}
          </Row>
          <Row className="justify-content-center mt-3 mb-3">
            <h2>
              <strong>
                Give your friends this code to invite them to your game:
              </strong>
            </h2>
          </Row>
          <Row className="justify-content-center mt-3 mb-3">
            <h2 className="alert alert-info" role="alert">
              <strong>{code}</strong>
            </h2>
          </Row>
          <Row>
            <h3>Rules: {game.rules}</h3>
          </Row>
          <Row className="justify-content-center m-3">
            {gameId === "2" && host ? (
              <Button className="btn btn-info btn-lg" onClick={handleClick}>
                Start Game
              </Button>
            ) : host && players.length > 1 ? (
              <Button className="btn btn-info btn-lg" onClick={handleClick}>
                Start Game
              </Button>
            ) : (
              <h1>Waiting for more players!</h1>
            )}
          </Row>
          <Row>
            <Col>
              <Row className="justify-content-center">
                <h3>
                  <u>Players</u>
                </h3>
              </Row>
              <Row className="justify-content-center mb-3">
                {players.map(player => (
                  <SessionPlayer key={player} player={player} />
                ))}
              </Row>
            </Col>
            <Col>
              <Chat
                code={code}
                userId={userId}
                players={players}
                messages={messages}
              />
            </Col>
          </Row>
        </Container>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default WaitingRoom;
