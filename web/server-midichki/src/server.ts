import express from 'express';
import bodyParser from 'body-parser';
import logger from './logger';
import CyclicBuffer from './cyclic_buffer';
import config from './config';

const app = express();
const port = process.env.PORT || 8080; // default port to listen
const cyclicBuffer = new CyclicBuffer(config.notesBufferSize);

app.use(bodyParser.json());

function sendResponse(res: any, toSend: any) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.send(toSend);
}

// define a route handler for the default home page
app.get('/getAll', (req, res) => {
  sendResponse(res, cyclicBuffer.readAll());
});

app.get('/getFrom/:after', (req, res) => {
  cyclicBuffer.deleteOld(60);

  const after = req.params.after;
  const notes = cyclicBuffer.readAll().filter((val) => {
    return val[5] > after;
  });

  logger.info(`Sending notes after ${after}, size = ${notes.length}`);
  sendResponse(res, notes);
});

app.post('/postNotes', (req, res) => {
  const receivedData = req.body;
  logger.info('Got ' + req.body + ', demek:: ' + JSON.stringify(receivedData));

  cyclicBuffer.addMultiple(receivedData);
  sendResponse(res, 'Thanks');
});

// start the Express server
app.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});
