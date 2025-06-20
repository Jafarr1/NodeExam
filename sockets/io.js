export default function(io) {
    io.on('connection', socket => {
        

        let currentCode = null;

        socket.on('move', function(move) {
            

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
            

            if (currentCode) {
                io.to(currentCode).emit('gameOverDisconnect');
                delete games[currentCode];
            }
        });

    });
};