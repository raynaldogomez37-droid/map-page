async function enterGame(accountId){
    DOM.roleNameEl.innerText = "加载中...";
    DOM.goldNumEl.innerText = "加载中...";
    DOM.drawResult.innerHTML = "";
    DOM.bagList.innerHTML = "";
    DOM.bagTip.innerText="正在加载角色数据，请稍候...";
    DOM.bagTip.classList.remove("error");
    try{
        const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(accountId)}`,{
            headers:{"apikey":CONFIG.SUPABASE_ANON_KEY}
        });
        const playerArr = await res.json();
        let player;
        if(playerArr.length===0){
            const randName = "修仙者"+Math.floor(Math.random()*99999);
            await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/users`,{
                method:"POST",
                headers:{
                    "apikey":CONFIG.SUPABASE_ANON_KEY,
                    "Content-Type":"application/json",
                    "Prefer":"return=representation"
                },
                body:JSON.stringify([{id:accountId,name:randName,gold:100}])
            });
            player = {name:randName,gold:100};
        }else{
            player = playerArr[0];
        }
        DOM.roleNameEl.innerText = player.name;
        DOM.goldNumEl.innerText = player.gold;
        await loadBag(accountId);
    }catch(err){
        DOM.bagTip.innerText="角色加载失败，请刷新页面！网络或者接口异常";
        DOM.bagTip.classList.add("error");
        console.error("角色加载错误",err);
        DOM.roleNameEl.innerText = "异常";
        DOM.goldNumEl.innerText = "异常";
    }
}

