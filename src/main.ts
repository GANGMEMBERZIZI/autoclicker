import { invoke } from '@tauri-apps/api/core';
import { open,save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import {register,unregisterAll} from '@tauri-apps/plugin-global-shortcut';
interface Setting{
  interval:number,
  mode:String,
  currentHotKey:String
}
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
async function exportSetting(){
  try{
    let currentSetting:Setting={
      interval:Interval,
      mode:Mod,
      currentHotKey:currentHotKey
    };
    const filePath=await save({
      title:"保存当前配置?",
      defaultPath:"SenaConfig.json",
      filters:[{name:"Sena",extensions:['json']}]
    });
    if(filePath){
      await writeTextFile(filePath,JSON.stringify(currentSetting,null,2));
    }
  }
  catch(error){
    console.log(error);
  }
}
async function importSetting() {
  try{
    const filePath=await open({
      title:"导入你选择的配置",
      filters:[{name:"Sena",extensions:["json"]}]
    });
    if(filePath){
      let fileContent=await readTextFile(filePath as string);
      let parseConfig=JSON.parse(fileContent);
      if(parseConfig.interval){
        Interval = parseConfig.interval;            
        input.value = String(Interval);
      }
      if(parseConfig.mode){
        Mod = parseConfig.mode;
        const buttons = document.querySelectorAll<HTMLElement>(".btnBox .btnBase");
        buttons.forEach(btn => {
          if (btn.innerText.includes('Left') && Mod === 'left') {
            btn.className = "btnSelected btnBase";
          } else if (btn.innerText.includes('Right') && Mod === 'right') {
            btn.className = "btnSelected btnBase";
          } else {
            btn.className = "btnUnSelected btnBase";
          }
        });
      }
      if(parseConfig.currentHotKey&&parseConfig.currentHotKey!==HotKey.value){
        currentHotKey = parseConfig.currentHotKey;
        if (HotKey) {
          HotKey.value = currentHotKey.replace("CommandOrControl", "Ctrl");
        }
        await registerDefault();
      }
      await syncSettingsToRust();
    }
  }
  catch(error){
    console.error(error);
  }
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
const Load=document.querySelector(".btnLoad") as HTMLButtonElement;
const out=document.querySelector(".btnOut") as HTMLButtonElement;
if(!Load||!out){
  console.log("不存在Save load out");
}
Load.addEventListener("click",async()=>{
  await importSetting();

});
out.addEventListener("click",async()=>{
  await exportSetting();
}); 

  

