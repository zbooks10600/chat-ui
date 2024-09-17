import {
    RxCollection,
    RxDatabase,
    RxDocument,
    RxState,
    addRxPlugin,
    createRxDatabase,
    ensureNotFalsy

} from "rxdb/plugins/core";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { wrappedValidateAjvStorage } from "rxdb/plugins/validate-ajv";
import { getVectorFromText } from './vector';
import { INDEX_VECTORS } from '../utils/indexVectors';
import { RxDBPipelinePlugin } from 'rxdb/plugins/pipeline';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { getVectorFromTextWithWorker } from './worker-scheduler';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBStatePlugin } from 'rxdb/plugins/state';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder'


const indexSchema = {
    type: 'string',
    maxLength: 10
};

let dbPromise: Promise<RxDatabase>;

export async function getDatabase() {
    if (dbPromise) {
        return dbPromise;
    }
    addRxPlugin(RxDBQueryBuilderPlugin);
    addRxPlugin(RxDBStatePlugin);
    addRxPlugin(RxDBJsonDumpPlugin);
    addRxPlugin(RxDBPipelinePlugin);
    addRxPlugin(RxDBLeaderElectionPlugin);

    dbPromise = (async () => {
        const db = await createRxDatabase({
            name: "mydb",
            storage: getRxStorageDexie()
            // storage: wrappedValidateAjvStorage({
            //     storage: getRxStorageDexie()
            // }),
        });


        (window as any).db = db;

        await db.addCollections({
            items: {
                schema: {
                    "version": 0,
                    "primaryKey": "id",
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "string",
                            "maxLength": 100
                        },
                        "source": {
                            "type": "string"
                        },
                        "body": {
                            "type": "string"
                        }
                    },
                    "required": [
                        "id",
                        "source",
                        "body"
                    ]
                }
            },
            vectors: {
                schema: {
                    "version": 0,
                    "primaryKey": "id",
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "string",
                            "maxLength": 100
                        },
                        "embedding": {
                            "type": "array",
                            "items": {
                                "type": "number"
                            }
                        },
                        // index fields
                        "idx0": indexSchema,
                        "idx1": indexSchema,
                        "idx2": indexSchema,
                        "idx3": indexSchema,
                        "idx4": indexSchema
                    },
                    "required": [
                        "id",
                        "embedding",
                        "idx0",
                        "idx1",
                        "idx2",
                        "idx3",
                        "idx4"
                    ],
                    "indexes": [
                        "idx0",
                        "idx1",
                        "idx2",
                        "idx3",
                        "idx4"
                    ]
                }
            }
        });
        return db;
    })();

    return dbPromise;
}


export type State = {
    importDone: boolean;
};
let statePromise: Promise<RxState<State>>;
export async function getState() {
    if (!statePromise) {
        statePromise = (async () => {
            const db = await getDatabase();
            return db.addState<State>();
        })();
    }
    return statePromise;

}

export async function importData() {
    const db = await getDatabase();
    const state = await getState();
    const initialItemCount = await db.items.count().exec();
    const initialVectorCount = await db.vectors.count().exec();
    console.log(`Before import: ${initialItemCount} items, ${initialVectorCount} vectors`);

    if (initialItemCount < 10000) {
        console.log('IMPORTING ITEMS START');
        
        console.log('Importing items with embeddings');
        const itemsResponse = await fetch('./files/items.json');
        if (!itemsResponse.ok) {
            throw new Error(`HTTP error! status: ${itemsResponse.status}`);
        }
        const items = await itemsResponse.json();
        
        const embeddingsResponse = await fetch('./files/embeddings.json');
        if (!embeddingsResponse.ok) {
            throw new Error(`HTTP error! status: ${embeddingsResponse.status}`);
        }
        const embeddings = await embeddingsResponse.json();
        
        const startTime = performance.now();
        
        const vectorInsertResult = await db.vectors.bulkInsert(embeddings);
        console.log('Vector bulk insert result:', vectorInsertResult);
        
        const itemInsertResult = await db.items.bulkInsert(items);
        console.log('Item bulk insert result:', itemInsertResult);
        
        const time = performance.now() - startTime;
        console.log('IMPORTING ITEMS AND VECTORS DONE ' + time);

    } else {
        console.log('Skipping item import, database already has 10000 or more items');
    }

    const finalItemCount = await db.items.count().exec();
    const finalVectorCount = await db.vectors.count().exec();
    const importedItems = finalItemCount - initialItemCount;
    const importedVectors = finalVectorCount - initialVectorCount;
    console.log(`After import: ${finalItemCount} items, ${finalVectorCount} vectors`);
    console.log(`Imported: ${importedItems} items, ${importedVectors} vectors`);
}


// TODO import from rxdb
export function euclideanDistance(A: number[], B: number[]): number {
    return Math.sqrt(A.reduce((sum, a, i) => sum + Math.pow(a - B[i], 2), 0));
}


export function indexNrToString(nr: number): string {
    return ((nr * 10) + '').slice(0, 10).padEnd(10, '0');
}


export function sortByObjectNumberProperty<T>(property: keyof T) {
    return (a: T, b: T) => {
        return (b as any)[property] - (a as any)[property];
    }
}

export async function inspectImportedData(db: RxDatabase) {
    console.log('Inspecting imported data...');
    
    // Inspect items collection
    const itemsCount = await db.items.count().exec();
    console.log(`Total items: ${itemsCount}`);
    
    const sampleItems = await db.items.find().limit(5).exec();
    console.log('Sample items:');
    sampleItems.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Body: ${item.body.substring(0, 100)}...`);
        console.log('---');
    });

    // Inspect vectors collection
    const vectorsCount = await db.vectors.count().exec();
    console.log(`Total vectors: ${vectorsCount}`);
    
    const sampleVectors = await db.vectors.find().limit(5).exec();
    console.log('Sample vectors:');
    sampleVectors.forEach(vector => {
        console.log(`ID: ${vector.id}`);
        console.log(`Primary: ${vector.primary}`);
        console.log(`Embedding length: ${vector.embedding.length}`);
        console.log(`First 5 embedding values: ${vector.embedding.slice(0, 5)}`);
        console.log(`idx0: ${vector.idx0}`);
        console.log(`idx1: ${vector.idx1}`);
        console.log(`idx2: ${vector.idx2}`);
        console.log(`idx3: ${vector.idx3}`);
        console.log(`idx4: ${vector.idx4}`);
        console.log('---');
    });
}
