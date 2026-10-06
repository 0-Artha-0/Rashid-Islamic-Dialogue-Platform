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
  // Gemini grounding URIs are commonly Google/Vertex redirect URLs rather than
  // the publisher URL. Do not reject them before following the redirect.
  const refs=[...new Map(chunks
    .map((c:any)=>({uri:c?.web?.uri,title:String(c?.web?.title??"").trim()}))
    .filter((x:any)=>typeof x.uri==="string"&&x.uri)
    .map((x:any)=>[x.uri,x])).values()].slice(0,Math.max(query.topK,4));
  const out:EvidenceCandidate[]=[];
  for(const ref of refs){
   try{
    // A publisher-domain title is a useful pre-filter, but the final redirected
    // URL is the security boundary. fetch() follows redirects by default.
    const titleLooksApproved = domains().some(d=>ref.title===d||ref.title.endsWith("."+d)||ref.title.includes(d));
    if(!titleLooksApproved && allowed(ref.uri)===false && !ref.uri.includes("vertexaisearch.cloud.google.com")) continue;
    const res=await fetch(ref.uri,{headers:{"user-agent":"Mozilla/5.0 Rashid-Hackathon/1.0"},redirect:"follow",signal:AbortSignal.timeout(10000)});
    if(!res.ok)continue;
    const finalUrl=res.url||ref.uri;
    if(!allowed(finalUrl))continue;
    const text=cleanHtml(await res.text());if(text.length<80)continue;
    const id=`web-${hash(finalUrl)}`;out.push({id,chunkId:id,recordId:id,sourceId:"approved-web",sourceType:typeFor(finalUrl),sourceName:new URL(finalUrl).hostname,text,language:query.queryLanguage,locator:finalUrl,url:finalUrl,score:0.68,retrievalMethod:"semantic",conceptIds:query.conceptIds});
   }catch{}
  }
  return out;
 }
}
export function createApprovedWebConnector():RetrievalConnector{return new ApprovedWebConnector()}
