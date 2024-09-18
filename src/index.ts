import { getDatabase, getState, importData } from './database';
import { vectorSearchIndexRange } from './search';
import './style.css';
import { getVectorFromTextWithWorker } from './worker-scheduler';

import { ensureNotFalsy, getFromMapOrThrow } from 'rxdb/plugins/core';

async function run() {
  const db = await getDatabase();
  const state = await getState();

  console.log('Database initialized');
  const itemCount = await db.items.count().exec();
  const vectorCount = await db.vectors.count().exec();
  console.log(
    `Initial database state: ${itemCount} items, ${vectorCount} vectors`,
  );
  if (itemCount > 0) {
    console.log('Sample items:', await db.items.find().limit(5).exec());
  }
  if (vectorCount > 0) {
    console.log('Sample vectors:', await db.vectors.find().limit(5).exec());
  }

  // const exported = await db.vectors.exportJSON();
  // console.log(JSON.stringify(exported.docs.map(d => d)));

  let t = performance.now();
  function time(ctx: string) {
    const diff = performance.now() - t;
    t = performance.now();
    console.log('time(' + ctx + ') ' + diff);
    return diff;
  }

  const $queryInput: HTMLInputElement = ensureNotFalsy(
    document.getElementById('query-input'),
  ) as any;
  const $queryButton = ensureNotFalsy(document.getElementById('query-button'));
  const $queryString = ensureNotFalsy(document.getElementById('query-string'));
  const $buttonImportPlain: HTMLButtonElement = ensureNotFalsy(
    document.getElementById('button-import-plain'),
  ) as any;
  const $buttonImportEmbeddings: HTMLButtonElement = ensureNotFalsy(
    document.getElementById('button-import-embeddings'),
  ) as any;
  const $list = ensureNotFalsy(document.getElementById('list'));
  $queryButton.onclick = () => {
    const searchString = $queryInput.value;
    submit(searchString);
  };

  if (state.importDone) {
    $buttonImportEmbeddings.disabled = true;
    $buttonImportPlain.disabled = true;
  }
  $buttonImportPlain.onclick = () => {
    $buttonImportEmbeddings.disabled = true;
    $buttonImportPlain.disabled = true;
    importData();
  };
  $buttonImportEmbeddings.onclick = () => {
    $buttonImportEmbeddings.disabled = true;
    $buttonImportPlain.disabled = true;
    importData();
  };
  async function submit(searchString: string) {
    if (!state.importDone) {
      alert(
        'Before you can run a query, click on one of the import buttons above to import some data.',
      );
      return;
    }
    $queryString.innerHTML = 'QUERY STRING: ' + searchString;
    $list.innerHTML = '';
    // const searchString = randomOfArray(WIKI_DATA).body;
    time('START create search embedding ' + performance.now());
    const searchEmbedding = await getVectorFromTextWithWorker(searchString);
    time('DONE create search embedding ' + performance.now());

    time('START SEARCH vectorSearchIndexRange ' + performance.now());
    const results = await vectorSearchIndexRange(db.vectors, searchEmbedding);
    console.dir({ results });

    const sourceDocs = await db.items
      .findByIds(results.result.map((r: any) => r.doc.primary))
      .exec();
    $list.innerHTML = results.result
      .map((r: any, idx) => {
        const doc = getFromMapOrThrow(sourceDocs, r.doc.primary);
        const item = {
          id: doc.id,
          title: doc.title,
          body: doc.body,
        };
        const textHtml = textToHtml(item, idx + 1);
        return textHtml;
      })
      .join('');
  }
}
run();

function textToHtml(
  item: { id: string; title: string; body: string },
  nr: number,
) {
  if (!item || !item.body) {
    return '<p>No content available</p>';
  }

  const title = item.title || 'Untitled';
  const content = item.body; // Remove the truncation

  return `<h3><b>${nr}.</b> ${title}</h3><p>${content}</p><hr />`;
}
