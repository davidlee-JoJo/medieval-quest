const W = 1280, H = 720;
const canvas = document.createElement('canvas');
canvas.width = W;
canvas.height = H;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

const keys = {};
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Tab' || e.key === 'Escape') e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.key] = false; });

const TILE = 32;

const CLASS_DATA = {
    warrior: { name: '戰士', maxHP: 120, baseAtk: 12, baseDef: 8, speed: 200, jump: -620, color: '#cc4444' },
    archer: { name: '弓箭手', maxHP: 80, baseAtk: 15, baseDef: 4, speed: 220, jump: -600, color: '#44aa44' },
    mage: { name: '法師', maxHP: 60, baseAtk: 20, baseDef: 2, speed: 180, jump: -580, color: '#8844cc' }
};

const ENEMY_DATA = {
    slime: { name: '史萊姆', maxHP: 30, atk: 5, def: 1, speed: 60, exp: 10, dropRate: 0.3, color: '#44cc44', w: 24, h: 18 },
    goblin: { name: '哥布林', maxHP: 50, atk: 10, def: 2, speed: 80, exp: 20, dropRate: 0.35, color: '#66aa33', w: 24, h: 28 },
    skeleton: { name: '骷髏', maxHP: 80, atk: 15, def: 3, speed: 70, exp: 35, dropRate: 0.4, color: '#cccccc', w: 24, h: 32 },
    darkKnight: { name: '黑暗騎士', maxHP: 150, atk: 25, def: 6, speed: 100, exp: 60, dropRate: 0.5, color: '#333355', w: 28, h: 34 },
    boss: { name: '魔王', maxHP: 500, atk: 40, def: 10, speed: 90, exp: 200, dropRate: 1.0, color: '#aa2222', w: 48, h: 56 }
};

const WEAPONS = [
    { id: 'wood_sword', name: '木劍', type: 'weapon', bonus: { atk: 2 }, dropWeight: 10 },
    { id: 'iron_sword', name: '鐵劍', type: 'weapon', bonus: { atk: 5 }, dropWeight: 8 },
    { id: 'steel_sword', name: '鋼劍', type: 'weapon', bonus: { atk: 9 }, dropWeight: 5 },
    { id: 'magic_sword', name: '魔法劍', type: 'weapon', bonus: { atk: 15 }, dropWeight: 2 },
    { id: 'long_bow', name: '長弓', type: 'weapon', bonus: { atk: 4 }, dropWeight: 10 },
    { id: 'crossbow', name: '十字弓', type: 'weapon', bonus: { atk: 8 }, dropWeight: 6 },
    { id: 'magic_staff', name: '魔法杖', type: 'weapon', bonus: { atk: 12 }, dropWeight: 4 },
    { id: 'ancient_staff', name: '遠古法杖', type: 'weapon', bonus: { atk: 18 }, dropWeight: 1 }
];
const ARMORS = [
    { id: 'cloth', name: '布衣', type: 'armor', bonus: { def: 1 }, dropWeight: 10 },
    { id: 'leather', name: '皮甲', type: 'armor', bonus: { def: 3 }, dropWeight: 8 },
    { id: 'chainmail', name: '鎖子甲', type: 'armor', bonus: { def: 6 }, dropWeight: 5 },
    { id: 'plate', name: '全身鎧甲', type: 'armor', bonus: { def: 10 }, dropWeight: 2 }
];
const ACCESSORIES = [
    { id: 'life_ring', name: '生命戒指', type: 'accessory', bonus: { hp: 20 }, dropWeight: 8 },
    { id: 'power_amulet', name: '力量護符', type: 'accessory', bonus: { atk: 5 }, dropWeight: 6 },
    { id: 'guard_pendant', name: '守護項鍊', type: 'accessory', bonus: { def: 4 }, dropWeight: 5 },
    { id: 'speed_boots', name: '疾風之靴', type: 'accessory', bonus: { speed: 30 }, dropWeight: 4 }
];

const LEVEL_DATA = [
    { name: '草原', bgTop: '#5a8c4a', bgBottom: '#87CEEB', groundColor: '#4a8c3f', platColor: '#6b4423', worldW: 3200,
        platforms: [
            { x: 0, y: 660, w: 3200, h: 60 }, { x: 300, y: 520, w: 160, h: 20 }, { x: 600, y: 400, w: 180, h: 20 },
            { x: 900, y: 500, w: 140, h: 20 }, { x: 1200, y: 380, w: 160, h: 20 }, { x: 1500, y: 460, w: 200, h: 20 },
            { x: 1850, y: 340, w: 140, h: 20 }, { x: 2100, y: 440, w: 160, h: 20 }, { x: 2450, y: 360, w: 180, h: 20 },
            { x: 2750, y: 500, w: 200, h: 20 }
        ],
        enemies: [{ type: 'slime', x: 500, y: 600 },{ type: 'slime', x: 1000, y: 600 },{ type: 'slime', x: 1400, y: 600 },
            { type: 'goblin', x: 1700, y: 440 },{ type: 'goblin', x: 2200, y: 420 },{ type: 'goblin', x: 2600, y: 600 }],
        playerStart: { x: 80, y: 600 }, exit: { x: 3000, y: 600 } },
    { name: '森林', bgTop: '#1a3a1a', bgBottom: '#2d5a2d', groundColor: '#3d6b3a', platColor: '#5c4033', worldW: 3600,
        platforms: [
            { x: 0, y: 660, w: 3600, h: 60 }, { x: 200, y: 540, w: 140, h: 20 }, { x: 400, y: 430, w: 160, h: 20 },
            { x: 650, y: 340, w: 180, h: 20 }, { x: 950, y: 450, w: 140, h: 20 }, { x: 1200, y: 350, w: 160, h: 20 },
            { x: 1450, y: 440, w: 140, h: 20 }, { x: 1700, y: 300, w: 200, h: 20 }, { x: 2000, y: 410, w: 160, h: 20 },
            { x: 2300, y: 350, w: 140, h: 20 }, { x: 2600, y: 440, w: 180, h: 20 }, { x: 2900, y: 350, w: 160, h: 20 },
            { x: 3200, y: 450, w: 200, h: 20 }
        ],
        enemies: [{ type: 'goblin', x: 400, y: 600 },{ type: 'goblin', x: 900, y: 600 },{ type: 'goblin', x: 1400, y: 400 },
            { type: 'skeleton', x: 1800, y: 280 },{ type: 'skeleton', x: 2200, y: 330 },{ type: 'goblin', x: 2600, y: 600 },
            { type: 'skeleton', x: 3000, y: 330 }],
        playerStart: { x: 80, y: 600 }, exit: { x: 3400, y: 600 } },
    { name: '城堡', bgTop: '#2a2a3a', bgBottom: '#4a4a5a', groundColor: '#666666', platColor: '#555566', worldW: 3200,
        platforms: [
            { x: 0, y: 660, w: 3200, h: 60 }, { x: 150, y: 520, w: 200, h: 20 }, { x: 450, y: 400, w: 160, h: 20 },
            { x: 750, y: 300, w: 180, h: 20 }, { x: 1050, y: 400, w: 140, h: 20 }, { x: 1300, y: 300, w: 160, h: 20 },
            { x: 1550, y: 420, w: 140, h: 20 }, { x: 1800, y: 300, w: 200, h: 20 }, { x: 2100, y: 400, w: 160, h: 20 },
            { x: 2350, y: 300, w: 180, h: 20 }, { x: 2650, y: 400, w: 200, h: 20 }, { x: 2900, y: 500, w: 160, h: 20 }
        ],
        enemies: [{ type: 'skeleton', x: 400, y: 600 },{ type: 'skeleton', x: 800, y: 280 },{ type: 'skeleton', x: 1200, y: 600 },
            { type: 'darkKnight', x: 1600, y: 400 },{ type: 'darkKnight', x: 2000, y: 280 },{ type: 'skeleton', x: 2400, y: 600 },
            { type: 'darkKnight', x: 2800, y: 380 }],
        playerStart: { x: 80, y: 600 }, exit: { x: 3000, y: 600 } },
    { name: '魔王城', bgTop: '#1a0a0a', bgBottom: '#2a1a1a', groundColor: '#553333', platColor: '#442222', worldW: 3200,
        platforms: [
            { x: 0, y: 660, w: 3200, h: 60 }, { x: 300, y: 520, w: 300, h: 20 }, { x: 800, y: 420, w: 200, h: 20 },
            { x: 1200, y: 320, w: 250, h: 20 }, { x: 1600, y: 440, w: 200, h: 20 }, { x: 1950, y: 340, w: 180, h: 20 },
            { x: 2300, y: 440, w: 300, h: 20 }, { x: 2700, y: 560, w: 500, h: 100 }
        ],
        enemies: [{ type: 'darkKnight', x: 500, y: 500 },{ type: 'darkKnight', x: 1000, y: 400 },
            { type: 'darkKnight', x: 1800, y: 600 },{ type: 'boss', x: 2850, y: 500 }],
        playerStart: { x: 80, y: 600 }, exit: { x: 3050, y: 500 } }
];

let gameState = 'menu'; // menu | playing | gameOver
let currentLevel = 0;
let player, platforms, enemies, items, exitPos;
let camera = { x: 0, y: 0 };
let levelTitle = '';
let levelTitleTimer = 0;
let lastTime = 0;
let playerData = null;
let projectiles = [];
let bossProjectiles = [];
let inventoryOpen = false;
let inventoryItems = [];

function resetGame() {
    player = {
        x: 80, y: 600, vx: 0, vy: 0,
        currentClass: 'warrior',
        level: 1, exp: 0,
        maxHP: 0, hp: 0,
        baseAtk: 0, baseDef: 0,
        equipment: { weapon: null, armor: null, accessory: null },
        facingRight: true, attacking: false, attackTimer: 0,
        invulnerable: 0, onGround: false,
        walkFrame: 0, walkTimer: 0
    };
    updateClassBaseStats(player);
    player.hp = player.maxHP;
    currentLevel = 0;
    projectiles = [];
    bossProjectiles = [];
    inventoryItems = [];
    inventoryOpen = false;
    buildLevel(0);
}

function buildLevel(idx) {
    const lv = LEVEL_DATA[idx];
    platforms = [];
    for (const p of lv.platforms) platforms.push({ x: p.x, y: p.y, w: p.w, h: p.h });
    enemies = [];
    for (const ed of lv.enemies) {
        const d = ENEMY_DATA[ed.type];
        enemies.push({
            x: ed.x, y: ed.y, vx: 0, vy: 0,
            type: ed.type, name: d.name,
            maxHP: d.maxHP, hp: d.maxHP,
            atk: d.atk, def: d.def,
            speed: d.speed, exp: d.exp,
            dropRate: d.dropRate,
            w: d.w, h: d.h,
            facingRight: false,
            agroRange: 250, attackRange: 40,
            attackCooldown: 0, hitFlag: false,
            walkFrame: 0, walkTimer: 0,
            moveDir: -1, moveTimer: 0,
            alive: true, onGround: false,
            rangedCooldown: 0,
            color: d.color
        });
    }
    items = [];
    exitPos = lv.exit;
    player.x = lv.playerStart.x;
    player.y = lv.playerStart.y;
}

function getRandomDrop() {
    const allItems = [...WEAPONS, ...ARMORS, ...ACCESSORIES];
    let totalWeight = 0;
    for (const it of allItems) totalWeight += it.dropWeight;
    let r = Math.random() * totalWeight;
    for (const it of allItems) { r -= it.dropWeight; if (r <= 0) return { ...it }; }
    return { ...allItems[0] };
}

function colRect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const GRAVITY = 900;

function update(dt) {
    if (gameState === 'menu') return;
    if (gameState === 'title') {
        levelTitleTimer -= dt;
        if (levelTitleTimer <= 0) gameState = 'playing';
        return;
    }

    const p = player;
    const sec = dt / 1000;

    p.vy += GRAVITY * sec;

    if (keys['ArrowLeft'] || keys['a'] || keys['A']) { p.vx = -1; p.facingRight = false; }
    else if (keys['ArrowRight'] || keys['d'] || keys['D']) { p.vx = 1; p.facingRight = true; }
    else { p.vx = 0; }
    const spd = CLASS_DATA[p.currentClass].speed + (p.equipment.accessory && p.equipment.accessory.bonus.speed ? p.equipment.accessory.bonus.speed : 0);
    p.vx *= spd;

    if (!inventoryOpen && keys['Tab']) { keys['Tab'] = false; inventoryOpen = true; }
    else if (inventoryOpen && keys['Tab']) { keys['Tab'] = false; inventoryOpen = false; }

    if (inventoryOpen) {
        for (let n = 0; n <= 9; n++) {
            if (keys[String(n)]) {
                keys[String(n)] = false;
                const slotIdx = n === 0 ? 9 : n - 1;
                if (slotIdx < inventoryItems.length) {
                    const selected = inventoryItems[slotIdx];
                    const old = p.equipment[selected.type];
                    if (old && old.bonus.hp) { p.maxHP -= old.bonus.hp; if (p.hp > p.maxHP) p.hp = p.maxHP; }
                    p.equipment[selected.type] = selected;
                    if (selected.bonus.hp) { p.maxHP += selected.bonus.hp; p.hp = Math.min(p.hp + selected.bonus.hp, p.maxHP); }
                    promptMsg = '裝備了 ' + selected.name;
                    promptTimer = 1500;
                }
            }
        }
        if (keys['Escape'] || keys['e']) { keys['Escape'] = false; keys['e'] = false; inventoryOpen = false; }
    }

    if (keys[' '] && !p.attacking) {
        p.attacking = true;
        p.attackTimer = 400;
        const atk = getTotalAtk(p);
        const dir = p.facingRight ? 1 : -1;

        if (p.currentClass === 'warrior') {
            for (const e of enemies) {
                if (!e.alive) continue;
                const dx = e.x - p.x;
                const dy = e.y - p.y;
                if (Math.abs(dy) < 50 && dx * dir > 0 && Math.abs(dx) < 75) {
                    const dmg = Math.max(1, atk - e.def);
                    e.hp -= dmg;
                    if (e.hp <= 0) {
                        e.alive = false;
                        p.exp += e.exp;
            if (Math.random() < e.dropRate) {
                let drop;
                let attempts = 0;
                do {
                    drop = getRandomDrop();
                    attempts++;
                } while (attempts < 20 && inventoryItems.some(it => it.id === drop.id));
                items.push({ x: e.x, y: e.y, data: drop, collected: false, bobTimer: 0 });
            }
                    }
                }
            }
        } else if (p.currentClass === 'archer') {
            const arrow = { x: p.x + dir * 20, y: p.y - 8, vx: dir * 500, vy: -80, alive: true, atk: atk };
            projectiles.push(arrow);
        } else {
            const bolt = { x: p.x + dir * 20, y: p.y, vx: dir * 400, vy: 0, alive: true, atk: atk };
            projectiles.push(bolt);
        }
    }
    if (p.attacking) { p.attackTimer -= dt; if (p.attackTimer <= 0) p.attacking = false; }

    if (keys['1']) { keys['1'] = false; p.currentClass = 'warrior'; updateClassBaseStats(p); }
    if (keys['2']) { keys['2'] = false; p.currentClass = 'archer'; updateClassBaseStats(p); }
    if (keys['3']) { keys['3'] = false; p.currentClass = 'mage'; updateClassBaseStats(p); }

    if (p.invulnerable > 0) p.invulnerable -= dt;

    const lv = LEVEL_DATA[currentLevel];

    p.x += p.vx * sec;
    p.y += p.vy * sec;

    if (p.x < 0) p.x = 0;
    if (p.x > lv.worldW) p.x = lv.worldW;

    p.onGround = false;
    const pTop = p.y - 20, pBot = p.y + 20;
    const pLeft = p.x - 8, pRight = p.x + 8;
    for (const pl of platforms) {
        if (p.vy >= 0 &&
            pRight > pl.x && pLeft < pl.x + pl.w &&
            pBot >= pl.y && pBot <= pl.y + pl.h + 6 &&
            pBot - p.vy * sec <= pl.y + 4) {
            p.y = pl.y - 20;
            p.vy = 0;
            p.onGround = true;
        }
        if (p.vy < 0 &&
            pRight > pl.x && pLeft < pl.x + pl.w &&
            pTop <= pl.y + pl.h && pTop >= pl.y - 6 &&
            pTop - p.vy * sec >= pl.y + pl.h - 4) {
            p.vy = 0;
        }
    }

    if ((keys['ArrowUp'] || keys['w'] || keys['W']) && p.onGround) {
        p.vy = CLASS_DATA[p.currentClass].jump;
        p.onGround = false;
        keys['ArrowUp'] = false;
        keys['w'] = false;
        keys['W'] = false;
    }

    if (p.y > H + 100) { p.hp = 0; }
    if (p.hp <= 0) { gameState = 'gameOver'; playerData = { level: p.level, currentClass: p.currentClass, totalAtk: getTotalAtk(p), totalDef: getTotalDef(p), won: false }; return; }

    for (const e of enemies) {
        if (!e.alive) continue;
        e.vy += GRAVITY * sec;
        e.onGround = false;

        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (e.attackCooldown > 0) e.attackCooldown -= dt;

        if (e.rangedCooldown > 0) e.rangedCooldown -= dt;
        if (e.type === 'boss' && dist < e.agroRange * 2 && e.rangedCooldown <= 0 && dist > 60) {
            const bDir = dx > 0 ? 1 : -1;
            const bVy = -(280 + Math.random() * 80) - Math.abs(dx) * 0.08;
            bossProjectiles.push({ x: e.x + bDir * e.w/2, y: e.y - e.h/3, vx: bDir * (180 + Math.random() * 60), vy: bVy, alive: true, atk: e.atk * 0.7, gravity: 400 });
            e.rangedCooldown = 2500;
        }

        if (dist < e.attackRange + 20) {
            e.vx = 0;
            if (e.attackCooldown <= 0) {
                const dmg = Math.max(1, e.atk - getTotalDef(p));
                p.hp -= dmg;
                p.invulnerable = 800;
                e.attackCooldown = 1200;
            }
        } else if (dist < e.agroRange) {
            e.vx = (dx > 0 ? 1 : -1) * e.speed;
            e.facingRight = dx > 0;
            if (Math.abs(e.vx) > 10) { e.walkTimer += dt; if (e.walkTimer > 120) { e.walkTimer = 0; e.walkFrame++; } }
        } else {
            e.moveTimer += dt;
            if (e.moveTimer > 2000) { e.moveTimer = 0; e.moveDir = Math.random() > 0.5 ? -1 : 1; }
            e.vx = e.moveDir * e.speed * 0.4;
            if (Math.abs(e.vx) > 10) { e.walkTimer += dt; if (e.walkTimer > 120) { e.walkTimer = 0; e.walkFrame++; } }
        }

        e.x += e.vx * sec;
        e.y += e.vy * sec;

        const eBot = e.y + e.h / 2;
        for (const pl of platforms) {
            if (e.vy >= 0 &&
                e.x + e.w/2 > pl.x && e.x - e.w/2 < pl.x + pl.w &&
                eBot >= pl.y && eBot <= pl.y + pl.h + 6 &&
                eBot - e.vy * sec <= pl.y + 4) {
                e.y = pl.y - e.h / 2;
                e.vy = 0;
                e.onGround = true;
            }
        }
        if (!e.onGround && e.y > 800) { e.alive = false; }
    }

    for (let i = projectiles.length-1; i >= 0; i--) {
        const pr = projectiles[i];
        if (!pr.alive) { projectiles.splice(i, 1); continue; }
        pr.x += pr.vx * sec;
        pr.y += pr.vy * sec;

        if (Math.abs(pr.vy) > 0.1) pr.vy += 200 * sec;
        if (pr.x < p.x - 500 || pr.x > p.x + 500 || pr.y < -100 || pr.y > H + 100) {
            pr.alive = false;
            continue;
        }
        for (const e of enemies) {
            if (!e.alive) continue;
            if (Math.abs(pr.x - e.x) < e.w && Math.abs(pr.y - e.y) < e.h) {
                const dmg = Math.max(1, pr.atk - e.def);
                e.hp -= dmg;
                if (e.hp <= 0) {
                    e.alive = false;
                    p.exp += e.exp;
                    if (Math.random() < e.dropRate) {
                        const drop = getRandomDrop();
                        items.push({ x: e.x, y: e.y, data: drop, collected: false, bobTimer: 0 });
                    }
                }
                pr.alive = false;
                break;
            }
        }
    }

    for (let i = bossProjectiles.length-1; i >= 0; i--) {
        const bp = bossProjectiles[i];
        if (!bp.alive) { bossProjectiles.splice(i, 1); continue; }
        bp.x += bp.vx * sec;
        bp.y += bp.vy * sec;
        bp.vy += (bp.gravity || 400) * sec;
        if (bp.x < p.x - 600 || bp.x > p.x + 600 || bp.y > H + 100) {
            bp.alive = false;
            continue;
        }
        if (Math.abs(bp.x - p.x) < 24 && Math.abs(bp.y - p.y) < 28 && p.invulnerable <= 0) {
            const dmg = Math.max(1, bp.atk - getTotalDef(p));
            p.hp -= dmg;
            p.invulnerable = 600;
            bp.alive = false;
        }
        for (const pl of platforms) {
            if (bp.y > pl.y && bp.y < pl.y + pl.h && bp.x > pl.x && bp.x < pl.x + pl.w) {
                bp.alive = false;
                break;
            }
        }
    }

    if (p.hp < p.maxHP && p.hp > 0) {
        p.hp = Math.min(p.maxHP, p.hp + dt * 0.006);
    }
    if ((keys['h'] || keys['H']) && p.hp < p.maxHP) {
        keys['h'] = false; keys['H'] = false;
        p.hp = Math.min(p.maxHP, p.hp + 30);
        promptMsg = '回復 30 HP';
        promptTimer = 1500;
    }

    while (p.exp >= p.level * 50) {
        p.exp -= p.level * 50;
        p.level++;
        p.maxHP = CLASS_DATA[p.currentClass].maxHP + 5 * p.level;
        p.hp = Math.min(p.hp + 20, p.maxHP);
    }

    const totalAtk = getTotalAtk(p);
    const totalDef = getTotalDef(p);

    for (let i = items.length-1; i >= 0; i--) {
        const it = items[i];
        if (it.collected) continue;
        const dx = p.x - it.x;
        const dy = p.y - it.y;
        if (Math.abs(dx) < 24 && Math.abs(dy) < 32) {
            if (keys['e'] || keys['E']) {
                keys['e'] = false;
                keys['E'] = false;
                inventoryItems.push(it.data);
                items.splice(i, 1);
                promptMsg = '拾取了 ' + it.data.name + '（按 Tab 開啟裝備箱）';
                promptTimer = 2000;
            } else {
                promptMsg = '按 E 撿拾 ' + it.data.name;
                promptTimer = 100;
            }
        }
    }

    const ex = exitPos;
    if (Math.abs(p.x - ex.x) < 50 && p.y > ex.y - 20 && p.y < ex.y + 80) {
        if (currentLevel < LEVEL_DATA.length - 1) {
            currentLevel++;
            buildLevel(currentLevel);
            levelTitle = LEVEL_DATA[currentLevel].name;
            levelTitleTimer = 2000;
            gameState = 'title';
        } else {
            gameState = 'gameOver';
            playerData = { level: p.level, currentClass: p.currentClass, totalAtk: totalAtk, totalDef: totalDef, won: true };
        }
    }

    camera.x = Math.round(W / 2 - p.x);
    camera.y = Math.round(H / 2 - p.y);
    const maxCX = lv.worldW - W;
    if (camera.x > 0) camera.x = 0;
    if (camera.x < -maxCX) camera.x = -maxCX;
    if (camera.y > 0) camera.y = 0;
    if (camera.y < -(0)) camera.y = 0;
}

function updateClassBaseStats(p) {
    const cd = CLASS_DATA[p.currentClass];
    p.baseAtk = cd.baseAtk + 2 * p.level;
    p.baseDef = cd.baseDef + p.level;
    p.maxHP = cd.maxHP + 5 * p.level;
    if (p.hp > p.maxHP) p.hp = p.maxHP;
}

function getTotalAtk(p) {
    let atk = p.baseAtk;
    if (p.equipment.weapon && p.equipment.weapon.bonus.atk) atk += p.equipment.weapon.bonus.atk;
    if (p.equipment.accessory && p.equipment.accessory.bonus.atk) atk += p.equipment.accessory.bonus.atk;
    return atk;
}

function getTotalDef(p) {
    let def = p.baseDef;
    if (p.equipment.armor && p.equipment.armor.bonus.def) def += p.equipment.armor.bonus.def;
    if (p.equipment.accessory && p.equipment.accessory.bonus.def) def += p.equipment.accessory.bonus.def;
    return def;
}

let promptMsg = '';
let promptTimer = 0;

function draw() {
    ctx.clearRect(0, 0, W, H);

    if (gameState === 'menu') {
        drawMenu();
        return;
    }

    const lv = LEVEL_DATA[currentLevel];
    const cx = camera.x;
    const cy = camera.y;

    drawBackground(lv, cx, cy);

    for (const pl of platforms) {
        drawPlatform(pl, lv, cx, cy);
    }

    for (const e of enemies) {
        if (e.alive) drawEnemy(e, cx, cy);
    }

    for (const it of items) {
        drawItem(it, cx, cy);
    }

    drawPlayer(cx, cy);

    drawProjectiles(cx, cy);
    drawBossProjectiles(cx, cy);

    drawExit(cx, cy);

    if (gameState === 'title') {
        drawLevelTitle();
    }

    drawHUD();

    if (promptTimer > 0) {
        promptTimer -= 16;
        ctx.fillStyle = promptTimer < 500 ? `rgba(255,221,68,${promptTimer/500})` : '#ffdd44';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(promptMsg, W/2, H/2 + 50);
        ctx.fillText(promptMsg, W/2, H/2 + 50);
    }

    if (inventoryOpen) {
        drawInventory();
    }

    if (gameState === 'gameOver') {
        drawGameOver();
    }
}

function drawMenu() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffcc44';
    ctx.font = '64px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.strokeText('中世紀探險', W/2, 150);
    ctx.fillText('中世紀探險', W/2, 150);

    ctx.fillStyle = '#ccaa88';
    ctx.font = '24px monospace';
    ctx.strokeText('Medieval Quest', W/2, 220);
    ctx.fillText('Medieval Quest', W/2, 220);

    ctx.fillStyle = '#222244';
    ctx.fillRect(W/2 - 200, 300, 400, 250);

    ctx.fillStyle = '#ffcc44';
    ctx.font = '20px monospace';
    ctx.fillText('職業介紹', W/2, 330);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#cc6666';
    ctx.fillText('戰士 - 近戰物理，高血量高防禦', W/2, 365);
    ctx.fillStyle = '#66cc66';
    ctx.fillText('弓箭手 - 遠程物理，中血量高攻擊', W/2, 390);
    ctx.fillStyle = '#aa66ff';
    ctx.fillText('法師 - 遠程魔法，低血量極高攻擊', W/2, 415);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('打敗敵人、收集裝備、擊倒魔王', W/2, 460);

    const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.5;
    ctx.fillStyle = `rgba(68,255,68,${alpha})`;
    ctx.font = '28px monospace';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('[ 點擊開始遊戲 ]', W/2, 520);
    ctx.fillText('[ 點擊開始遊戲 ]', W/2, 520);

    ctx.fillStyle = '#666';
    ctx.font = '12px monospace';
    ctx.fillText('← → 移動 | ↑ 跳躍 | SPACE 攻擊 | 1/2/3 切換職業 | E 撿拾', W/2, 620);
    ctx.fillStyle = '#444';
    ctx.font = '10px monospace';
    ctx.fillText('程式手繪 8-bit 風格 | LPC 素材: wulax', W/2, 670);

    canvas.onclick = () => {
        if (gameState === 'menu') {
            resetGame();
            levelTitle = LEVEL_DATA[0].name;
            levelTitleTimer = 2000;
            gameState = 'title';
            canvas.onclick = null;
        }
    };
}

function drawBackground(lv, cx, cy) {
    ctx.fillStyle = lv.bgTop;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = lv.bgBottom;
    ctx.fillRect(0, H * 0.6, W, H * 0.4);

    if (lv.name === '草原' || lv.name === '森林') {
        for (let i = -20; i < W + 20; i += 80) {
            const wx = i - cx * 0.3;
            if (wx > -80 && wx < W + 80) {
                const mh = 100 + Math.sin((wx + cx * 0.3) * 0.01) * 60 + Math.sin((wx + cx * 0.3) * 0.03) * 30;
                ctx.fillStyle = 'rgba(40,60,30,0.4)';
                ctx.beginPath();
                ctx.moveTo(wx, H - 60);
                ctx.lineTo(wx + 40, H - 60 - mh);
                ctx.lineTo(wx + 80, H - 60);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    if (lv.name === '城堡' || lv.name === '魔王城') {
        for (let i = -20; i < W + 20; i += 180) {
            const wx = i - cx * 0.2;
            if (wx > -200 && wx < W + 200) {
                ctx.fillStyle = 'rgba(26,10,10,0.8)';
                ctx.fillRect(wx, H - 200, 120, 200);
                ctx.fillRect(wx + 20, H - 220, 80, 220);
                ctx.fillRect(wx + 40, H - 240, 40, 240);
                ctx.fillStyle = 'rgba(255,170,0,0.08)';
                ctx.fillRect(wx + 30, H - 100, 10, 15);
                ctx.fillRect(wx + 80, H - 80, 10, 15);
            }
        }
    }
}

function drawPlatform(pl, lv, cx, cy) {
    const x = pl.x + cx;
    const y = pl.y + cy;
    if (x + pl.w < -10 || x > W + 10) return;

    if (pl.y >= 640) {
        ctx.fillStyle = lv.groundColor;
        ctx.fillRect(x, y, pl.w, pl.h);
        ctx.fillStyle = '#6b4423';
        for (let gx = x + 8; gx < x + pl.w - 8; gx += 64) {
            ctx.fillRect(gx, y + 15, 16, 3);
            ctx.fillRect(gx + 32, y + 35, 16, 3);
        }
    } else {
        ctx.fillStyle = lv.platColor;
        ctx.fillRect(x, y, pl.w, pl.h);
        ctx.fillStyle = '#7b5a33';
        ctx.fillRect(x, y, pl.w, 3);
    }
}

function drawPlayer(cx, cy) {
    const p = player;
    const px = Math.round(p.x + cx);
    const py = Math.round(p.y + cy);

    if (px < -50 || px > W + 50 || py < -50 || py > H + 50) return;

    ctx.save();
    if (!p.facingRight) {
        ctx.translate(px, py);
        ctx.scale(-1, 1);
        ctx.translate(0, 0);
        if (p.currentClass === 'warrior') drawWarrior(ctx, 0, 0);
        else if (p.currentClass === 'archer') drawArcher(ctx, 0, 0);
        else drawMage(ctx, 0, 0);
    } else {
        if (p.currentClass === 'warrior') drawWarrior(ctx, px, py);
        else if (p.currentClass === 'archer') drawArcher(ctx, px, py);
        else drawMage(ctx, px, py);
    }
    ctx.restore();
}

function drawWarrior(ctx, px, py) {
    ctx.fillStyle = '#444466';
    ctx.fillRect(px - 8, py - 28, 16, 6);
    ctx.fillRect(px - 10, py - 22, 20, 10);
    ctx.fillStyle = '#555577';
    ctx.fillRect(px - 12, py - 12, 24, 20);
    ctx.fillStyle = '#cc8844';
    ctx.fillRect(px - 12, py + 8, 4, 12);
    ctx.fillRect(px + 8, py + 8, 4, 12);
    ctx.fillStyle = '#ddaa77';
    ctx.fillRect(px - 6, py - 18, 12, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(px - 4, py - 16, 3, 3);
    ctx.fillRect(px + 1, py - 16, 3, 3);
    ctx.fillStyle = '#8888bb';
    ctx.fillRect(px - 16, py - 12, 4, 8);
    ctx.fillRect(px + 12, py - 12, 4, 8);
    if (player.attacking) {
        ctx.fillStyle = '#ccc';
        ctx.fillRect(px + 12, py - 18, 20, 4);
        ctx.fillRect(px + 16, py - 22, 4, 12);
    }
}

function drawArcher(ctx, px, py) {
    ctx.fillStyle = '#88aa44';
    ctx.fillRect(px - 6, py - 28, 12, 6);
    ctx.fillRect(px - 8, py - 22, 16, 4);
    ctx.fillStyle = '#66aa33';
    ctx.fillRect(px - 8, py - 18, 16, 22);
    ctx.fillStyle = '#886644';
    ctx.fillRect(px - 10, py + 6, 4, 14);
    ctx.fillRect(px + 6, py + 6, 4, 14);
    ctx.fillStyle = '#ddaa77';
    ctx.fillRect(px - 6, py - 18, 12, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(px - 4, py - 16, 3, 3);
    ctx.fillRect(px + 1, py - 16, 3, 3);
    if (player.attacking) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(px + 8, py - 14, 16, 3);
    }
}

function drawMage(ctx, px, py) {
    ctx.fillStyle = '#553388';
    ctx.fillRect(px - 7, py - 28, 14, 8);
    ctx.fillRect(px - 9, py - 20, 18, 4);
    ctx.fillStyle = '#6644aa';
    ctx.fillRect(px - 10, py - 16, 20, 22);
    ctx.fillStyle = '#443366';
    ctx.fillRect(px - 10, py + 6, 4, 12);
    ctx.fillRect(px + 6, py + 6, 4, 12);
    ctx.fillStyle = '#ddaa77';
    ctx.fillRect(px - 6, py - 18, 12, 8);
    ctx.fillStyle = '#222';
    ctx.fillRect(px - 4, py - 16, 3, 3);
    ctx.fillRect(px + 1, py - 16, 3, 3);
    if (player.attacking) {
        ctx.fillStyle = '#aa66ff';
        ctx.fillRect(px + 8, py - 16, 16, 4);
        ctx.fillRect(px + 22, py - 20, 4, 12);
        ctx.fillStyle = '#c8f';
        ctx.beginPath(); ctx.arc(px + 26, py - 14, 4, 0, Math.PI*2); ctx.fill();
    }
}

function drawProjectiles(cx, cy) {
    for (const pr of projectiles) {
        if (!pr.alive) continue;
        const px = Math.round(pr.x + cx);
        const py = Math.round(pr.y + cy);
        if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;

        const isMage = Math.abs(pr.vy) <= 1;
        if (isMage) {
            ctx.fillStyle = '#8844ff';
            ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#bb88ff';
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(px - 6, py - 2, 12, 4);
            ctx.fillStyle = '#ccc';
            ctx.beginPath();
            ctx.moveTo(12, -2); ctx.lineTo(12, 2); ctx.lineTo(16, 0);
            ctx.closePath(); ctx.fill();
        }
    }
}

function drawBossProjectiles(cx, cy) {
    for (const bp of bossProjectiles) {
        if (!bp.alive) continue;
        const px = Math.round(bp.x + cx);
        const py = Math.round(bp.y + cy);
        if (px < -30 || px > W + 30 || py < -30 || py > H + 60) continue;
        const t = Date.now() / 100;
        const r = 8 + Math.sin(t) * 2;
        ctx.fillStyle = '#ff4400';
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ff8800';
        ctx.beginPath(); ctx.arc(px, py, r * 0.6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath(); ctx.arc(px, py, r * 0.3, 0, Math.PI*2); ctx.fill();
    }
}

function drawEnemy(e, cx, cy) {
    if (!e.alive) return;
    const px = Math.round(e.x + cx);
    const py = Math.round(e.y + cy);
    if (px < -50 || px > W + 50 || py < -50 || py > H + 50) return;

    ctx.save();
    if (!e.facingRight) {
        ctx.translate(px, py); ctx.scale(-1, 1);
    } else {
        ctx.translate(px, py);
    }

    const t = e.type;
    if (t === 'slime') {
        ctx.fillStyle = '#44cc44';
        ctx.fillRect(-8, -6, 16, 12); ctx.fillRect(-10, -2, 20, 8); ctx.fillRect(-12, 2, 24, 4);
        ctx.fillStyle = '#66ee66';
        ctx.fillRect(-6, -4, 12, 6);
        ctx.fillStyle = '#222';
        ctx.fillRect(-6, -2, 3, 3); ctx.fillRect(3, -2, 3, 3);
    } else if (t === 'goblin') {
        ctx.fillStyle = '#558833';
        ctx.fillRect(-4, -14, 10, 8);
        ctx.fillStyle = '#556644';
        ctx.fillRect(-6, -6, 14, 14);
        ctx.fillStyle = '#448822';
        ctx.fillRect(-8, -6, 4, 10); ctx.fillRect(6, -6, 4, 10);
        ctx.fillStyle = '#886644';
        ctx.fillRect(-6, 8, 4, 8); ctx.fillRect(4, 8, 4, 8);
        ctx.fillStyle = '#ccaa77';
        ctx.fillRect(-4, -6, 10, 6);
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-3, -4, 3, 3); ctx.fillRect(2, -4, 3, 3);
        ctx.fillStyle = '#888866';
        ctx.fillRect(6, -6, 6, 6);
    } else if (t === 'skeleton') {
        ctx.fillStyle = '#eee';
        ctx.fillRect(-3, -16, 8, 6); ctx.fillRect(-4, -10, 10, 6);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-6, -4, 14, 12);
        ctx.fillStyle = '#eee';
        ctx.fillRect(-6, -4, 14, 12);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(-8, -4, 2, 8); ctx.fillRect(8, -4, 2, 8);
        ctx.fillStyle = '#eee';
        ctx.fillRect(-6, 8, 4, 10); ctx.fillRect(4, 8, 4, 10);
        ctx.fillStyle = '#222';
        ctx.fillRect(-2, -8, 2, 3); ctx.fillRect(4, -8, 2, 3);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(4, -8, 8, 4);
    } else if (t === 'darkKnight') {
        ctx.fillStyle = '#222244';
        ctx.fillRect(-8, -16, 16, 8); ctx.fillRect(-10, -8, 20, 14);
        ctx.fillStyle = '#333366';
        ctx.fillRect(-12, -8, 2, 12); ctx.fillRect(10, -8, 2, 12);
        ctx.fillStyle = '#222244';
        ctx.fillRect(-10, 6, 4, 12); ctx.fillRect(6, 6, 4, 12);
        ctx.fillStyle = '#c33';
        ctx.fillRect(-6, -10, 12, 6);
        ctx.fillStyle = '#f44';
        ctx.fillRect(-5, -9, 4, 4); ctx.fillRect(1, -9, 4, 4);
    } else if (t === 'boss') {
        ctx.fillStyle = '#881111';
        ctx.fillRect(-16, -28, 32, 12); ctx.fillRect(-20, -16, 40, 20);
        ctx.fillStyle = '#a22';
        ctx.fillRect(-22, -16, 4, 16); ctx.fillRect(18, -16, 4, 16);
        ctx.fillStyle = '#611';
        ctx.fillRect(-18, 4, 8, 24); ctx.fillRect(10, 4, 8, 24);
        ctx.fillStyle = '#fc0';
        ctx.fillRect(-12, -20, 8, 6); ctx.fillRect(4, -20, 8, 6);
        ctx.fillStyle = '#222';
        ctx.fillRect(-14, -14, 6, 4); ctx.fillRect(8, -14, 6, 4);
        ctx.fillStyle = '#f44';
        ctx.fillRect(-14, -14, 3, 3); ctx.fillRect(11, -14, 3, 3);
        ctx.fillStyle = '#a33';
        ctx.fillRect(-24, -8, 6, 8); ctx.fillRect(18, -8, 6, 8);
        ctx.fillStyle = '#fc0';
        ctx.fillRect(-2, -26, 4, 4);
    }

    ctx.restore();

    const hpW = e.w + 8;
    const hpPct = Math.max(0, e.hp / e.maxHP);
    ctx.fillStyle = '#333';
    ctx.fillRect(e.x + cx - hpW/2, e.y + cy - e.h/2 - 10, hpW, 5);
    ctx.fillStyle = '#f33';
    ctx.fillRect(e.x + cx - hpW/2 + 1, e.y + cy - e.h/2 - 9, (hpW - 2) * hpPct, 3);
}

function drawItem(it, cx, cy) {
    if (it.collected) return;
    const px = Math.round(it.x + cx);
    const py = Math.round(it.y + cy);
    if (px < -20 || px > W + 20 || py < -20 || py > H + 20) return;

    const d = it.data;
    if (d.type === 'weapon') {
        ctx.fillStyle = '#cc9';
        ctx.fillRect(px - 6, py - 6, 4, 12);
        ctx.fillRect(px - 2, py - 4, 8, 4);
        ctx.fillStyle = '#88c';
        ctx.fillRect(px - 2, py, 8, 4);
    } else if (d.type === 'armor') {
        ctx.fillStyle = '#669';
        ctx.fillRect(px - 6, py - 6, 12, 14);
        ctx.fillStyle = '#88b';
        ctx.fillRect(px - 4, py - 4, 8, 10);
    } else {
        ctx.fillStyle = '#fc4';
        ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#fa0';
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#f80';
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2); ctx.fill();
    }

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(d.name, px, py - 20);
    ctx.fillText(d.name, px, py - 20);
}

function drawExit(cx, cy) {
    const ex = exitPos;
    const px = Math.round(ex.x + cx);
    const py = Math.round(ex.y + cy);
    if (px < -50 || px > W + 50 || py < -100 || py > H + 100) return;

    const alpha = 0.3 + Math.sin(Date.now() / 300) * 0.2;
    ctx.fillStyle = `rgba(153,68,255,${alpha})`;
    ctx.fillRect(px - 25, py - 30, 50, 110);
    ctx.fillStyle = `rgba(204,136,255,${0.5 + Math.sin(Date.now() / 200) * 0.2})`;
    ctx.fillRect(px - 20, py - 25, 40, 100);
}

function drawLevelTitle() {
    ctx.fillStyle = '#fff';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    const alpha = Math.min(1, levelTitleTimer / 500);
    ctx.globalAlpha = alpha;
    ctx.strokeText(levelTitle, W/2, H/2 - 60);
    ctx.fillText(levelTitle, W/2, H/2 - 60);
    ctx.globalAlpha = 1;
}

function drawHUD() {
    const p = player;
    const cd = CLASS_DATA[p.currentClass];

    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#fff';
    ctx.strokeText('職業: ' + cd.name, 10, 26);
    ctx.fillText('職業: ' + cd.name, 10, 26);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#ccc';
    ctx.strokeText('HP: ' + p.hp + '/' + p.maxHP, 10, 46);
    ctx.fillText('HP: ' + p.hp + '/' + p.maxHP, 10, 46);
    ctx.strokeText('EXP: ' + p.exp + '/' + (p.level * 50), 10, 63);
    ctx.fillText('EXP: ' + p.exp + '/' + (p.level * 50), 10, 63);
    ctx.strokeText('等級: ' + p.level, 10, 80);
    ctx.fillText('等級: ' + p.level, 10, 80);

    const atk = getTotalAtk(p);
    const def = getTotalDef(p);
    ctx.textAlign = 'center';
    ctx.strokeText('攻擊力: ' + atk + '  防禦力: ' + def, W/2, 26);
    ctx.fillText('攻擊力: ' + atk + '  防禦力: ' + def, W/2, 26);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.strokeText('裝備', W - 10, 26);
    ctx.fillText('裝備', W - 10, 26);
    ctx.font = '12px monospace';
    ctx.fillStyle = '#ccc';
    ctx.strokeText('武器: ' + (p.equipment.weapon ? p.equipment.weapon.name : '無'), W - 10, 46);
    ctx.fillText('武器: ' + (p.equipment.weapon ? p.equipment.weapon.name : '無'), W - 10, 46);
    ctx.strokeText('防具: ' + (p.equipment.armor ? p.equipment.armor.name : '無'), W - 10, 63);
    ctx.fillText('防具: ' + (p.equipment.armor ? p.equipment.armor.name : '無'), W - 10, 63);
    ctx.strokeText('飾品: ' + (p.equipment.accessory ? p.equipment.accessory.name : '無'), W - 10, 80);
    ctx.fillText('飾品: ' + (p.equipment.accessory ? p.equipment.accessory.name : '無'), W - 10, 80);

    const hpPct = Math.max(0, p.hp / p.maxHP);
    ctx.fillStyle = '#333';
    ctx.fillRect(10, H - 50, 200, 12);
    ctx.fillStyle = hpPct > 0.5 ? `rgb(${Math.round(102 + (255-102)*(1-hpPct)*2)},255,${Math.round(102*(1-hpPct))})` : `rgb(255,${Math.round(255 * hpPct * 2)},0)`;
    ctx.fillRect(11, H - 49, 198 * hpPct, 10);

    const expPct = Math.min(1, p.exp / (p.level * 50));
    ctx.fillStyle = '#333';
    ctx.fillRect(10, H - 36, 200, 8);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(11, H - 35, 198 * expPct, 6);

    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#666';
    ctx.strokeText('1:戰士  2:弓箭手  3:法師  SPACE:攻擊  E:撿拾', W/2, H - 22);
    ctx.fillText('1:戰士  2:弓箭手  3:法師  SPACE:攻擊  E:撿拾', W/2, H - 22);
    ctx.strokeText('Tab:裝備箱  H:回復HP  (緩慢自動回血)', W/2, H - 5);
    ctx.fillText('Tab:裝備箱  H:回復HP  (緩慢自動回血)', W/2, H - 5);
}

function drawInventory() {
    const p = player;
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(W/2 - 250, H/2 - 200, 500, 400);

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.strokeRect(W/2 - 250, H/2 - 200, 500, 400);

    ctx.fillStyle = '#ffcc44';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('裝備箱', W/2, H/2 - 170);
    ctx.fillText('裝備箱', W/2, H/2 - 170);

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.strokeText('按數字鍵 0-9 裝備物品 | Tab 關閉', W/2, H/2 - 145);
    ctx.fillText('按數字鍵 0-9 裝備物品 | Tab 關閉', W/2, H/2 - 145);

    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    if (inventoryItems.length === 0) {
        ctx.fillStyle = '#666';
        ctx.strokeText('裝備箱是空的', W/2 - 180, H/2 - 100);
        ctx.fillText('裝備箱是空的', W/2 - 180, H/2 - 100);
    } else {
        for (let i = 0; i < inventoryItems.length && i < 18; i++) {
            const item = inventoryItems[i];
            const row = Math.floor(i / 2);
            const col = i % 2;
            const ix = W/2 - 220 + col * 220;
            const iy = H/2 - 110 + row * 28;

            const isEquipped = (item.type === 'weapon' && p.equipment.weapon && p.equipment.weapon.id === item.id) ||
                (item.type === 'armor' && p.equipment.armor && p.equipment.armor.id === item.id) ||
                (item.type === 'accessory' && p.equipment.accessory && p.equipment.accessory.id === item.id);

            const numLabel = i === 9 ? '0' : String(i + 1);

            if (isEquipped) {
                ctx.fillStyle = 'rgba(68,255,68,0.15)';
                ctx.fillRect(ix - 5, iy - 10, 210, 22);
            }

            let color;
            if (item.type === 'weapon') color = '#cc9';
            else if (item.type === 'armor') color = '#88bbff';
            else color = '#ffcc44';

            const bonusText = [];
            if (item.bonus.atk) bonusText.push('攻擊+' + item.bonus.atk);
            if (item.bonus.def) bonusText.push('防禦+' + item.bonus.def);
            if (item.bonus.hp) bonusText.push('HP+' + item.bonus.hp);
            if (item.bonus.speed) bonusText.push('速度+' + item.bonus.speed);

            ctx.fillStyle = '#888';
            ctx.strokeText(numLabel + '.', ix, iy);
            ctx.fillText(numLabel + '.', ix, iy);

            ctx.fillStyle = color;
            const label = item.name + (bonusText.length > 0 ? ' (' + bonusText.join(', ') + ')' : '');
            ctx.strokeText(label, ix + 20, iy);
            ctx.fillText(label, ix + 20, iy);

            if (isEquipped) {
                ctx.fillStyle = '#4f4';
                ctx.font = '10px monospace';
                ctx.strokeText('[已裝備]', ix + 190, iy);
                ctx.fillText('[已裝備]', ix + 190, iy);
                ctx.font = '12px monospace';
            }

            let typeLabel;
            if (item.type === 'weapon') typeLabel = '武';
            else if (item.type === 'armor') typeLabel = '防';
            else typeLabel = '飾';
            ctx.fillStyle = isEquipped ? '#4f4' : '#666';
            ctx.strokeText('[' + typeLabel + ']', ix + 155, iy);
            ctx.fillText('[' + typeLabel + ']', ix + 155, iy);
        }
    }

    ctx.fillStyle = '#888';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.strokeText('目前裝備: ' + (p.equipment.weapon ? p.equipment.weapon.name : '無'), W/2, H/2 + 160);
    ctx.fillText('目前裝備: ' + (p.equipment.weapon ? p.equipment.weapon.name : '無'), W/2, H/2 + 160);
    ctx.strokeText('攻擊: ' + getTotalAtk(p) + '  防禦: ' + getTotalDef(p), W/2, H/2 + 180);
    ctx.fillText('攻擊: ' + getTotalAtk(p) + '  防禦: ' + getTotalDef(p), W/2, H/2 + 180);
}

function drawGameOver() {
    if (!playerData) return;
    const won = playerData.won;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.fillStyle = won ? '#4f4' : '#f44';
    ctx.strokeText(won ? '恭喜通關！' : '遊戲結束', W/2, 180);
    ctx.fillText(won ? '恭喜通關！' : '遊戲結束', W/2, 180);

    ctx.fillStyle = '#ccc';
    ctx.font = '20px monospace';
    const subMsg = won ? '你成功擊倒了魔王，拯救了王國！' : '英勇犧牲了...下次再挑戰吧！';
    ctx.strokeText(subMsg, W/2, 260);
    ctx.fillText(subMsg, W/2, 260);

    if (playerData) {
        ctx.fillStyle = '#aac';
        ctx.font = '16px monospace';
        const stats = [
            '最終等級: ' + playerData.level,
            '職業: ' + CLASS_DATA[playerData.currentClass].name,
            '攻擊力: ' + playerData.totalAtk,
            '防禦力: ' + playerData.totalDef
        ];
        stats.forEach((s, i) => {
            ctx.strokeText(s, W/2, 340 + i * 25);
            ctx.fillText(s, W/2, 340 + i * 25);
        });
    }

    const alpha = 0.5 + Math.sin(Date.now() / 500) * 0.5;
    ctx.fillStyle = `rgba(68,255,68,${alpha})`;
    ctx.font = '28px monospace';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('[ 點擊重新開始 ]', W/2, 520);
    ctx.fillText('[ 點擊重新開始 ]', W/2, 520);

    ctx.fillStyle = '#444';
    ctx.font = '10px monospace';
    ctx.strokeText('素材提供: wulax (LPC - Liberated Pixel Cup)', W/2, 600);
    ctx.fillText('素材提供: wulax (LPC - Liberated Pixel Cup)', W/2, 600);

    canvas.onclick = () => {
        if (gameState === 'gameOver') {
            resetGame();
            levelTitle = LEVEL_DATA[0].name;
            levelTitleTimer = 2000;
            gameState = 'title';
            canvas.onclick = null;
        }
    };
}

function gameLoop(time) {
    const dt = lastTime ? time - lastTime : 16;
    lastTime = time;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
