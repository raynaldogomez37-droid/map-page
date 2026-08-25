async function loadBag(uid){
    DOM.bagTip.innerText="正在读取背包...";
    DOM.bagTip.classList.remove("error");
    DOM.bagList.innerHTML = "";
    try{
        const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/items?user_id=eq.${encodeURIComponent(uid)}&order=created_at.desc`,{
            headers:{"apikey":CONFIG.SUPABASE_ANON_KEY}
        });
        const bag = await res.json();
        if(!bag||bag.length===0){
            DOM.bagList.innerHTML="<p>背包空空如也，快去抽装备</p>";
            DOM.bagTip.innerText="背包加载完成";
            return;
        }
        let html = "";
        bag.forEach(it=>{
            let cls = "rarity-common";
            if(it.rarity==="rare")cls="rarity-rare";
            if(it.rarity==="epic")cls="rarity-epic";
            if(it.rarity==="legend")cls="rarity-legend";
            html += `<div class="item-card ${cls}">
                <div>${it.item_name}</div>
                <div>等级:${it.item_data.lv} 攻击:${it.item_data.atk||0} 防御:${it.item_data.def||0}</div>
            </div>`;
        });
        DOM.bagList.innerHTML = html;
        DOM.bagTip.innerText="背包加载完成";
    }catch(err){
        DOM.bagTip.innerText="背包加载失败，请点刷新背包";
        DOM.bagTip.classList.add("error");
        console.error("背包加载错误",err);
    }
}

DOM.btnLoadBag.onclick = async function(){
    if(GAME.isLoading){DOM.bagTip.innerText="正在刷新，请稍候";return;}
    GAME.isLoading = true;
    this.disabled = true;
    await loadBag(GAME.myUserId);
    GAME.isLoading = false;
    this.disabled = false;
};
