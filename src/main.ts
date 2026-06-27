//import './styles.css';
function ClickSelect(){
  const Box=document.querySelector<HTMLElement>(".btnBox");
  if(!Box){
    return;
  }
  Box.addEventListener("click",()=>{
  const select=document.querySelector<HTMLElement>(".btnSelected");
  const unselect=document.querySelector<HTMLElement>(".btnUnSelected");
  if(!select||!unselect){
    return;
  }
  select.className='btnUnSelected btnBase';
  unselect.className="btnSelected btnBase";
});
}
document.addEventListener("DOMContentLoaded",()=>{
  ClickSelect();
  StartAndEnd();
});
const HotKey=document.querySelector(".inputHotKey") as HTMLInputElement;
if(!HotKey)
  console.log("error no HotKey");
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
  let modify=[];
  if(event.ctrlKey) modify.push('CTRL');
  if(event.altKey) modify.push('ALT');
  let final=modify.length>0?`${modify.join('+')}+${keyName}`:keyName;
  HotKey.value=final;
});
function StartAndEnd(){
  const Box=document.querySelector(".start") as HTMLDivElement;
  if(!Box){
    return;                                                              
  }
  const start=document.querySelector(".btnStart") as HTMLButtonElement;
  start.addEventListener("click",()=>{
    if(start.innerText==="开始"){
      start.innerText="停止";
    }else{
      start.innerText="开始";
    }
  });
} 
  

