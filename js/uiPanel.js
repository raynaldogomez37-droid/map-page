const UiPanel = {
    init(){
        document.getElementById("btnBag").onclick = ()=>this.openBag();
        document.getElementById("btnWare").onclick = ()=>this.openWarehouse();
        document.getElementById("btnAttr").onclick = ()=>this.openAttr();
        document.getElementById("btnHome").onclick = ()=>this.backHome();
        document.getElementById("avatarBox").onclick = ()=>this.openEquipView();
        document.getElementById("settingBtn").onclick = ()=>this.openSetting();
        document.querySelectorAll(".panel-close").forEach(el=>{
            el.onclick = ()=>this.closeAllPanel();
        })
    },

    closeAllPanel(){
        document.querySelectorAll(".panel-wrap").forEach(p=>p.style.display="none");
    },

    openBag(){
        this.closeAllPanel();
        const panel = document.getElementById("bagPanel");
        panel.style.display="block";
        const listDom = document.getElementById("bagList");
        listDom.innerHTML = "";
        GameData.bag.forEach((item,idx)=>{
            const div = document.createElement("div");
            div.className="item-row";
            if(item.type === "chest"){
                div.innerText = item.name;
                div.onclick = ()=>{
                    this.openChest(idx);
                }
            }else if(item.type === "gold"){
                div.innerText = `金币 x${item.count}`;
            }else if(item.type === "equip"){
                div.innerText = `${item.name} 攻击${item.atk} 血量${item.hp}`;
                div.onclick = ()=>{
                    GameData.wearingEquip.push(item);
                    GameData.bag.splice(idx,1);
                    TypingGame.updateTopUi();
                    TypingGame.save();
                    this.openBag();
                }
            }
            listDom.appendChild(div);
        })
    },

    openChest(bagIndex){
        GameData.bag.splice(bagIndex,1);
        const r = Math.random();
        if(r<0.35){
            alert("宝箱是空的！");
        }else if(r<0.65){
            const goldGet = Math.floor(Math.random()*25)+8;
            GameData.gold += goldGet;
            alert(`开出金币${goldGet}`);
        }else{
            const equipList = [
                {name:"铁剑",atk:6,hp:10},
                {name:"皮甲",atk:2,hp:22},
                {name:"灵石吊坠",atk:8,hp:7}
            ]
            const eq = equipList[Math.floor(Math.random()*equipList.length)];
            GameData.bag.push({type:"equip",...eq});
            alert(`开出装备：${eq.name}`);
        }
        TypingGame.save();
        this.openBag();
    },

    openWarehouse(){
        this.closeAllPanel();
        const panel = document.getElementById("warePanel");
        panel.style.display="block";
        const listDom = document.getElementById("wareList");
        listDom.innerHTML="";
        GameData.warehouse.forEach((item,idx)=>{
            const div = document.createElement("div");
            div.className="item-row";
            div.innerText = `${item.name} 攻击${item.atk} 血量${item.hp}`;
            listDom.appendChild(div);
        })
    },

    openAttr(){
        this.closeAllPanel();
        document.getElementById("attrPanel").style.display="block";
        document.getElementById("attrText").innerText =
`等级：${TypingGame.level}
经验：${TypingGame.exp}
血量上限：${TypingGame.maxHp}
金币：${GameData.gold}`;
    },

    openEquipView(){
        this.closeAllPanel();
        document.getElementById("equipPanel").style.display="block";
        const wearDom = document.getElementById("wearList");
        wearDom.innerHTML="";
        GameData.wearingEquip.forEach(eq=>{
            const div = document.createElement("div");
            div.className="item-row";
            div.innerText = `${eq.name} 攻击${eq.atk} 血量${eq.hp}`;
            wearDom.appendChild(div);
        })
    },

    openSetting(){
        this.closeAllPanel();
        document.getElementById("settingPanel").style.display="block";
        document.getElementById("logoutBtn").onclick = ()=>{
            alert("退出账号，回到登录页");
            location.reload();
        }
    },

    backHome(){
        TypingGame.stopGame();
        this.closeAllPanel();
    }
}

window.onload = function(){
    TypingGame.init();
    UiPanel.init();
}
