(function(root){
  'use strict';
  function createWallet(saved={},save=()=>{}){
    let purse=Number.isInteger(saved.purse)&&saved.purse>=0?saved.purse:200;
    let ticket=saved.ticket===1?1:0;
    return {read:()=>({purse,ticket,ironPack:1-ticket}),setPurse(value){if(!Number.isInteger(value)||value<0)return false;purse=value;save({purse,ticket});return true;},exchange(){if(ticket)return false;ticket=1;save({purse,ticket});return true;},redeem(){if(!ticket)return false;ticket=0;save({purse,ticket});return true;}};
  }
  if(typeof module==='object'&&module.exports){module.exports={createWallet};return;}
  let saved={};try{saved=JSON.parse(sessionStorage.getItem('handscroll-wallet-v1')||'{}')||{};}catch{}
  root.HandscrollWallet=createWallet(saved,state=>{try{sessionStorage.setItem('handscroll-wallet-v1',JSON.stringify(state));}catch{}});
})(typeof window!=='undefined'?window:globalThis);
