// Регулярное выражение с катастрофическим перебором может работать минутами.
// В воркере это не вешает страницу: по таймауту его просто завершают.
import { runJob, type Job } from './regex';

self.onmessage = (e: MessageEvent<Job>) => postMessage(runJob(e.data));
