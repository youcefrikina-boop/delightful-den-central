import { useSyncExternalStore } from 'react';
export interface DynamicOption { value: string; label: string }
export interface OptionStore { custom: DynamicOption[]; overrides: Record<string,string> }
const empty: OptionStore = {custom:[],overrides:{}};
const cache = new Map<string,{raw:string|null;store:OptionStore}>();
const eventName = 'dafatek-options-changed';
export function readOptions(key:string):OptionStore {
  if(typeof window==='undefined') return empty;
  let raw:string|null=null;
  try {raw=localStorage.getItem(key);} catch {return empty;}
  const cached=cache.get(key); if(cached?.raw===raw) return cached.store;
  let store=empty;
  try {const parsed=JSON.parse(raw??'{}');store={custom:Array.isArray(parsed.custom)?parsed.custom.filter((o:DynamicOption)=>typeof o?.value==='string'&&typeof o?.label==='string'):[],overrides:parsed.overrides&&typeof parsed.overrides==='object'?parsed.overrides:{}};} catch { /* Ignore malformed saved options. */ }
  cache.set(key,{raw,store});return store;
}
export function writeOptions(key:string,store:OptionStore) {
  try {localStorage.setItem(key,JSON.stringify(store));window.dispatchEvent(new Event(eventName));} catch { /* Storage unavailable. */ }
}
function subscribe(callback:()=>void) {window.addEventListener(eventName,callback);window.addEventListener('storage',callback);return ()=>{window.removeEventListener(eventName,callback);window.removeEventListener('storage',callback);};}
export function useDynamicOptions(key:string) {return useSyncExternalStore(subscribe,()=>readOptions(key),()=>empty);}
export function mergeOptions(base:DynamicOption[],store:OptionStore,values:string[]=[]):DynamicOption[] {
  const options=[...base,...store.custom];
  for(const value of values) if(value&&!options.some(o=>o.value===value)) options.push({value,label:value.replace(/^custom:/,'').split(':')[0].replaceAll('_',' ')});
  return [...new Map(options.map(o=>[o.value,{...o,label:store.overrides[o.value]??o.label}])).values()];
}
export function useOptionLabel(key:string,value:string,fallback:string) {const store=useDynamicOptions(key);return store.overrides[value]??store.custom.find(o=>o.value===value)?.label??fallback;}