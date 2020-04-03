import React from "react";
import { useObjectVal } from "react-firebase-hooks/database";
import fire from "../../fire";
import Stats from "./Stats";
import RecentPlayers from "./RecentPlayers";

export default function Profile(props) {
  const { userId } = props;
  const playerRef = fire.database().ref(`players/${userId}`);

  const [player, loading, err] = useObjectVal(playerRef);

  if (loading) {
    return "";
  }
  if (err) {
    return <div>error!</div>;
  }
  if (player) {
    return (
      <div>
        <div className="jumbotron text-center alert-dark">
          <h1>
            <strong>Welcome to Your Profile {player.nickname}</strong>
          </h1>
        </div>
        <div className="col mb-4 align-self-center">
          <Stats player={player} />
          {player.recentPlayers && (
            <div className="column m-5">
              <RecentPlayers recents={player.recentPlayers} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
