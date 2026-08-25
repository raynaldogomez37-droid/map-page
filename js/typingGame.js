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
        this.inputEl.addEventListener("keydown", (e)=>{
            if(e.key === "Enter"){
                e.preventDefault();
                this.onSubmit();
            }
        });
        //页面初始化加载云端存档
        this.loadCloudSave();
        this.updateTopUi();
    },

    // =====云端保存，替换原来localStorage save()=====
    async saveCloud(){
        const user = supabase.auth.user();
        if(!user) return;
        const payload = {
            hp:this.hp,
            max_hp:this.maxHp,
            exp:this.exp,
            level:this.level,
            gold:GameData.gold,
            bag:GameData.bag,
            warehouse:GameData.warehouse,
            wearing_equip:GameData.wearingEquip
        }
        await supabase.from("player_save")
        .update(payload)
        .eq("user_id", user.id);
    },

    // =====读取云端存档，数据库同时计算是否处于冷却in_cooldown=====
    async loadCloudSave(){
        const user = supabase.auth.user();
        if(!user){
            alert("请先登录账号");
            this.startBtn.disabled = true;
            return;
        }
        const {data,error} = await supabase
        .from('player_save')
        .select(`*,
        cooldown_end_ts > (extract(epoch from now())*1000) as in_cooldown
        `)
        .eq("user_id",user.id)
        .single();

        //新注册用户没有存档记录 → 创建初始存档
        if(error && error.code === 'PGRST116'){
            await supabase.from("player_save").insert({
                user_id:user.id,
                hp:100,
                max_hp:100,
                exp:0,
                level:1,
                gold:0,
                cooldown_end_ts:0
            })
            return await this.loadCloudSave();
        }
        if(error || !data) return;

        //赋值游戏变量
        this.hp = data.hp;
        this.maxHp = data.max_hp;
        this.exp = data.exp;
        this.level = data.level;
        GameData.bag = data.bag;
        GameData.warehouse = data.warehouse;
        GameData.wearingEquip = data.wearing_equip;
        GameData.gold = data.gold;

        //数据库返回的冷却状态，不受手机系统时间篡改影响
        if(data.in_cooldown){
            this.startBtn.disabled = true;
            this.startBtn.innerText = "死亡冷却中";
        }else{
            this.startBtn.disabled = false;
            this.startBtn.innerText = "开始训练";
        }
        this.updateTopUi();
    },

    startGame(){
        if(this.gameRunning) return;
        //开局先拉一次云端最新状态确认冷却
        this.loadCloudSave().then(()=>{
            if(this.startBtn.disabled){
                alert("当前处于死亡冷却，无法开始游戏");
                return;
            }
            if(this.hp <= 0){
                alert("血量耗尽！");
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
        })
    },

    stopGame(){
        this.gameRunning = false;
        this.startBtn.style.display = "block";
        this.saveCloud();
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
        this.gameArea.appendChild(div);
        this.fallingWords.push({
            el:div,
            word:rand.word.toLowerCase(),
            top:0
        });
    },

    loop(){
        if(!this.gameRunning) return;
        const spawnRate = 0.0015 + this.combo * 0.00008;
        if(Math.random() < spawnRate){
            this.spawnWord();
        }
        const baseSpeed = 0.2;
        const maxSpeed = 0.6;
        const currentSpeed = Math.min(baseSpeed + (this.combo / 120), maxSpeed);

        for(let i = this.fallingWords.length - 1; i >= 0; i--){
            const w = this.fallingWords[i];
            w.top += currentSpeed;
            w.el.style.top = w.top + "px";

            if(w.top > this.gameArea.clientHeight - 60){
                this.hp -= 5;
                this.combo = 0;
                w.el.remove();
                this.fallingWords.splice(i, 1);
                this.updateTopUi();
                this.saveCloud();

                if(this.hp <= 0){
                    this.stopGame();
                    alert("血量归零！进入3分钟死亡冷却！");
                    //死亡写入冷却时间戳到Supabase数据库
                    (async ()=>{
                        const user = supabase.auth.user();
                        const cdMs = Date.now() + 3 * 60 * 1000;
                        await supabase.from("player_save")
                        .update({cooldown_end_ts:cdMs})
                        .eq("user_id",user.id);
                        //刷新页面按钮状态
                        this.loadCloudSave();
                    })()
                    return;
                }
            }
        }
        requestAnimationFrame(()=>this.loop());
    },

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
                this.saveCloud();
                break;
            }
        }
        this.inputEl.value = "";
        this.inputEl.focus();
    },

    checkComboReward(){
        if(this.combo >= 12){
            this.combo = 0;
            GameData.bag.push({type:"chest", name:"连击宝箱"});
            alert("连击12！获得宝箱存入背包！");
            this.saveCloud();
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
        this.saveCloud();
    },

    checkLevelUp(){
        const needExp = this.level * 60;
        if(this.exp >= needExp){
            this.exp -= needExp;
            this.level += 1;
            this.maxHp += 12;
            this.hp = this.maxHp;
            alert(`升级！当前等级${this.level}`);
            this.saveCloud();
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
