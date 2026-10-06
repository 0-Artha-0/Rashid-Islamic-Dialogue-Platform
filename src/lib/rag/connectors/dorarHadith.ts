import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex").slice(0,24);
function strip(v:string){return v.replace(/<[^>]*>/g," ").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim()}
export class DorarHadithApiConnector implements RetrievalConnector{
 readonly name="dorar-hadith-api";
 async search(q:RetrievalQuery):Promise<EvidenceCandidate[]>{
  if(q.sourceTypes.length&&!q.sourceTypes.includes("hadith"))return[];
  try{
   const url=`https://dorar.net/dorar_api.json?skey=${encodeURIComponent(q.query)}`;
   const r=await fetch(url,{headers:{accept:"application/json"},signal:AbortSignal.timeout(8000)});if(!r.ok)return[];
   const j:any=await r.json();const raw=String(j?.ahadith?.result??j?.result??"");if(!raw)return[];
   const blocks=raw.split(/<div[^>]*class=["']?hadith["']?[^>]*>/i).filter(Boolean);
   return blocks.slice(0,Math.max(q.topK*2,8)).map((b,i)=>{const text=strip(b);const id=`dorar-api-${hash(text+":"+i)}`;return{id,chunkId:id,recordId:id,sourceId:"dorar-hadith-api",sourceType:"hadith" as const,sourceName:"Dorar.net Hadith API",text,language:"ar",locator:"Dorar hadith search",url,retrievalMethod:"keyword" as const,score:0.72,conceptIds:q.conceptIds}}).filter(x=>x.text.length>20);
  }catch{return[]}
 }
}
export function createDorarHadithApiConnector():RetrievalConnector{return new DorarHadithApiConnector()}
