export default function(io) {
    io.on('connection', socket => {
        console.log('New socket connection');

        let currentCode = null;

        socket.on('move', function(move) {
            console.log('move detected')

            io.to(currentCode).emit('newMove', move);
        });
        
        socket.on('joinGame', function(data) {

            currentCode = data.code;
            socket.join(currentCode);
            if (!games[currentCode]) {
                games[currentCode] = true;
                return;
            }
            
            io.to(currentCode).emit('startGame');
        });

        socket.on('resign', ({ code, username }) => {
  socket.to(code).emit('opponentResigned', { username });
});


    socket.on('requestRematch', ({ code, username }) => {
      socket.to(code).emit('rematchRequested', { username });
    });

        socket.on('acceptRematch', ({ code, username }) => {
      io.to(code).emit('startRematch');
    });

    socket.on('chatMessage', ({ code, username, message }) => {
  io.to(code).emit('chatMessage', { username, message });
});

        socket.on('disconnect', function() {
            console.log('socket disconnected');

            if (currentCode) {
                io.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode];
            }
        });

    });
};