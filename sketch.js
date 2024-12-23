// 存放所有子彈的陣列
let bullets = []; 

// 爆炸特效數據
let explosions = [];

// 宣告背景圖片變數
let backgroundImg;

// 宣告角色變數
let character1 = {
    idle: null,
    walk: null,
    jump: null,
    currentAction: 'idle',
    frameIndex: 0,
    frameDelay: 0,
    x: 200,          // 初始X位置
    y: 400,          // 初始Y位置
    velocityY: 0,    // Y軸速度
    isJumping: false, // 跳躍狀態
    health:100,
    visible: true,    // 角色1是否可見
    bulletImage: null // 角色1的子彈圖片
  };
  
  let character2 = {
    idle: null,
    walk: null,
    jump: null,
    currentAction: 'idle',
    frameIndex: 0,
    frameDelay: 0,
    x: 600,          // 初始X位置
    y: 400,          // 初始Y位置
    velocityY: 0,    // Y軸速度
    isJumping: false, // 跳躍狀態
    health:100,
    visible: true,    // 角色2是否可見
    bulletImage: null // 角色2的子彈圖片 
    };
  
  // 設定動畫參數
  const FRAME_DELAY = 5;  // 動畫速度（數字越大越慢）
  const SPRITE_DATA = {
    character1: {
      idle: {
        frames: 7,
        width: 84,
        height: 72,
        spriteWidth: 590
      },
      walk: {
        frames: 7,
        width: 73,
        height: 84,
        spriteWidth: 513
      },
      jump: {
        frames: 5,
        width: 95,
        height: 82,
        spriteWidth: 475
      },
      bullet: {  //發射子彈
        img: null,
        width: 35,
        height: 27,
        frames: 1
      }
    },
    character2: {
      idle: {
        frames: 12,
        width: 103,
        height: 69,
        spriteWidth: 1243
      },
      walk: {
        frames: 9,
        width: 97,
        height: 67,
        spriteWidth: 877
      },
      jump: {
        frames: 6,
        width: 102,
        height: 91,
        spriteWidth: 613
      },
      bullet: {  //發射子彈
        img: null,
        width: 27,
        height: 33,
        frames: 1
      }
    }
  };
  
  // 遊戲參數
  const MOVE_SPEED = 5;    // 移動速度
  const JUMP_FORCE = -15;  // 跳躍力道
  const GRAVITY = 0.8;     // 重力
  const GROUND_Y = 400;    // 地面位置
  
  function preload() {
    // 載入背景圖片
    backgroundImg = loadImage('assets/background.png');

    // 載入角色1的圖片
    character1.idle = loadImage('assets/character1-idle.png');
    character1.walk = loadImage('assets/character1-walk.png');
    character1.jump = loadImage('assets/character1-jump.png');
    character1.bulletImage = loadImage('assets/character1-shoot.png');
    
    // 載入角色2的圖片
    character2.idle = loadImage('assets/character2-idle.png');
    character2.walk = loadImage('assets/character2-walk.png');
    character2.jump = loadImage('assets/character2-jump.png');
    character2.bulletImage = loadImage('assets/character2-shoot.png');
  }
  
  function setup() {
    createCanvas(windowWidth,windowHeight);
    imageMode(CENTER);
  }

  function draw() {
    // 繪製背景
    imageMode(CORNER);  // 暫時改變圖片模式為CORNER以繪製背景
    image(backgroundImg, 0, 0, width, height);
    imageMode(CENTER);  // 改回CENTER模式以繪製角色   
        
    // 處理角色移動
    handleMovement();
    
    // 更新角色動畫
    updateCharacterAnimation(character1, 'character1');
    updateCharacterAnimation(character2, 'character2');
    
    // 碰撞檢查
    checkCollision();

    // 處理子彈移動和碰撞
    updateBullets();
    
    // 繪製角色與生命值
    if (character1.visible) {
      drawCharacter(character1, 'character1');
      drawHealthBar(character1);
    }

    if (character2.visible) {
      drawCharacter(character2, 'character2');
      drawHealthBar(character2);
    }

     // 繪製子彈
    drawBullets();

    // 繪製爆炸特效
    drawExplosions();
    
    // 顯示操作說明
    displayInstructions();

  }
  
  function handleMovement() {
    // 角色1移動控制
    if (keyIsDown(65)) { // A鍵
      character1.x -= MOVE_SPEED;
      if (!character1.isJumping) character1.currentAction = 'walk';
    } else if (keyIsDown(68)) { // D鍵
      character1.x += MOVE_SPEED;
      if (!character1.isJumping) character1.currentAction = 'walk';
    } else if (!character1.isJumping) {
      character1.currentAction = 'idle';
    }
    
    // 角色2移動控制
    if (keyIsDown(LEFT_ARROW)) {
      character2.x -= MOVE_SPEED;
      if (!character2.isJumping) character2.currentAction = 'walk';
    } else if (keyIsDown(RIGHT_ARROW)) {
      character2.x += MOVE_SPEED;
      if (!character2.isJumping) character2.currentAction = 'walk';
    } else if (!character2.isJumping) {
      character2.currentAction = 'idle';
    }

    // 處理跳躍物理
    updateJumpPhysics(character1);
    updateJumpPhysics(character2);
    
    // 限制角色在畫面內
    character1.x = constrain(character1.x, 50, width - 50);
    character2.x = constrain(character2.x, 50, width - 50);
  }
  
  function updateJumpPhysics(character) {
    if (character.isJumping) {
      character.velocityY += GRAVITY;
      character.y += character.velocityY;
      
      if (character.y >= GROUND_Y) {
        character.y = GROUND_Y;
        character.velocityY = 0;
        character.isJumping = false;
        character.currentAction = 'idle';
      }
    }
  }
  
  function keyPressed() {
    // 角色1跳躍
    if ((key === 'w' || key === 'W') && !character1.isJumping) {
      character1.velocityY = JUMP_FORCE;
      character1.isJumping = true;
      character1.currentAction = 'jump';
    }
    
    // 角色2跳躍
    if (keyCode === UP_ARROW && !character2.isJumping) {
      character2.velocityY = JUMP_FORCE;
      character2.isJumping = true;
      character2.currentAction = 'jump';
    }
      // 角色1射擊
    if ((key === 'n' || key === 'N') && character1.visible) {
      shootBullet(character1, 1);
    }

    // 角色2射擊
    if (keyCode === 32 && character2.visible) {  // 空白鍵射擊
      shootBullet(character2, -1);
    }
  }
  
  function shootBullet(character, direction) {
    // 計算敵人位置
  let target = character === character1 ? character2 : character1;
  
  // 計算子彈的方向（角度）
  let angle = atan2(target.y - character.y, target.x - character.x);
  
  // 計算子彈的速度向量
  let bulletSpeedX = cos(angle) * 10; // 子彈X方向速度
  let bulletSpeedY = sin(angle) * 10; // 子彈Y方向速度
  
  // 創建子彈物件
  const bullet = {
    x: character.x,
    y: character.y - 20, // 子彈起始位置稍微高於角色
    speedX: bulletSpeedX, // X軸速度
    speedY: bulletSpeedY, // Y軸速度
    owner: character === character1 ? 'character1' : 'character2', // 用來區分子彈屬於誰
    radius: 5, // 子彈大小
    image: character.bulletImage, // 子彈圖像
    width: 20, // 子彈寬度
    height: 10 // 子彈高度
  };
  
  bullets.push(bullet);
  }
  
  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      // 更新子彈的位置
    bullets[i].x += bullets[i].speedX;
    bullets[i].y += bullets[i].speedY;

  
      // 檢查子彈是否超出邊界
      if (bullets[i].x < 0 || bullets[i].x > width) {
        bullets.splice(i, 1);
        continue;
      }// 檢查子彈是否超出邊界
    if (bullets[i].x < 0 || bullets[i].x > width || bullets[i].y < 0 || bullets[i].y > height) {
      bullets.splice(i, 1);  // 移除超出邊界的子彈
      continue;
    }

    // 檢查子彈與角色的碰撞
    checkCollisionWithBullet(bullets[i], i);
    }
  }

  function checkCollisionWithBullet(bullet, index) {
    if (bullet.owner === 'character1' && character2.visible) {
      if (dist(bullet.x, bullet.y, character2.x, character2.y) < bullet.radius + 20) {
        character2.health -= 10;
        bullets.splice(index, 1);
        if (character2.health <= 0) {
          character2.visible = false; // 角色2消失
          createExplosion(character2.x, character2.y);
        }
      }
    } else if (bullet.owner === 'character2' && character1.visible) {
      if (dist(bullet.x, bullet.y, character1.x, character1.y) < bullet.radius + 20) {
        character1.health -= 10;
        bullets.splice(index, 1);
        if (character1.health <= 0) {
          character1.visible = false; // 角色1消失
          createExplosion(character1.x, character1.y);
        }
      }
    }
  }

  function updateCharacterAnimation(character, charType) {
    if (character.frameDelay > 0) {
      character.frameDelay--;
    } else {
      character.frameDelay = FRAME_DELAY;
      const actionData = SPRITE_DATA[charType][character.currentAction];
      character.frameIndex = (character.frameIndex + 1) % actionData.frames;
    }
  }
  
  function drawCharacter(character, charType) {
    const actionData = SPRITE_DATA[charType][character.currentAction];
    const sprite = character[character.currentAction];
    
    // 計算當前幀位置
    const sx = character.frameIndex * actionData.width;
    
    // 繪製角色
    image(sprite, 
          character.x, character.y,
          actionData.width, actionData.height,
          sx, 0,
          actionData.width, actionData.height);
  }

    // 繪製生命值
  function drawHealthBar(character) {
    const barWidth = 100;  // 血條的寬度
    const barHeight = 10;  // 血條的高度
    const barX = character.x - barWidth / 2; // 血條位置（相對於角色）
    const barY = character.y - 60;          // 血條距角色的高度
    
    // 繪製血條背景
    fill(255, 0, 0); // 紅色表示損失的生命值
    rect(barX, barY, barWidth, barHeight);
    
    // 繪製當前生命值
    fill(0, 255, 0); // 綠色表示剩餘生命值
    rect(barX, barY, (character.health / 100) * barWidth, barHeight);
  }

  function checkCollision() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      if (bullets[i].owner === 'character1' && character2.visible) {
        if (dist(bullets[i].x, bullets[i].y, character2.x, character2.y) < bullets[i].radius + 20) {
          character2.health -= 10;
          bullets.splice(i, 1);
          if (character2.health <= 0) {
            character2.visible = false; // 角色2消失
            createExplosion(character2.x, character2.y); // 生成爆炸效果
          }
          continue;
        }
      } else if (bullets[i].owner === 'character2' && character1.visible) {
        if (dist(bullets[i].x, bullets[i].y, character1.x, character1.y) < bullets[i].radius + 20) {
          character1.health -= 10;
          bullets.splice(i, 1);
          if (character1.health <= 0) {
            character1.visible = false; // 角色1消失
            createExplosion(character1.x, character1.y); // 生成爆炸效果
          }
          continue;
        }
      }
    }
  }

  function drawBullets() {
    for (let bullet of bullets) {
      image(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }

  function createExplosion(x, y) {
    explosions.push({
      x: x,
      y: y,
      size: 0,
      sparks: generateSparks(x, y), // 為爆炸生成火花
    });
  }

  // 生成火花的函數
  function generateSparks(x, y) {
    const sparks = [];
    const sparkCount = 20; // 火花數量
    for (let i = 0; i < sparkCount; i++) {
      const angle = random(TWO_PI); // 隨機角度
      const speed = random(2, 5);   // 隨機速度
      const lifeSpan = random(30, 60); // 火花存在的時間

      sparks.push({
        x: x,
        y: y,
        velocityX: cos(angle) * speed,
        velocityY: sin(angle) * speed,
        alpha: 255, // 火花的透明度
        life: lifeSpan, // 火花的生命週期
      });
    }
    return sparks;
  }

  function drawExplosions() {
   for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.size += 5; // 增大爆炸的大小

    // 繪製爆炸
    noFill();
    stroke(255, 150, 0, 255 - explosion.size * 5); // 為爆炸添加透明效果
    strokeWeight(3);
    ellipse(explosion.x, explosion.y, explosion.size);

    // 繪製火花
    for (let j = explosion.sparks.length - 1; j >= 0; j--) {
      const spark = explosion.sparks[j];
      spark.x += spark.velocityX;
      spark.y += spark.velocityY;
      spark.alpha -= 5; // 火花逐漸消失

      // 繪製火花
      fill(255, 165, 0, spark.alpha);
      noStroke();
      ellipse(spark.x, spark.y, 5, 5);

      // 如果火花的透明度小於0，移除火花
      if (spark.alpha <= 0) {
        explosion.sparks.splice(j, 1);
      }
    }

    // 如果爆炸的大小大於50，則從陣列中移除爆炸
    if (explosion.size > 50) {
      explosions.splice(i, 1);
    }
  }
  }

  function displayInstructions() {
    // 添加半透明黑色背景，使文字更容易閱讀
    fill(0, 0, 0, 150);
    rect(10, 10, 200, 130);
    rect(10, 150, 200, 130);
    
    // 使用白色文字
    fill(255);
    textSize(16);
    textAlign(LEFT);
    
    text('角色1控制：', 20, 30);
    text('W - 跳躍', 20, 55);
    text('A - 左移', 20, 80);
    text('D - 右移', 20, 105);
    text('N - 射擊', 20, 130);
    
    text('角色2控制：', 20, 170);
    text('↑ - 跳躍', 20, 195);
    text('← - 左移', 20, 220);
    text('→ - 右移', 20, 245);
    text('空白建 - 射擊', 20, 270);
  }
