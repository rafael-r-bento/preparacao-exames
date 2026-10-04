import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { Subject } from './app/features/subjects/subject';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.use(express.json());
const angularApp = new AngularNodeAppEngine();

import * as fs from 'fs';

app.get('/api/subjects', (req, res) => {
  try {
    const exams = JSON.parse(fs.readFileSync("subjects.json", "utf-8"));
    res.send(exams);
  } catch(error: unknown) {
    if (error instanceof Error) {
      res.status(500);
      res.send({ message: error.message});
    }
  }
});

app.patch('/api/subjects', (req, res) => {
  try {
    const name = req.body.name;
    if (name) {
      const modifications = req.body;
      const currentSubjects = JSON.parse(fs.readFileSync("subjects.json", "utf-8"));
      const modifiedIndex = currentSubjects.findIndex((subject: Subject) => subject.name === name);
      const changedSubject = { ...currentSubjects[modifiedIndex], ...modifications};
      currentSubjects[modifiedIndex] = changedSubject;
      fs.writeFileSync("subjects.json", JSON.stringify(currentSubjects, null, 2));
      res.send({ message: 'Assunto modificado com sucesso' });
    } else {
      res.status(422);
      res.send({ message: 'Nome inválido' });
    }
  } catch(error: unknown) {
    if (error instanceof Error) {
      res.status(500);
      res.send({ message: error.message});
    }
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
