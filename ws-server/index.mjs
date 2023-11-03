import { WebSocketServer } from 'ws';
import os from 'os';

const PORT = process.env.PORT || 8080;

console.log(`starting websocket server on port ${PORT}`);

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', console.log);

wss.on('connection', function connection(ws) {
  console.log('incoming connection');

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('[server]r eceived: %s', data);
  });

  sendTestMessage(ws);

  const interval = setInterval(
    () => {
      sendTestMessage(ws);
    },
    parseInt(process.env.MSG_INTERVAL) || 5000,
  );

  ws.on('close', (code, reason) => {
    console.log('connection closed', code, reason.toString());
    clearInterval(interval);
  });
});

function sendTestMessage(ws) {
  console.log('sending a message');
  ws.send(JSON.stringify({ timestamp: new Date().toISOString() }));
}

/**
 * this is necessary for docker container to be stopped by docker compose quickly
 */
['SIGHUP', 'SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(
      `process received a ${signal} (${os.constants.signals[signal]}) signal`,
    );

    process.on('exit', (code) => {
      console.log(`exiting with code ${code}`);
    });

    process.exit(os.constants.signals[signal] + 128);
  });
});
