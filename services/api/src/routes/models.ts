import { ModelService } from "../services/model-service.ts";
const MODEL_ID=/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}\/[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
export async function modelRoute(request:Request,service:ModelService){
  const modelId=new URL(request.url).searchParams.get("modelId")??"";
  if(!MODEL_ID.test(modelId)) return Response.json({error:"Invalid modelId. Expected owner/repository."},{status:400});
  try{return Response.json(await service.analyze(modelId));}
  catch(error){const msg=error instanceof Error?error.message:"Model lookup failed";return Response.json({error:msg},{status:msg.includes("not found")?404:502});}
}
