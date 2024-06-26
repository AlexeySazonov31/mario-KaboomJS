// import kaboom from "./kaboom/dist/kaboom.mjs";

kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

loadSprite("coin", "./sprite/coin.png");
loadSprite("evil-shroom", "./sprite/evilShroom.png");
loadSprite("brick", "./sprite/brick.png");
loadSprite("mario", "./sprite/mario.png");
loadSprite("mushroom", "./sprite/mushroom.png");
loadSprite("surprise", "./sprite/surprise.png");
loadSprite("unboxed", "./sprite/unboxed.png");
loadSprite("pipe-top-left", "./sprite/pipe-top-left.png");
loadSprite("pipe-top-right", "./sprite/pipe-top-right.png");
loadSprite("pipe-bottom-left", "./sprite/pipe-bottom-left.png");
loadSprite("pipe-bottom-right", "./sprite/pipe-bottom-right.png");
loadSprite("block", "./sprite/block.png");

scene("game", ({ level, score }) => {
  layers(["bg", "obj", "ui"], "obj");

  const maps = [
    [
      "                                     ",
      "                                     ",
      "                                     ",
      "                                     ",
      "         }*}%}                       ",
      "                                     ",
      "                           -+        ",
      "                           ()        ",
      "=============================        ",
    ],
    [
      "=     ======================================",
      "=                                          =",
      "=                                          =",
      "=                       %                  =",
      "=                                          =",
      "=     *                                  -+=",
      "=                         =         =    ()=",
      "=                %                       ===",
      "=                              =           =",
      "=======   ===                              =",
      "      =   = ==           }%%}              =",
      "      =   =  ==                            =",
      "      =   =   ==                  ^       ^=",
      "      =====    =============================",
    ],
    [
      "=                                                                      =",
      "=             %                 *                      }%}             =",
      "=                                                                      =",
      "=                  ^                      ^                      ^     =",
      "======   ====================%%======================================  =",
      "=                                $                                     =",
      "=                                             =                        =",
      "=     ===   }%}               }               =                        =",
      "=                                             =                        =",
      "=                                             =  =             ^ ^     =",
      "======   ===============================================================",
      "=                                                                      =",
      "=                                                                      =",
      "=                         %*%%%%                                       =",
      "=                                                  ===                 =",
      "=    $                                                     -+          =",
      "=                                                      ^   ()          =",
      "=========================================================  ==  =========",
    ],
    [
      "              %     %               %                   ",
      "                                                  %     ",
      "                                                       =",
      "            =          =                =               ",
      "        %                                       ==      ",
      "    %             =         =      =                    ",
      "                                                     %  ",
      "                                        ==              ",
      "=======   ==          ===   ===                    =    ",
      "                  ==               %                    ",
      "               =                              ==        ",
      "                       =              = -+          ==  ",
      "            =                   =       ()              ",
      "        =         ==      ==       ==   ==     ===     =",
    ],
  ];

  const levelCfg = {
    width: 20,
    height: 20,
    "=": [sprite("block"), solid()],
    $: [sprite("coin"), "coin"],
    "%": [sprite("surprise"), solid(), "coin-surprise"],
    "*": [sprite("surprise"), solid(), "mushroom-surprise"],
    "}": [sprite("unboxed"), solid()],
    "(": [sprite("pipe-bottom-left"), solid(), scale(0.5)],
    ")": [sprite("pipe-bottom-right"), solid(), scale(0.5)],
    "-": [sprite("pipe-top-left"), solid(), scale(0.5), "pipe"],
    "+": [sprite("pipe-top-right"), solid(), scale(0.5), "pipe"],
    "^": [sprite("evil-shroom"), solid(), "dangerous", body()],
    "#": [sprite("mushroom"), body(), solid(), "mushroom"],
  };

  const gameLevel = addLevel(maps[level], levelCfg);

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer("ui"),
    {
      value: score,
    },
  ]);

  add([text("level " + parseInt(level + 1)), pos(55, 6)]);

  function big() {
    let timer = 0;
    let isBig = false;
    return {
      update() {
        if (isBig) {
          currentJumpForce = bigJumpForce;
          timer -= dt();
          if (timer <= 0) {
            this.smallify();
          }
        }
      },
      isBig() {
        return isBig;
      },
      smallify() {
        this.scale = vec2(1);
        currentJumpForce = jumpForce;
        timer = 0;
        isBig = false;
      },
      biggify(time) {
        this.scale = vec2(2);
        timer = time;
        isBig = true;
      },
    };
  }

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    big(),
    origin("bot"),
  ]);

  action("mushroom", (m) => {
    m.move(20, 0);
  });

  action("dangerous", (d) => {
    d.move(-20, 0);
  });

  const moveSpeed = 120;
  const jumpForce = 360;
  const bigJumpForce = 550;
  let currentJumpForce = jumpForce;
  let isJumping = true;
  const fallDeath = 500;

  player.on("headbump", (obj) => {
    if (obj.is("coin-surprise")) {
      gameLevel.spawn("$", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
    if (obj.is("mushroom-surprise")) {
      gameLevel.spawn("#", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("}", obj.gridPos.sub(0, 0));
    }
  });

  player.collides("mushroom", (m) => {
    destroy(m);
    player.biggify(6);
  });

  player.collides("coin", (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = scoreLabel.value;
  });

  player.collides("dangerous", (d) => {
    if (isJumping) {
      destroy(d);
      gameLevel.spawn("$", d.gridPos.sub(0, 0));
    } else {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= fallDeath) {
      go("lose", { score: scoreLabel.value });
    }
  });

  player.collides("pipe", () => {
    keyPress("down", () => {
      go("game", {
        level: (level + 1) % maps.length,
        score: scoreLabel.value,
      });
    });
  });

  keyDown("left", () => {
    player.move(-moveSpeed, 0);
  });
  keyDown("right", () => {
    player.move(moveSpeed, 0);
  });

  player.action(() => {
    if (player.grounded()) {
      isJumping = false;
    }
  });

  keyPress("space", () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(currentJumpForce);
    }
  });
});

scene("lose", ({ score }) => {
  add([text(score, 32), origin("center"), pos(width() / 2, height() / 2)]);
});

start("game", { level: 0, score: 0 });
