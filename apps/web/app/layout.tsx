import type {Metadata} from "next"; import "./globals.css";
export const metadata:Metadata={title:"HF-VRAM",description:"Hugging Face model and GPU VRAM analysis."};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}