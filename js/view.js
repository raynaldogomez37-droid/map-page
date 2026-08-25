// DOM元素全局导出给其他脚本使用
window.DOM = {
    viewSplash: document.getElementById('viewSplash'),
    viewLogin: document.getElementById('viewLogin'),
    viewGame: document.getElementById('viewGame'),
    btnManual: document.getElementById('btnManual'),

    unameEl: document.getElementById('uname'),
    pwdEl: document.getElementById('pwd'),
    authTip: document.getElementById('authTip'),

    roleNameEl: document.getElementById('roleName'),
    goldNumEl: document.getElementById('goldNum'),
    btnDraw: document.getElementById('btnDraw'),
    drawResult: document.getElementById('drawResult'),
    drawTip: document.getElementById('drawTip'),
    btnLoadBag: document.getElementById('btnLoadBag'),
    bagList: document.getElementById('bagList'),
    bagTip: document.getElementById('bagTip')
};

// 切换视图
function setView(mode){
    DOM.viewSplash.classList.add('hide-view');
    DOM.viewLogin.classList.add('hide-view');
    DOM.viewGame.classList.add('hide-view');
    if(mode === 'splash') DOM.viewSplash.classList.remove('hide-view');
    if(mode === 'login') DOM.viewLogin.classList.remove('hide-view');
    if(mode === 'game') DOM.viewGame.classList.remove('hide-view');
}

// 启动页结束
function splashEnd(){
    clearTimeout(timerJump);
    clearTimeout(timerShowBtn);
    if(GAME.myUserId){
        setView("game");
        enterGame(GAME.myUserId);
    }else{
        setView("login");
    }
}

let timerJump = setTimeout(splashEnd,5000);
let timerShowBtn = setTimeout(()=>{
    DOM.btnManual.style.display="inline-block";
},8000);

DOM.btnManual.onclick = splashEnd;
