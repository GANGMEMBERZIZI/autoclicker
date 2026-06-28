//import './styles.css';
import { invoke } from '@tauri-apps/api/core';
const input=document.querySelector(".input") as HTMLInputElement;
input.value=String(100);

let Interval=100;
let Mod='left';
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
document.addEventListener("DOMContentLoaded",()=>{
  ClickSelect();
  StartAndEnd();
  InputandListen();
  syncSettingsToRust();
});
const HotKey=document.querySelector(".inputHotKey") as HTMLInputElement;
if(!HotKey)
  console.log("error no HotKey");
HotKey.value='F1';
HotKey.addEventListener("keydown",(event)=>{
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
  if(event.ctrlKey) Modify.push('CTRL');
  if(event.altKey) Modify.push('ALT');
  let final=Modify.length>0?`${Modify.join('+')}+${keyName}`:keyName;
  HotKey.value=final;
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
  start.addEventListener("click",async ()=>{
    if(start.innerText==="开始"){
      start.innerText="停止";
      await invoke("toggle_clicking", { isRunning: true });
    }else{
      start.innerText="开始";
      await invoke("toggle_clicking", { isRunning: false });
    }
  });
}

  

