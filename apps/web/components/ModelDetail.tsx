"use client";
import Link from "next/link"; import {useEffect,useState} from "react";
const API=process.env.NEXT_PUBLIC_API_BASE_URL??"http://localhost:8080";
export function ModelDetail({modelId}:{modelId:string}){
 const [model,setModel]=useState<any>(); const [gpus,setGpus]=useState<any[]>([]); const [gpu,setGpu]=useState(""); const [result,setResult]=useState<any>(); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{try{const [m,g]=await Promise.all([fetch(`${API}/v1/models?modelId=${encodeURIComponent(modelId)}`),fetch(`${API}/v1/gpus`)]);const mj=await m.json(),gj=await g.json();if(!m.ok)throw Error(mj.error??"Model not found");setModel(mj.model);setGpus(gj.gpus??[]);if(gj.gpus?.[0])setGpu(gj.gpus[0].id)}catch(e){setError(e instanceof Error?e.message:"Unable to load model")}finally{setLoading(false)}})()},[modelId]);
 async function calculate(){const selected=gpus.find(x=>x.id===gpu);if(!selected)return;const r=await fetch(`${API}/v1/calculate`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({model,gpu:selected,runtime:{contextLength:4096,batchSize:1}})});setResult(await r.json())}
 if(loading)return <Shell><div className="panel">Loading model analysis…</div></Shell>;
 if(error)return <Shell><div className="panel error">{error}</div></Shell>;
 return <Shell><div className="eyebrow">MODEL PROFILE</div><h1>{model?.id??modelId}</h1><p className="sub">Dedicated Hugging Face model analysis.</p>
 <div className="grid">
  <section className="panel"><h2>Model intelligence</h2><div className="facts"><Fact k="Parameters" v={model?.parametersB?`${model.parametersB}B`:"Unknown"}/><Fact k="Architecture" v={model?.architecture??"Unknown"}/><Fact k="Quantization" v={model?.quantization??"Auto / unknown"}/><Fact k="Confidence" v={model?.confidence??"Unknown"}/></div>{model?.warnings?.length>0&&<div className="warnings">{model.warnings.map((x:string,i:number)=><div key={i}>• {x}</div>)}</div>}</section>
  <section className="panel"><h2>Check on GPU</h2><select value={gpu} onChange={e=>setGpu(e.target.value)}>{gpus.map(g=><option key={g.id} value={g.id}>{g.name} · {g.vramGB} GB</option>)}</select><button onClick={calculate}>Calculate fit →</button>{result&&<div className="result"><b>{String(result.status??"unknown").replaceAll("_"," ")}</b><span>Required: {result.requiredVRAMGB?.toFixed?.(2)??"—"} GB</span><span>Available: {result.availableVRAMGB?.toFixed?.(2)??"—"} GB</span><span>Headroom: {result.headroomGB?.toFixed?.(2)??"—"} GB</span></div>}</section>
 </div></Shell>
}
function Fact({k,v}:{k:string,v:string}){return <div><span>{k}</span><b>{v}</b></div>}
function Shell({children}:{children:React.ReactNode}){return <main><nav className="nav"><Link href="/" className="brand">HF-VRAM</Link><div className="links"><Link href="/">Analyzer</Link><Link href="/gpu/rtx-4090">GPU Profiles</Link></div></nav><section className="detail">{children}</section></main>}