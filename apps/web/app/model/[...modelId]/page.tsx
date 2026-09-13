import {ModelDetail} from "../../../components/ModelDetail";
export default async function Page({params}:{params:Promise<{modelId:string[]}>}){const p=await params; const id=p.modelId.join("/"); return <ModelDetail modelId={id}/>;}
