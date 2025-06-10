var gameScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function () {
    Phaser.Scene.call(this, { key: "game" });
  },

  preload() {
    this.load.image("sky", "assets/images/background.jpg");
    this.load.audio("collectSound", "assets/sounds/collect.mp3");
    this.load.audio("bgMusic", "assets/sounds/musik.mp3");
    this.load.image("ground", "assets/images/tapakan1.png");
    this.load.image("ground2", "assets/images/tapakan2.png");
    this.load.image("star", "assets/images/star.png");
    this.load.spritesheet("dude", "assets/sprite/dog8.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.image("enemy", "assets/images/pou.png");
  },

  create() {
    this.level = 1;
    this.maxLevel = 3;

    this.showLevelIntro(this.level);

    this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    this.levelText = this.add.text(
      this.sys.game.config.width - 180,
      16,
      "Level: " + this.level,
      {
        fontSize: "32px", // Ukuran font
        fontFamily: "Poppins", // Jenis font
        fill: "#ffcc00", // Warna font
        stroke: "#000000", // Stroke/garis tepi warna
        strokeThickness: 3, // Ketebalan stroke
        shadow: {
          // Menambahkan bayangan
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      }
    );

    this.collectSound = this.sound.add("collectSound", { volume: 0.3 });
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.9 });
    this.bgMusic.play();

    this.score = 0;

    this.platforms = this.physics.add.staticGroup();
    this.createPlatforms(this.level);

    this.player = this.physics.add.sprite(100, 450, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 8 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 9, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });

    this.createStars();

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px", // Ukuran font
      fontFamily: "Poppins", // Jenis font
      fill: "#7AC6D2", // Warna font
      stroke: "#000000", // Stroke/garis tepi warna
      strokeThickness: 3, // Ketebalan stroke
      shadow: {
        // Menambahkan bayangan
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 5,
        stroke: true,
        fill: true,
      },
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  },

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.blocked.down) {
      this.player.setVelocityY(-330);
    }
  },

  collectStar(player, star) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    this.collectSound.play();

    if (this.stars.countActive(true) === 0) {
      if (this.level < this.maxLevel) {
        this.level++;
        this.levelText.setText("Level: " + this.level);
        this.showLevelIntro(this.level);
        this.createPlatforms(this.level);
        this.createStars();
        this.player.setPosition(100, 450);

        if (this.level === 3) {
          this.createEnemy();
        }
      } else {
        this.add.text(300, 300, "YOU WIN!", {
          fontSize: "48px",
          fill: "#00f",
        });
        this.bgMusic.stop();
      }
    }
  },

  createStars() {
    if (this.stars) {
      this.stars.clear(true, true);
    }

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setScale(0.1);
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );
  },

  createPlatforms(level) {
    this.platforms.clear(true, true);

    for (let i = 0; i < 10; i++) {
      this.platforms.create(40 + i * 96, 720, "ground2");
    }

    if (level === 1) {
      this.platforms.create(480, 568, "ground").setScale(0.7).refreshBody();
      this.platforms.create(240, 400, "ground");
      this.platforms.create(600, 300, "ground");
    } else if (level === 2) {
      this.platforms.create(400, 600, "ground");
      this.platforms.create(150, 450, "ground");
      this.platforms.create(700, 220, "ground");
      this.platforms.create(390, 270, "ground");
    } else if (level === 3) {
      this.platforms.create(450, 570, "ground");
      this.platforms.create(120, 390, "ground");
      this.platforms.create(750, 450, "ground");
      this.platforms.create(400, 210, "ground");
    }
  },

  createEnemy() {
    this.enemy = this.physics.add.sprite(400, 0, "enemy");
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setVelocity(100, 20);
    this.physics.add.collider(this.enemy, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.enemy,
      () => {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play("turn");
        this.bgMusic.stop();
        this.add.text(300, 300, "GAME OVER", {
          fontSize: "48px",
          fill: "#f00",
        });
      },
      null,
      this
    );
  },

  showLevelIntro(level) {
    const centerX = this.sys.game.config.width / 2;
    const centerY = this.sys.game.config.height / 2;

    // Buat overlay hitam full-screen
    const overlay = this.add
      .rectangle(
        0,
        0,
        this.sys.game.config.width,
        this.sys.game.config.height,
        0x000000
      )
      .setOrigin(0, 0)
      .setAlpha(0);

    // Teks level
    const levelIntroText = this.add.text(centerX, centerY, "Level " + level, {
      fontSize: "64px", // Ukuran font
      fontFamily: "Poppins", // Jenis font
      fill: "#7AC6D2", // Warna font
      stroke: "#000000", // Stroke/garis tepi warna
      strokeThickness: 3, // Ketebalan stroke
      shadow: {
        // Menambahkan bayangan
        offsetX: 2,
        offsetY: 2,
        color: "#000000",
        blur: 5,
        stroke: true,
        fill: true,
      },
    });
    levelIntroText.setOrigin(0.5);
    levelIntroText.setAlpha(0);

    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 500,
      onComplete: () => {
        // Setelah layar gelap, tampilkan teks level
        this.tweens.add({
          targets: levelIntroText,
          alpha: 1,
          duration: 500,
          yoyo: true,
          hold: 1000,
          onComplete: () => {
            // Fade out overlay
            this.tweens.add({
              targets: overlay,
              alpha: 0,
              duration: 500,
              onComplete: () => {
                overlay.destroy();
                levelIntroText.destroy();
              },
            });
          },
        });
      },
    });
  },
});
