import React from 'react'
import fire from '../../fire'
import {useList} from 'react-firebase-hooks/database'
import GameCard from './GameCard'
import RoomCodeForm from './RoomCodeForm'
import {Container, Row, Col} from 'react-bootstrap'

const db = fire.database()
const gamesRef = db.ref('games')

const GamePage = props => {
  const {userId, history} = props
  console.log(userId)
  const [games, loading, error] = useList(gamesRef)

  if (loading) return ''
  if (error) return <p>Error</p>

  return (
    <div>
      <div className="jumbotron text-center">
        <h1>Games</h1>
      </div>
      <Container fluid>
        <Row>
          <Col>
            {games.map(game => (
              <GameCard
                key={game.key}
                gameRef={game.ref}
                gameId={game.key}
                uid={userId}
                history={history}
              />
            ))}
          </Col>
          <Col>
            <RoomCodeForm uid={userId} history={history} />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default GamePage
