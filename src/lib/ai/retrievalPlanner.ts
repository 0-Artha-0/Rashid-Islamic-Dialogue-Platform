import { getLlmClient } from "@/lib/ai/client";
import type { RouterOutput } from "@/lib/schemas/router";
import type { DialogueState } from "@/lib/schemas/dialogue";

export type PlannedSearch = { need: string; query: string };
const schema={type:"object",additionalProperties:false,required:["searches"],properties:{searches:{type:"array",items:{type:"object",additionalProperties:false,required:["need","query"],properties:{need:{type:"string"},query:{type:"string"}}}}}} as const;

export async function planSearchQueries(input:{message:string;router:RouterOutput;dialogueState:DialogueState}):Promise<PlannedSearch[]>{
 const llm=getLlmClient();
 const prompt=[
  "You plan evidence retrieval for an Islamic dialogue assistant.",
  "Do NOT copy a long conversational user message into search.",
  "Extract short factual search queries for only the knowledge gaps listed in needs.",
  "Preserve the user's language unless a source term is conventionally clearer otherwise.",
  "Use the dialogue state to resolve pronouns and follow-ups.",
  "Each query must describe the fact/evidence needed, not the user's rhetoric or emotions.",
  "Return one concise search query per need. Do not answer the user.",
  JSON.stringify(input,null,2)
 ].join("\n\n");
 const raw=await llm.generate(prompt,{stage:"retrieval-planner",responseMimeType:"application/json",responseJsonSchema:schema,temperature:0});
 const parsed=JSON.parse(raw) as {searches?:PlannedSearch[]};
 return (parsed.searches??[]).filter(x=>x.need&&x.query?.trim());
}
