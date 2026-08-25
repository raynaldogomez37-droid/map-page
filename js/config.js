// 全局游戏配置
const CONFIG = {
    SUPABASE_URL: "https://akbkupgqscgzokwjnllr.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_rnKCzXAh4OL1DIDIrTUf4A_JLnjfbWr",
    DRAW_COST: 10
};

// 全局状态
window.GAME = {
    myUserId: sessionStorage.getItem("game_user_id") || null,
    isLoading: false
};

