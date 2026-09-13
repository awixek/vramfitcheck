import {createServer} from "node:http";
import {config} from "./config.ts";
import {HFClient} from "./hf/client.ts";
import {rateLimit} from "./middleware/rate-limit.ts";
import {errorMessage} from "./middleware/errors.ts";
import {healthRoute} from "./routes/health.ts";
import {modelRoute} from "./routes/models.ts";
import {gpusRoute} from "./routes/gpus.ts";
import {calculateRoute} from "./routes/calculate.ts";
import {ModelService} from "./services/model-service.ts";
const service=new ModelService(new HFClient(),config.cacheTtlMs);
function headers(origin:string|undefined){const h:Record<string,string>={"content-type":"application/json","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization"};if(origin&&config.allowedOrigins.includes(origin)){h["access-control-allow-origin"]=origin;h.vary="Origin";}return h;}
function allowed(origin:string|undefined){return !origin || config.allowedOrigins.length===0 || config.allowedOrigins.includes(origin);}
const server=createServer(async(req,res)=>{try{
 const origin=req.headers.origin; if(!allowed(origin)){res.writeHead(403,headers(origin));res.end(JSON.stringify({error:"Origin not allowed"}));return;}
 if(!rateLimit(req.socket.remoteAddress??"unknown",Date.now(),config.rateLimitWindowMs,config.rateLimitMax)){res.writeHead(429,headers(origin));res.end(JSON.stringify({error:"Rate limit exceeded"}));return;}
 if(req.method==="OPTIONS"){res.writeHead(204,headers(origin));res.end();return;}
 const url=new URL(req.url??"/",`http://${req.headers.host??"localhost"}`);let out:Response;
 if(req.method==="GET"&&url.pathname==="/health")out=healthRoute();
 else if(req.method==="GET"&&url.pathname==="/v1/models")out=await modelRoute(new Request(url),service);
 else if(req.method==="GET"&&url.pathname==="/v1/gpus")out=gpusRoute(new Request(url));
 else if(req.method==="POST"&&url.pathname==="/v1/calculate"){
   const chunks:Buffer[]=[];let size=0;for await(const chunk of req){const b=Buffer.from(chunk);size+=b.length;if(size>64*1024){res.writeHead(413,headers(origin));res.end(JSON.stringify({error:"Request body too large"}));return;}chunks.push(b);}out=await calculateRoute(new Request(url,{method:"POST",headers:{"content-type":"application/json"},body:Buffer.concat(chunks).toString("utf8")}));
 } else out=Response.json({error:"Not found"},{status:404});
 res.writeHead(out.status,headers(origin));res.end(JSON.stringify(await out.json()));
}catch(error){res.writeHead(500,headers(req.headers.origin));res.end(JSON.stringify({error:errorMessage(error)}));}});
server.listen(config.port,()=>console.log(`HF-VRAM API listening on ${config.port}`));
