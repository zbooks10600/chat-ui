import { FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import { getFromMapOrCreate } from 'rxdb/plugins/core';

/**
 * You can try different models:
 * @link https://huggingface.co/models?pipeline_tag=feature-extraction&library=transformers.js
 */
export const modelNames = [
  'Xenova/all-MiniLM-L6-v2'
] as const;
export const DEFAULT_MODEL_NAME = modelNames[0];


const pipePromises = new Map<string, Promise<FeatureExtractionPipeline>>();

export async function getVectorFromText(text: string, modelName: string): Promise<number[]> {
  const pipe = await getFromMapOrCreate(
    pipePromises,
    modelName,
    () => pipeline(
      "feature-extraction",
      modelName
    )
  );
  const output = await pipe(text, {
    pooling: "mean",
    normalize: true,
  });
  const embedding = Array.from(output.data);
  return embedding as any;
}