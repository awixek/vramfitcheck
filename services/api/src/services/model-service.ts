import { HFClient } from "../hf/client.ts";
import { analyzeModel, type HFModelInput } from "@hf-vram/hf-analyzer";

type CacheEntry={value:unknown;expiresAt:number};
export class ModelService {
  private cache=new Map<string,CacheEntry>();
  private hf: HFClient;
  private ttlMs: number;
  constructor(hf:HFClient, ttlMs:number){ this.hf=hf; this.ttlMs=ttlMs; }
  async analyze(modelId:string){
    const now=Date.now(), cached=this.cache.get(modelId);
    if(cached && cached.expiresAt>now) return cached.value;
    const raw=await this.hf.getModel(modelId);
    const card=await this.hf.getModelCardText(modelId);
    const input:HFModelInput={
      id:modelId,
      tags:Array.isArray(raw.tags)?raw.tags.filter((x):x is string=>typeof x==="string"):[],
      pipelineTag:typeof raw.pipeline_tag==="string"?raw.pipeline_tag:undefined,
      libraryName:typeof raw.library_name==="string"?raw.library_name:undefined,
      cardData:raw.cardData && typeof raw.cardData==="object" ? raw.cardData as Record<string,unknown> : undefined,
      config:raw.config && typeof raw.config==="object" ? raw.config as Record<string,unknown> : undefined,
      gguf:raw.gguf && typeof raw.gguf==="object" ? raw.gguf as Record<string,unknown> : undefined,
      safetensors:raw.safetensors && typeof raw.safetensors==="object" ? raw.safetensors as Record<string,unknown> : undefined,
      siblings:Array.isArray(raw.siblings)?raw.siblings as Array<{rfilename?:string;size?:number}>:undefined,
      raw
    };
    const analysis=analyzeModel({...input,modelCardText:card});
    const value={model:{id:modelId,libraryName:input.libraryName,pipelineTag:input.pipelineTag},analysis};
    this.cache.set(modelId,{value,expiresAt:now+this.ttlMs});
    return value;
  }
}
