import { estimateVRAM, type ModelSpec, type RuntimeSpec, type GpuSpec } from "@hf-vram/vram-engine";
function num(v:unknown){return typeof v==="number"&&Number.isFinite(v)?v:undefined;}
export async function calculateRoute(request:Request){
 let body:unknown; try{body=await request.json();}catch{return Response.json({error:"Invalid JSON body"},{status:400});}
 if(!body || typeof body!=="object") return Response.json({error:"Request body must be an object"},{status:400});
 const b=body as Record<string,unknown>, model=(b.model??{}) as Record<string,unknown>, gpu=(b.gpu??{}) as Record<string,unknown>, runtime=(b.runtime??{}) as Record<string,unknown>;
 const modelSpec:ModelSpec={id:typeof model.id==="string"?model.id:undefined,parametersB:num(model.parametersB),totalParametersB:num(model.totalParametersB),activeParametersB:num(model.activeParametersB),architecture:typeof model.architecture==="string"?model.architecture:undefined,quantization:typeof model.quantization==="string"?model.quantization:undefined,quantizationBits:num(model.quantizationBits),weightSizeGB:num(model.weightSizeGB),isMoE:Boolean(model.isMoE),experts:num(model.experts),activeExperts:num(model.activeExperts)};
 const gpuSpec:GpuSpec={name:typeof gpu.name==="string"?gpu.name:"Custom GPU",vramGB:num(gpu.vramGB)??0,unifiedMemory:Boolean(gpu.unifiedMemory),usableVRAMRatio:num(gpu.usableVRAMRatio)};
 if(gpuSpec.vramGB<=0) return Response.json({error:"gpu.vramGB must be greater than 0"},{status:400});
 const runtimeSpec:RuntimeSpec={contextLength:num(runtime.contextLength),batchSize:num(runtime.batchSize),kvCacheGB:num(runtime.kvCacheGB),runtimeOverheadGB:num(runtime.runtimeOverheadGB),safetyMarginGB:num(runtime.safetyMarginGB),cpuOffloadGB:num(runtime.cpuOffloadGB)};
 return Response.json({result:estimateVRAM(modelSpec,gpuSpec,runtimeSpec)});
}
