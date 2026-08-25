//注册
document.getElementById("btnRegister").onclick = async function(){
    if(GAME.isLoading){DOM.authTip.innerText="正在注册，请稍候...";return;}
    const username = DOM.unameEl.value.trim();
    const password = DOM.pwdEl.value.trim();
    if(!username||!password){DOM.authTip.innerText="请填写用户名密码";return;}
    GAME.isLoading = true;
    DOM.authTip.innerText="正在注册中...";
    DOM.authTip.classList.remove("error");
    this.disabled = true;
    try{
        const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/accounts`,{
            method:"POST",
            headers:{
                "apikey":CONFIG.SUPABASE_ANON_KEY,
                "Content-Type":"application/json",
                "Prefer":"return=representation"
            },
            body:JSON.stringify([{username,password}])
        });
        const data = await res.json();
        if(res.ok){
            DOM.authTip.innerText="注册成功，请登录";
        }else{
            DOM.authTip.innerText="注册失败："+JSON.stringify(data);
            DOM.authTip.classList.add("error");
        }
    }catch(err){
        DOM.authTip.innerText="网络异常，请检查网络";
        DOM.authTip.classList.add("error");
        console.error(err);
    }finally{
        GAME.isLoading = false;
        this.disabled = false;
    }
};

//登录
document.getElementById("btnLogin").onclick = async function(){
    if(GAME.isLoading){DOM.authTip.innerText="正在登录，请稍候...";return;}
    const username = DOM.unameEl.value.trim();
    const password = DOM.pwdEl.value.trim();
    if(!username||!password){DOM.authTip.innerText="请填写用户名密码";return;}
    GAME.isLoading = true;
    DOM.authTip.innerText="正在登录中...";
    DOM.authTip.classList.remove("error");
    this.disabled = true;
    try{
        const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/accounts?username=eq.${encodeURIComponent(username)}&password=eq.${encodeURIComponent(password)}`,{
            method:"GET",
            headers:{"apikey":CONFIG.SUPABASE_ANON_KEY}
        });
        const arr = await res.json();
        if(arr.length===0){
            DOM.authTip.innerText="用户名或密码错误";
            DOM.authTip.classList.add("error");
            return;
        }
        const user = arr[0];
        GAME.myUserId = user.id;
        sessionStorage.setItem("game_user_id", GAME.myUserId);
        setView("game");
        await enterGame(GAME.myUserId);
    }catch(err){
        DOM.authTip.innerText="网络异常，请检查网络";
        DOM.authTip.classList.add("error");
        console.error("登录网络错误：",err);
    }finally{
        GAME.isLoading = false;
        this.disabled = false;
    }
};

//退出登录
document.getElementById("btnLogout").onclick = function(){
    GAME.myUserId = null;
    sessionStorage.removeItem("game_user_id");
    DOM.unameEl.value="";
    DOM.pwdEl.value="";
    DOM.authTip.innerText="";
    DOM.authTip.classList.remove("error");
    setView("login");
};
