DOM.btnDraw.onclick = async function(){
    if(GAME.isLoading){DOM.drawTip.innerText="正在抽卡，请稍候...";return;}
    if(!GAME.myUserId){DOM.drawTip.innerText="请先登录";return;}
    GAME.isLoading = true;
    DOM.drawTip.innerText="扣金币，抽取装备中...";
    DOM.drawTip.classList.remove("error");
    this.disabled = true;
    try{
        const r1 = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(GAME.myUserId)}`,{headers:{"apikey":CONFIG.SUPABASE_ANON_KEY}});
        const pArr = await r1.json();
        const p = pArr[0];
        if(p.gold < CONFIG.DRAW_COST){
            DOM.drawResult.innerHTML="<p>金币不足！</p>";
            DOM.drawTip.innerText="";
            return;
        }
        await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(GAME.myUserId)}`,{
            method:"PATCH",
            headers:{
                "apikey":CONFIG.SUPABASE_ANON_KEY,
                "Content-Type":"application/json"
            },
            body:JSON.stringify({gold:p.gold - CONFIG.DRAW_COST})
        });
        const rnd = Math.random();
        let item,rarityClass;
        if(rnd<0.5){
            item = {item_name:"普通铁剑",item_data:{lv:1,atk:5},rarity:"common",user_id:GAME.myUserId};
            rarityClass="rarity-common";
        }else if(rnd<0.8){
            item = {item_name:"灵木法杖",item_data:{lv:2,atk:12},rarity:"rare",user_id:GAME.myUserId};
            rarityClass="rarity-rare";
        }else if(rnd<0.95){
            item = {item_name:"紫电宝甲",item_data:{lv:3,def:20},rarity:"epic",user_id:GAME.myUserId};
            rarityClass="rarity-epic";
        }else{
            item = {item_name:"九霄仙剑",item_data:{lv:5,atk:55},rarity:"legend",user_id:GAME.myUserId};
            rarityClass="rarity-legend";
        }
        const insertRes = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/items`,{
            method:"POST",
            headers:{
                "apikey":CONFIG.SUPABASE_ANON_KEY,
                "Content-Type":"application/json"
            },
            body:JSON.stringify([item])
        });
        const respText = await insertRes.text();
        if(!insertRes.ok){
            let errInfo = respText.trim() ? JSON.parse(respText) : "服务器无返回";
            throw new Error("装备写入失败："+JSON.stringify(errInfo));
        }
        DOM.drawResult.innerHTML = `<div class="item-card ${rarityClass}"><p>抽到：${item.item_name}</p></div>`;
        DOM.goldNumEl.innerText = p.gold - CONFIG.DRAW_COST;
        DOM.drawTip.innerText="抽卡成功！";
        await loadBag(GAME.myUserId);
    }catch(err){
        DOM.drawTip.innerText="抽卡异常："+err.message;
        DOM.drawTip.classList.add("error");
        console.error("抽卡错误",err);
    }finally{
        GAME.isLoading = false;
        this.disabled = false;
        setTimeout(()=>DOM.drawTip.classList.remove("error"),2500);
    }
};
