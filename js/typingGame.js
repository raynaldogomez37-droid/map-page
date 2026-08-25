const TypingGame = {
    gameRunning: false,
    hp: 100,
    maxHp: 100,
    exp: 0,
    level: 1,
    combo: 0,
    wordList: [
        {word:"apple",desc:"苹果"},
        {word:"banana",desc:"香蕉"},
        {word:"cat",desc:"猫"},
        {word:"dog",desc:"狗"},
        {word:"elephant",desc:"大象"},
        {word:"flower",desc:"花朵"},
        {word:"grape",desc:"葡萄"},
        {word:"honey",desc:"蜂蜜"},
        {word:"island",desc:"岛屿"},
        {word:"jungle",desc:"丛林"}
    ],
    fallingWords:[],
    gameArea:null,
    inputEl:null,
    startBtn:null,

    init(){
        this.gameArea = document.getElementById("gameArea");
        this.inputEl = document.getElementById("typingInput");
        this.startBtn = document.getElementById("startBtn");

        this.startBtn.addEventListener("click",()=>this.startGame());
        // 回车提交单词
        this.inputEl.addEventListener("keydown", (e)=>{
            if(e.key === "Enter"){
                e.preventDefault();
                this.onSubmit();
            }
        });

        this.loadSave();
        this.updateTopUi();
    },

    save(){
        const saveObj = {
            hp:this.hp,
            maxHp:this.maxHp,
            exp:this.exp,
            level:this.level,
            bag:GameData.bag,
            warehouse:GameData.warehouse,
            wearingEquip:GameData.wearingEquip,
            gold:GameData.gold
        }
        localStorage.setItem("typingSave",JSON.stringify(saveObj));
    },

    loadSave(){
        const str = localStorage.getItem("typingSave");
        if(!str) return;
        try{
            const d = JSON.parse(str);
            this.hp = d.hp ?? 100;
            this.maxHp = d.maxHp ?? 100;
            this.exp = d.exp ?? 0;
            this.level = d.level ?? 1;
            GameData.bag = d.bag ?? [];
            GameData.warehouse = d.warehouse ?? [];
            GameData.wearingEquip = d.wearingEquip ?? [];
            GameData.gold = d.gold ?? 0;
        }catch(e){
            console.log("存档读取失败",e);
        }
    },

    startGame(){
        if(this.gameRunning) return;

        if(this.hp <= 0){
            alert("血量耗尽，请等待冷却结束！");
            return;
        }

        this.gameRunning = true;
        this.combo = 0;
        this.fallingWords = [];

        this.startBtn.style.display = "none";

        const childs = Array.from(this.gameArea.children);
        childs.forEach(el=>{
            if(el.classList.contains("fall-word")) el.remove();
        });

        this.inputEl.value = "";
        this.inputEl.style.display = "block";

        setTimeout(()=>{
            this.inputEl.focus();
        }, 100);

        this.loop();
    },

    stopGame(){
        this.gameRunning = false;
        this.startBtn.style.display = "block";
        this.save();
    },

    spawnWord(){
        if(!this.gameRunning) return;

        const rand = this.wordList[Math.floor(Math.random()*this.wordList.length)];
        const div = document.createElement("div");
        div.className = "fall-word";
        div.innerHTML = `<div>${rand.word}</div><div class='desc'>${rand.desc}</div>`;

        const left = Math.random() * 80;
        div.style.left = left + "%";
        div.style.top = "0px";

        // 基础速度大幅降低，连击只小幅加速
        const speed = Math.min(0.4 + (this.combo / 60), 1.6);

        this.gameArea.appendChild(div);
        this.fallingWords.push({
            el:div,
            word:rand.word.toLowerCase(),
            top:0,
            speed:speed
        });
    },

    loop(){
        if(!this.gameRunning) return;

        // 单词生成概率降低，不会刷一大堆
        if(Math.random() < 0.006 + this.combo * 0.0004){
            this.spawnWord();
        }

        for(let i = this.fallingWords.length - 1; i >= 0; i--){
            const w = this.fallingWords[i];
            w.top += w.speed;
            w.el.style.top = w.top + "px";

            if(w.top > this.gameArea.clientHeight - 60){
                this.hp -= 5;
                this.combo = 0;

                w.el.remove();
                this.fallingWords.splice(i, 1);

                this.updateTopUi();
                this.save();

                if(this.hp <= 0){
                    this.stopGame();
                    alert("血量归零！进入3分钟冷却！");

                    setTimeout(()=>{
                        this.hp = this.maxHp;
                        this.updateTopUi();
                        this.save();
                    }, 1000 * 60 * 3);

                    return;
                }
            }
        }

        requestAnimationFrame(()=>this.loop());
    },

    // 回车提交单词进行匹配
    onSubmit(){
        if(!this.gameRunning) return;
        const inputText = this.inputEl.value.toLowerCase().trim();
        if(!inputText){
            return;
        }

        let hit = false;
        for(let i = 0; i < this.fallingWords.length; i++){
            const w = this.fallingWords[i];
            if(w.word === inputText){
                this.exp += 8;
                this.combo += 1;

                w.el.remove();
                this.fallingWords.splice(i, 1);
                hit = true;

                this.checkComboReward();
                this.rollDrop();
                this.checkLevelUp();
                this.updateTopUi();
                this.save();

                break;
            }
        }
        // 提交之后清空输入框，保持焦点继续输入
        this.inputEl.value = "";
        this.inputEl.focus();
    },

    checkComboReward(){
        if(this.combo >= 12){
            this.combo = 0;
            GameData.bag.push({type:"chest", name:"连击宝箱"});
            alert("连击12！获得宝箱存入背包！");
            this.save();
        }
    },

    rollDrop(){
        const r = Math.random();

        if(r < 0.04){
            GameData.bag.push({type:"gold", count:Math.floor(Math.random()*12)+3});
        }else if(r < 0.07){
            const equipList = [
                {name:"木剑", atk:3, hp:8},
                {name:"布甲", atk:1, hp:14},
                {name:"灵珠", atk:5, hp:5}
            ];
            const eq = equipList[Math.floor(Math.random()*equipList.length)];
            GameData.bag.push({type:"equip", ...eq});
        }else if(r < 0.095){
            GameData.bag.push({type:"chest", name:"掉落宝箱"});
        }

        this.save();
    },

    checkLevelUp(){
        const needExp = this.level * 60;

        if(this.exp >= needExp){
            this.exp -= needExp;
            this.level += 1;
            this.maxHp += 12;
            this.hp = this.maxHp;

            alert(`升级！当前等级${this.level}`);
            this.save();
        }
    },

    updateTopUi(){
        document.getElementById("lvText").innerText = this.level;

        const needExp = this.level * 60;
        document.getElementById("expBar").style.width = Math.min(100, (this.exp / needExp) * 100) + "%";

        document.getElementById("hpText").innerText = `${this.hp}/${this.maxHp}`;

        let atk = 2;
        GameData.wearingEquip.forEach(e=>{
            if(e.atk) atk += e.atk;
        });

        document.getElementById("atkText").innerText = atk;
    }
}

window.GameData = {
    bag:[],
    warehouse:[],
    wearingEquip:[],
    gold:0
};
