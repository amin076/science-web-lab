import {mountRopeLab} from './main.js';
const initial=[{boundary:'free',excitation:'sine'},{boundary:'fixed',excitation:'sine'},{boundary:'traveling',excitation:'sine'},{boundary:'fixed',excitation:'burst',pulseCycles:0.5}];
const labels=['Free-end comparison','Fixed-end comparison','Traveling-wave comparison','Single-pulse experiment'];
const apis=initial.map((parameters,i)=>{const root=document.createElement('section');root.className='rope-lab';root.id='rope-'+(i+1);root.setAttribute('aria-label','Rope '+(i+1));root.append(document.getElementById('rope-template').content.cloneNode(true));const heading=document.createElement('h2');heading.textContent='Rope '+(i+1)+' · '+labels[i];root.querySelector('.stage').prepend(heading);document.getElementById('rope-rows').append(root);return mountRopeLab(root,parameters);});
document.getElementById('play-all').onclick=()=>apis.forEach(a=>a.play());
document.getElementById('pause-all').onclick=()=>apis.forEach(a=>a.pause());
document.getElementById('restart-all').onclick=()=>{apis.forEach(a=>a.reset());apis.forEach(a=>a.play());};
