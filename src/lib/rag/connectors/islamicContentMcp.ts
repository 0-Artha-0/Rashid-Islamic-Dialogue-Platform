import crypto from "node:crypto";
import type { EvidenceCandidate, RetrievalQuery } from "@/lib/schemas/retrieval";
import type { RetrievalConnector } from "@/lib/rag/types";

const MCP_URL = process.env.ISLAMIC_CONTENT_MCP_URL ?? "https://mcp.islamiccontent.org/mcp";
type JsonRpcResponse={result?:Record<string,unknown>;error?:{code:number;message:string}};
type McpTool={name:string;inputSchema?:{properties?:Record<string,{type?:string;default?:unknown}>;required?:string[]}};

const hashId=(v:string)=>`mcp-${crypto.createHash("sha256").update(v,"utf8").digest("hex").slice(0,24)}`;
function parsePayload(text:string):unknown{const t=text.trim();if(!t)return null;try{return JSON.parse(t)}catch{};const lines=t.split(/\r?\n/).filter(l=>l.startsWith("data:")).map(l=>l.slice(5).trim()).filter(Boolean);for(let i=lines.length-1;i>=0;i--){try{return JSON.parse(lines[i])}catch{}}return text}
async function post(body:Record<string,unknown>,timeoutMs=12000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{const response=await fetch(MCP_URL,{method:"POST",headers:{"content-type":"application/json",accept:"application/json, text/event-stream"},body:JSON.stringify(body),signal:controller.signal});return{response,payload:parsePayload(await response.text())}}finally{clearTimeout(timer)}}
async function request(method:string,params:Record<string,unknown>={}):Promise<JsonRpcResponse>{const r=await post({jsonrpc:"2.0",id:Date.now(),method,params});if(!r.response.ok)throw new Error(`Islamic Content MCP HTTP ${r.response.status}`);const p=r.payload as JsonRpcResponse|null;if(!p||typeof p!=="object")throw new Error("Islamic Content MCP returned an unreadable response.");if(p.error)throw new Error(`Islamic Content MCP ${method} error ${p.error.code}: ${p.error.message}`);return p}

function walk(value:unknown,out:Record<string,unknown>[]=[],seen=new Set<object>()):Record<string,unknown>[]{
 if(value==null)return out;
 if(typeof value==="string"){const t=value.trim();if((t.startsWith("{")&&t.endsWith("}"))||(t.startsWith("[")&&t.endsWith("]"))){try{walk(JSON.parse(t),out,seen)}catch{}}return out}
 if(Array.isArray(value)){value.forEach(v=>walk(v,out,seen));return out}
 if(typeof value!=="object")return out;const o=value as Record<string,unknown>;if(seen.has(o))return out;seen.add(o);out.push(o);Object.values(o).forEach(v=>walk(v,out,seen));return out
}
function str(o:Record<string,unknown>,keys:string[]){for(const k of keys){const v=o[k];if(typeof v==="string"&&v.trim())return v.trim()}return undefined}
function isMetadataOnly(text:string){const t=text.trim();return /^((quran|hadith|hadeeth|library):[^\s]+)$/i.test(t)||/^https?:\/\/\S+$/i.test(t)||t.length<18}
function inferType(o:Record<string,unknown>):EvidenceCandidate["sourceType"]{const raw=(str(o,["sourceType","contentType","type","collection","category"])??"").toLowerCase();const origin=(str(o,["url","sourceUrl","link","locator","reference","path"])??"").toLowerCase();const h=raw+" "+origin;if(h.includes("quran")||h.includes("قرآن")||h.includes("islamenc.com"))return"quran";if(h.includes("hadith")||h.includes("hadeeth")||h.includes("حديث"))return"hadith";if(h.includes("tafsir")||h.includes("تفسير"))return"tafsir";if(h.includes("term")||h.includes("مصطلح"))return"terminology";if(h.includes("fiqh")||h.includes("فقه"))return"fiqh";if(h.includes("seerah")||h.includes("سيرة"))return"seerah";if(h.includes("misconception")||h.includes("question")||h.includes("سؤال"))return"misconception";return"other_approved"}

function buildSearchArgs(tool:McpTool,query:RetrievalQuery){const p=tool.inputSchema?.properties??{};const req=tool.inputSchema?.required??[];const qk=["query","q","search","text"].find(k=>p[k]?.type==="string");if(!qk)return null;const a:Record<string,unknown>={[qk]:query.query};const lk=["language","lang","languageCode","locale"].find(k=>p[k]?.type==="string");if(lk)a[lk]=query.queryLanguage;const nk=["limit","topK","top_k","pageSize","maxResults"].find(k=>p[k]?.type==="integer"||p[k]?.type==="number");if(nk)a[nk]=Math.min(query.topK*2,20);return req.every(k=>k in a||p[k]?.default!==undefined)?a:null}
function buildFetchArgs(tool:McpTool,resource:Record<string,unknown>){const p=tool.inputSchema?.properties??{};const req=tool.inputSchema?.required??[];const id=str(resource,["id","key","resourceId","resource_id"]);const url=str(resource,["url","sourceUrl","link","locator","reference"]);const a:Record<string,unknown>={};for(const k of ["id","key","resourceId","resource_id"]){if(p[k]?.type==="string"&&id){a[k]=id;break}}for(const k of ["url","uri","link","locator"]){if(p[k]?.type==="string"&&url){a[k]=url;break}}return req.every(k=>k in a||p[k]?.default!==undefined)&&Object.keys(a).length?a:null}

function normalizeFetched(value:unknown,query:RetrievalQuery):EvidenceCandidate[]{
 const out:EvidenceCandidate[]=[];let index=0;
 for(const o of walk(value)){
  const text=str(o,["text","content","body","translation","description","snippet"]);
  const url=str(o,["url","sourceUrl","link"]);
  const locator=str(o,["locator","reference","path","id","key"])??url;
  if(!text||!locator||isMetadataOnly(text))continue;
  const sourceId=str(o,["sourceId","source_id","collectionId","collection"])??"islamic-content-mcp";
  const recordId=str(o,["recordId","record_id","id","key"])??hashId(`${sourceId}:${locator}`);
  const grading=str(o,["grading","grade","authenticity","hukm","ruling"]);
  out.push({id:hashId(`${recordId}:${index++}:${text.slice(0,80)}`),chunkId:str(o,["chunkId","chunk_id"])??hashId(`chunk:${recordId}:${index}`),recordId,sourceId,sourceType:inferType(o),sourceName:str(o,["sourceName","source","publisher"])??"Islamic Content MCP",text,language:str(o,["language","lang","languageCode"])??query.queryLanguage,locator:grading?`${locator} | grading=${grading}`:locator,url,score:typeof o.score==="number"?o.score:typeof o.relevance==="number"?o.relevance:0.5,retrievalMethod:"keyword",conceptIds:[],grading});
 }
 return out;
}

export class IslamicContentMcpConnector implements RetrievalConnector{
 readonly name="islamic-content-mcp";
 async search(query:RetrievalQuery):Promise<EvidenceCandidate[]>{
  if(process.env.RASHID_DISABLE_MCP==="true")return[];
  const listed=await request("tools/list");const tools=Array.isArray(listed.result?.tools)?listed.result!.tools as McpTool[]:[];
  const searchTool=tools.find(t=>t.name==="search");if(!searchTool)throw new Error("Islamic Content MCP search tool is not advertised.");
  const args=buildSearchArgs(searchTool,query);if(!args)throw new Error("MCP search schema requires unsupported fields.");
  const searched=await request("tools/call",{name:"search",arguments:args});if(searched.result?.isError)throw new Error("Islamic Content MCP search returned an error.");
  const payload=searched.result?.structuredContent??searched.result?.content??searched.result;
  const fetchTool=tools.find(t=>t.name==="fetch");
  const resources=walk(payload).filter(o=>str(o,["id","key","resourceId","resource_id","url","sourceUrl","link","locator","reference"]));
  const fetched:EvidenceCandidate[]=[];
  if(fetchTool){
   for(const resource of resources.slice(0,Math.max(query.topK*2,8))){
    const fa=buildFetchArgs(fetchTool,resource);if(!fa)continue;
    try{const r=await request("tools/call",{name:"fetch",arguments:fa});fetched.push(...normalizeFetched(r.result?.structuredContent??r.result?.content??r.result,query))}catch{}
   }
  }
  // Only actual textual content may become evidence. Search metadata is never evidence.
  const direct=normalizeFetched(payload,query).filter(c=>!isMetadataOnly(c.text));
  const merged=[...fetched,...direct].filter((c,i,a)=>a.findIndex(x=>x.text===c.text&&x.locator===c.locator)===i);
  return merged.slice(0,Math.max(query.topK*2,8));
 }
}
export function createIslamicContentMcpConnector():RetrievalConnector{return new IslamicContentMcpConnector()}
