document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameCode = urlParams.get('code');
  const $status = $('#status');
  const $pgn = $('#pgn');
  let gameHasStarted = false;
  let gameOver = false;
  let gameOverReason = null;

  const game = new Chess();

  const config = {
    draggable: true,
    position: 'start',
    onDragStart,
    onDrop,
    onSnapEnd,
    pieceTheme: '/img/chesspieces/wikipedia/{piece}.png',
  };
  const board = Chessboard('myBoard', config);

  if (playerColor === 'black') {
    board.flip();
  }

  function onDragStart(source, piece) {
    if (game.game_over() || !gameHasStarted || gameOver) return false;

    if (
      (playerColor === 'black' && piece.startsWith('w')) ||
      (playerColor === 'white' && piece.startsWith('b'))
    ) {
      return false;
    }

    if (
      (game.turn() === 'w' && piece.startsWith('b')) ||
      (game.turn() === 'b' && piece.startsWith('w'))
    ) {
      return false;
    }
  }

  const moveSound = new Audio('/sounds/move-self.mp3');

  function onDrop(source, target) {
    const theMove = {
      from: source,
      to: target,
      promotion: 'q',
    };

    const move = game.move(theMove);
    if (move === null) return 'snapback';

    socket.emit('move', theMove);
    updateStatus();
    moveSound.play();
  }

  function onSnapEnd() {
    board.position(game.fen());
  }

  function updateStatus() {
    let status = '';
    const moveColor = game.turn() === 'w' ? 'White' : 'Black';

    if (game.in_checkmate()) {
      status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
      status = 'Game over, drawn position';
    } else if (gameOver) {
      switch (gameOverReason) {
        case 'resign':
          status = 'You resigned. Game over.';
          break;
        case 'winByResign':
          status = 'Opponent resigned. You win!';
          break;
        case 'disconnect':
          status = 'Opponent disconnected, you win!';
          break;
        default:
          status = 'Game over.';
      }
    } else if (!gameHasStarted) {
      status = 'Waiting for black to join';
    } else {
      status = `${moveColor} to move`;
      if (game.in_check()) status += `, ${moveColor} is in check`;
    }

    $status.html(status);
    $pgn.html(`<pre>${game.pgn()}</pre>`);
  }

  socket.on('newMove', (move) => {
    game.move(move);
    board.position(game.fen());
    updateStatus();

    moveSound.play();
  });

  socket.on('startGame', () => {
    gameHasStarted = true;
    updateStatus();
  });

  socket.on('opponentResigned', ({ username }) => {
    alert(`${username} resigned. You win!`);
    gameOver = true;
    gameOverReason = 'winByResign';
    updateStatus();
    showGameOverModal(`${username} resigned. You win!`);
  });

  socket.on('gameOverDisconnect', () => {
    gameOver = true;
    gameOverReason = 'disconnect';
    updateStatus();
    showGameOverModal('Opponent disconnected. You win!');
  });

  socket.on('chatMessage', ({ username, message }) => {
    $('#messages').append(`<div><strong>${username}:</strong> ${message}</div>`);
  });

  socket.on('rematchRequested', ({ username }) => {
    if (confirm(`${username} wants a rematch. Accept?`)) {
      socket.emit('acceptRematch', { code: gameCode, username: playerUsername });
    }
  });

  socket.on('startRematch', () => {
    resetGame();
    alert('Rematch started!');
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('rematchModalBtn').disabled = false;
  });

  document.getElementById('resignBtn').addEventListener('click', onResignClicked);
  document.getElementById('rematchModalBtn').addEventListener('click', onRequestRematch);
  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.location.href = '/';
  });

  $('#sendMessage').on('click', () => {
    const message = $('#chatInput').val().trim();
    if (message) {
        console.log('Sending message:', message);

      socket.emit('chatMessage', {
        code: gameCode,
        username: playerUsername,
        message,
      });
      $('#chatInput').val('');
    }
  });

  function onResignClicked() {
    if (gameOver) return;
    if (confirm('Are you sure you want to resign?')) {
      socket.emit('resign', { code: gameCode, username: playerUsername });
      gameOver = true;
      gameOverReason = 'resign';
      updateStatus();
      document.getElementById('resignBtn').disabled = true;
      showGameOverModal('You resigned. You lost.');
    }
  }

  function onRequestRematch() {
    socket.emit('requestRematch', { code: gameCode, username: playerUsername });
  }

  function showGameOverModal(message) {
    const modal = document.getElementById('gameOverModal');
    const msgElem = document.getElementById('gameOverMessage');
    msgElem.textContent = message;
    modal.style.display = 'flex';
    gameOver = true;
  }

  function resetGame() {
    game.reset();
    board.start();
    gameOver = false;
    gameOverReason = null;
    gameHasStarted = true;
    updateStatus();
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('resignBtn').disabled = false;
  }


  if (gameCode) {
    socket.emit('joinGame', { code: gameCode });
  }

  updateStatus();
});
