import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";
const BASE="https://hadeethenc.com/api/v1";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex").slice(0,24);
function ids(text:string){return [...text.matchAll(/(?:hadeeth|hadith)[:#\s/-]*(\d+)/gi)].map(m=>m[1])}
function lang(q:RetrievalQuery){return q.queryLanguage.split("-")[0].toLowerCase()}
function normalize(j:any,q:RetrievalQuery):EvidenceCandidate|null{const item=j?.hadeeth??j?.result??j;const id0=String(item?.id??item?.hadeeth_id??"");const text=String(item?.hadeeth??item?.text??item?.title??"").trim();if(!id0||!text)return null;const grading=String(item?.grade??item?.attribution??item?.grade_ar??"").trim()||undefined;const id=`hadeethenc-${hash(id0+":"+lang(q))}`;return{id,chunkId:id,recordId:id0,sourceId:"hadeethenc",sourceType:"hadith",sourceName:"HadeethEnc",text,language:lang(q),locator:grading?`HadeethEnc #${id0} | grading=${grading}`:`HadeethEnc #${id0}`,url:`https://hadeethenc.com/${lang(q)}/browse/hadith/${id0}`,score:0.92,retrievalMethod:"exact",conceptIds:q.conceptIds,grading}}
export class HadeethEncConnector implements RetrievalConnector{
 readonly name="hadeethenc-api";
 async search(q:RetrievalQuery):Promise<EvidenceCandidate[]>{
  if(q.sourceTypes.length&&!q.sourceTypes.includes("hadith"))return[];
  const out:EvidenceCandidate[]=[];
  for(const id of ids(q.query).slice(0,q.topK)){try{const r=await fetch(`${BASE}/hadeeths/one/?language=${lang(q)}&id=${id}`,{signal:AbortSignal.timeout(7000)});if(!r.ok)continue;const c=normalize(await r.json(),q);if(c)out.push(c)}catch{}}
  // Category listing is useful when the planner supplies a category id.
  const category=q.query.match(/(?:category|category_id)[:#\s]*(\d+)/i)?.[1];
  if(category&&!out.length){try{const r=await fetch(`${BASE}/hadeeths/list/?language=${lang(q)}&category_id=${category}&page=1&per_page=${Math.min(q.topK,20)}`,{signal:AbortSignal.timeout(7000)});if(r.ok){const j:any=await r.json();const data=Array.isArray(j?.data)?j.data:Array.isArray(j)?j:[];for(const x of data){const c=normalize(x,q);if(c)out.push(c)}}}catch{}}
  return out;
 }
}
export function createHadeethEncConnector():RetrievalConnector{return new HadeethEncConnector()}
