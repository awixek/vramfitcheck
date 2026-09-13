type Entry = { count: number; resetAt: number };
const entries = new Map<string, Entry>();
export function rateLimit(key:string, now:number, windowMs:number, max:number):boolean {
  const e=entries.get(key);
  if(!e || e.resetAt<=now){entries.set(key,{count:1,resetAt:now+windowMs});return true;}
  if(e.count>=max)return false; e.count++; return true;
}
