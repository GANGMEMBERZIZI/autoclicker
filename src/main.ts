//import './styles.css';
import { invoke } from '@tauri-apps/api/core';
import {register,unregisterAll} from '@tauri-apps/plugin-global-shortcut';
const input=document.querySelector(".input") as HTMLInputElement;
let currentHotKey='F1';
let final='';
input.value=String(100);
let Interval=100;
let Mod='left';
let isClicking=false;
let lastToggleTime=0;
function toggleClicking(){
  const now=Date.now();
  if(now-lastToggleTime<200) return;
  lastToggleTime=now;
  isClicking=!isClicking;
  const btn=document.querySelector(".btnStart") as HTMLButtonElement;
  if(btn) btn.innerText=isClicking?"停止":"开始";
  invoke("toggle_clicking",{isRunning:isClicking});
}
async function syncSettingsToRust() {
  try{
    await invoke('update_settings',{mode:Mod,interval:Interval}); 
  }
  catch(error){
    console.error("同步给 Rust 失败:",error);
  }
}
function ClickSelect(){
  const Box=document.querySelector<HTMLElement>(".btnBox");
  if(!Box){
    return;
  }
  Box.addEventListener("click",(event)=>{
  const target = event.target as HTMLElement;
    if (target.classList.contains("btnUnSelected")) {
      const select = document.querySelector<HTMLElement>(".btnSelected");
      if (!select) return;
      select.className = 'btnUnSelected btnBase';
      target.className = "btnSelected btnBase";
      if (target.innerText.includes('Left')) {
        Mod = 'left';
      } else {
        Mod = 'right';
      }
      syncSettingsToRust();
    }
});
}
document.addEventListener("DOMContentLoaded",async ()=>{
  ClickSelect();
  StartAndEnd();
  InputandListen();
  syncSettingsToRust();
  await registerDefault();
});
const HotKey=document.querySelector(".inputHotKey") as HTMLInputElement;
if(!HotKey)
  console.log("error no HotKey");
HotKey.value='F1';
HotKey.addEventListener("keydown",async (event)=>{
  if (event.key === 'Process') {
    event.preventDefault();
    return;
  }
  event.preventDefault();
  let keyName=event.key.toUpperCase();
  if (['Control','Alt'].includes(event.key)) {
    return;
  }
  if(keyName===' '){
    keyName='SPACE';
  }
  let Modify=[];
  if(event.ctrlKey) Modify.push('CommandOrControl');
  if(event.altKey) Modify.push('ALT');
  final=Modify.length>0?`${Modify.join('+')}+${keyName}`:keyName;
  HotKey.value=final.replace("CommandOrControl","Ctrl");
  if(final===currentHotKey)
    return;
  try{
  if(currentHotKey){
    await unregisterAll();
  }
  currentHotKey=final;
  await register(currentHotKey,()=>toggleClicking());
}
catch(error){
  console.log("产生错误"+error);
}
});
function InputandListen(){
  
  if (!input) return;
  Interval=Number(input.value);
  input.addEventListener("change", () => {
    let val = Number(input.value);
    if (val <= 0||val>=1000) val = 1; 
    input.value = val.toString();
    Interval = val;
    syncSettingsToRust();
  });
}
function StartAndEnd(){
  const Box=document.querySelector(".start") as HTMLDivElement;
  if(!Box){
    return;                                                              
  }
  const start=document.querySelector(".btnStart") as HTMLButtonElement;
  start.addEventListener("click",()=>toggleClicking());
}
async function registerDefault() {
  try{
    await unregisterAll();
    await register(currentHotKey, () => toggleClicking());
  }
  catch(error){
    console.log("出现了default错误"+error);
  }
}

  

