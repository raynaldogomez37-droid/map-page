//打字游戏核心逻辑
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

    init(){
        this.gameArea = document.getElementById("gameArea");
        this.inputEl = document.getElementById("typingInput");
        document.getElementById("startBtn").addEventListener("click",()=>this.startGame());
        this.inputEl.addEventListener("input",(e)=>this.onInput(e.target.value));
    },

    startGame(){
        if(this.gameRunning) return;
        if(this.hp <=0){
            alert("血量耗尽，请等待冷却结束！");
            return;
        }
        this.gameRunning = true;
        this.combo = 0;
        this.fallingWords = [];
        this.gameArea.innerHTML = "";
        this.inputEl.value = "";
        this.inputEl.style.display = "block";
        this.loop();
    },

    stopGame(){
        this.gameRunning = false;
        this.inputEl.style.display = "none";
    },

    spawnWord(){
        const rand = this.wordList[Math.floor(Math.random()*this.wordList.length)];
        const div = document.createElement("div");
        div.className = "fall-word";
        div.innerHTML = `<div>${rand.word}</div><div class='desc'>${rand.desc}</div>`;
        const left = Math.random()*80;
        div.style.left = left+"%";
        div.style.top = "0px";
        const speed = Math.min(2 + (this.combo/15),6);
        this.gameArea.appendChild(div);
        this.fallingWords.push({
            el:div,
            word:rand.word.toLowerCase(),
            top:0,
            speed:speed
        })
    },

    loop(){
        if(!this.gameRunning) return;
        //生成新词
        if(Math.random() < 0.02 + this.combo*0.0015){
            this.spawnWord();
        }
        //移动单词
        for(let i=this.fallingWords.length-1;i>=0;i--){
            const w = this.fallingWords[i];
            w.top += w.speed;
            w.el.style.top = w.top+"px";
            //落到底部，扣血
            if(w.top > this.gameArea.clientHeight){
                this.hp -=5;
                this.combo =0;
                w.el.remove();
                this.fallingWords.splice(i,1);
                this.updateTopUi();
                if(this.hp <=0){
                    this.stopGame();
                    alert("血量归零！进入3分钟冷却！");
                    setTimeout(()=>{
                        this.hp = this.maxHp;
                        this.updateTopUi();
                    },1000*60*3)
                }
            }
        }
        requestAnimationFrame(()=>this.loop());
    },

    onInput(text){
        if(!this.gameRunning) return;
        const inputText = text.toLowerCase().trim();
        for(let i=0;i<this.fallingWords.length;i++){
            const w = this.fallingWords[i];
            if(w.word === inputText){
                //输入正确
                this.exp +=8;
                this.combo +=1;
                w.el.remove();
                this.fallingWords.splice(i,1);
                this.inputEl.value = "";
                this.checkComboReward();
                this.rollDrop();
                this.checkLevelUp();
                this.updateTopUi();
                break;
            }
        }
    },

    checkComboReward(){
        if(this.combo >=12){
            this.combo =0;
            //获得宝箱
            GameData.bag.push({type:"chest",name:"连击宝箱"});
            alert("连击12！获得宝箱存入背包！");
        }
    },

    rollDrop(){
        const r = Math.random();
        if(r <0.04){
            GameData.bag.push({type:"gold",count:Math.floor(Math.random()*12)+3});
        }else if(r<0.07){
            //随机装备
            const equipList = [
                {name:"木剑",atk:3,hp:8},
                {name:"布甲",atk:1,hp:14},
                {name:"灵珠",atk:5,hp:5}
            ]
            const eq = equipList[Math.floor(Math.random()*equipList.length)];
            GameData.bag.push({type:"equip",...eq});
        }else if(r<0.095){
            GameData.bag.push({type:"chest",name:"掉落宝箱"});
        }
    },

    checkLevelUp(){
        const needExp = this.level * 60;
        if(this.exp >= needExp){
            this.exp -= needExp;
            this.level +=1;
            this.maxHp +=12;
            this.hp = this.maxHp;
            alert(`升级！当前等级${this.level}`);
        }
    },

    updateTopUi(){
        document.getElementById("lvText").innerText = this.level;
        document.getElementById("expBar").style.width = (this.exp/(this.level*60)*100)+"%";
        document.getElementById("hpText").innerText = `${this.hp}/${this.maxHp}`;
        let atk = 2;
        GameData.wearingEquip.forEach(e=>{
            if(e.atk) atk += e.atk;
        })
        document.getElementById("atkText").innerText = atk;
    }
}

//全局游戏数据
window.GameData = {
    bag:[],
    warehouse:[],
    wearingEquip:[],
    gold:0
}
