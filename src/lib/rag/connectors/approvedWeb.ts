import crypto from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";

const DEFAULT_DOMAINS=[
 "dorar.net","tafsir.net","quranenc.com","hadeethenc.com","islamenc.com",
 "terminologyenc.com","risala.prh.gov.sa","shamela.ws"
];
const domains=()=> (process.env.RASHID_APPROVED_WEB_DOMAINS?.split(",").map(x=>x.trim()).filter(Boolean) ?? DEFAULT_DOMAINS);
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex").slice(0,24);
function allowed(url:string){try{const h=new URL(url).hostname.replace(/^www\./,"");return domains().some(d=>h===d||h.endsWith("."+d))}catch{return false}}
function typeFor(url:string):EvidenceCandidate["sourceType"]{const u=url.toLowerCase();if(u.includes("quran"))return"quran";if(u.includes("hadith")||u.includes("hadeeth"))return"hadith";if(u.includes("tafseer")||u.includes("tafsir"))return"tafsir";if(u.includes("aqeeda"))return"aqeedah";if(u.includes("feqhia")||u.includes("fiqh"))return"fiqh";if(u.includes("history"))return"history";if(u.includes("terminology"))return"terminology";return"other_approved"}
function cleanHtml(html:string){return html.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#\d+;/g," ").replace(/\s+/g," ").trim().slice(0,12000)}

export class ApprovedWebConnector implements RetrievalConnector{
 readonly name="approved-web";
 async search(query:RetrievalQuery):Promise<EvidenceCandidate[]>{
  if(process.env.RASHID_DISABLE_WEB_SEARCH==="true"||!process.env.GEMINI_API_KEY)return[];
  const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
  const siteClause=domains().map(d=>`site:${d}`).join(" OR ");
  const response:any=await ai.models.generateContent({
   model:process.env.WEB_SEARCH_MODEL??"gemini-3.1-flash-lite",
   contents:`${query.query}\nSearch only these approved Islamic reference domains: ${siteClause}`,
   config:{tools:[{googleSearch:{}}],temperature:0}
  });
  const chunks:any[]=response?.candidates?.[0]?.groundingMetadata?.groundingChunks??[];
  const urls=[...new Set(chunks.map(c=>c?.web?.uri).filter((u:any):u is string=>typeof u==="string"&&allowed(u)))].slice(0,Math.max(query.topK,4));
  const out:EvidenceCandidate[]=[];
  for(const url of urls){
   try{
    const res=await fetch(url,{headers:{"user-agent":"Rashid-Hackathon/1.0"},signal:AbortSignal.timeout(8000)});
    if(!res.ok)continue;const text=cleanHtml(await res.text());if(text.length<80)continue;
    const id=`web-${hash(url)}`;out.push({id,chunkId:id,recordId:id,sourceId:"approved-web",sourceType:typeFor(url),sourceName:new URL(url).hostname,text,language:query.queryLanguage,locator:url,url,score:0.55,retrievalMethod:"semantic",conceptIds:[]});
   }catch{}
  }
  return out;
 }
}
export function createApprovedWebConnector():RetrievalConnector{return new ApprovedWebConnector()}
