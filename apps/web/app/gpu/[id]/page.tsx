import {GPUProfile} from "../../../components/GPUProfile";
export default async function Page({params}:{params:Promise<{id:string}>}){const p=await params; return <GPUProfile id={p.id}/>;}
