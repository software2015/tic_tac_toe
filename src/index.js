import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={(props.winner_row != null && props.winner_row.includes(props.square_id)) ? "square highlight" : "square"} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        square_id={i}
        winner_row={this.props.winner_row}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(increase) {
    var squares = [];
    for (var i = 0; i < 3; i++) {
      squares.push(this.renderSquare(i + increase));
    }
    return squares;
  }

  renderBoard() {
    var rows = [];
    var increase = 0;
    for (var i = 0; i < 3; i++) {
      rows.push(<div className="board-row">{this.renderRow(increase)}</div>);
      increase += 3
    }
    return rows;
  }

  render() {
    return (
      <div>
        {this.renderBoard()}
      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        boxNumber: null, //For tracking the position of the input
      }],
      xIsNext: true,
      stepNumber: 0,
      historyReverse: false
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        boxNumber: i
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  reverseHistory(){
    this.setState({
      historyReverse: !this.state.historyReverse
    })
  }

  render() {
    const max_moves = 9
    const history = this.state.history
    const current = history[this.state.stepNumber];
    const winner_info = calculateWinner(current.squares)
    const winner = winner_info ? winner_info.winner : null
    const winner_row = winner_info ? winner_info.winner_row : null

    const moves = history.map((step, move) => {
      const desc = move ?
        'Вернуться к ходу #' + move + findPosition(step.boxNumber) :
        'Вернуться к началу';
      return (
        <ul key={move} className="list-group">
          <button className={(this.state.stepNumber == move) ? "bold list-group-item" : "list-group-item"} onClick={() => this.jumpTo(move)}>{desc}</button>
        </ul>
      );
    });

    var moves_ordered = this.state.historyReverse ? moves.reverse() : moves

    let status;
    if (winner) {
      status = 'Победитель: ' + winner;
    } else if (this.state.stepNumber == max_moves){
      status = 'Ничья';
    } else {
      status = 'Следующий игрок: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game row">
        <div className="game-board col-lg-6 col-md-6 col-sm-6 col-xs-6">
          <Board
            winner_row={winner_row}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info col-lg-6 col-md-6 col-sm-6 col-xs-6">
          <div className="status">{status}</div>
          <ul>{moves_ordered}</ul>
          <button className="btn-success" onClick={() => this.reverseHistory()}>Поменять порядок истории</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function findPosition(boxNumber){
  if (boxNumber < 3){
    return(" x: " + boxNumber + " y: 2" );
  } else if(boxNumber >=3 && boxNumber < 6){
    return(" x: " + (boxNumber - 3) + " y: 1" );
  } else{
    return(" x: " + (boxNumber - 6) + " y: 0" );    
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {winner: squares[a], winner_row: [a,b,c]};
    }
  }
  return null;
}
