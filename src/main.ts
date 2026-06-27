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
});

