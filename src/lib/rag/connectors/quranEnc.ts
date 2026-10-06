import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";

const BASE="https://quranenc.com/api/v1";
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex").slice(0,24);
function refs(text:string){const out:{sura:number;aya:number}[]=[];for(const m of text.matchAll(/(?:quran:)?\s*(\d{1,3})\s*[:\/]\s*(\d{1,3})/gi)){const s=Number(m[1]),a=Number(m[2]);if(s>=1&&s<=114&&a>=1)out.push({sura:s,aya:a})}return out}
async function translationKey(language:string){const lang=language.split("-")[0].toLowerCase();
 // QuranEnc exposes the Arabic simplified tafsir under this stable public key.
 // Using it directly also avoids locale-list inconsistencies for Arabic.
 if(lang==="ar") return "arabic_moyassar";
 const r=await fetch(`${BASE}/translations/list/${encodeURIComponent(lang)}?localization=${encodeURIComponent(lang)}`,{signal:AbortSignal.timeout(7000)});if(!r.ok)return null;const j:any=await r.json();const list=Array.isArray(j)?j:Array.isArray(j?.translations)?j.translations:[];return list[0]?.key??null}
export class QuranEncConnector implements RetrievalConnector{
 readonly name="quranenc-api";
 async search(query:RetrievalQuery):Promise<EvidenceCandidate[]>{
  if(query.sourceTypes.length&&!query.sourceTypes.includes("quran"))return[];
  const locations=refs(query.query);if(!locations.length)return[];
  const key=await translationKey(query.queryLanguage);if(!key)return[];
  const out:EvidenceCandidate[]=[];
  for(const {sura,aya} of locations.slice(0,query.topK)){
   try{const url=`${BASE}/translation/aya/${encodeURIComponent(key)}/${sura}/${aya}`;const r=await fetch(url,{signal:AbortSignal.timeout(7000)});if(!r.ok)continue;const j:any=await r.json();const text=String(j?.translation??j?.result?.translation??"").trim();if(!text)continue;const id=`quranenc-${hash(`${key}:${sura}:${aya}`)}`;out.push({id,chunkId:id,recordId:`${sura}:${aya}:${key}`,sourceId:"quranenc",sourceType:"quran",sourceName:"QuranEnc",text,language:query.queryLanguage,locator:`Quran ${sura}:${aya} (${key})`,url:`https://quranenc.com/${query.queryLanguage.split("-")[0]}/browse/${key}/${sura}/${aya}`,score:0.95,retrievalMethod:"exact",conceptIds:query.conceptIds})}catch{}
  }
  return out;
 }
}
export function createQuranEncConnector():RetrievalConnector{return new QuranEncConnector()}
