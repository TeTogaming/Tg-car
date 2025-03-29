const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload, create, update }
};

let car, cursors, forwardSound, backwardSound;
let trafficLights = [];
let money = 500, scoreText;
let passenger, destination, timerText, timeLeft = 30;
let gameRunning = true;

const game = new Phaser.Game(config);

function preload() {
    this.load.image('road', 'assets/road.png'); // صورة الطرق
    this.load.image('car', 'assets/car.png'); // صورة السيارة
    this.load.image('lightGreen', 'assets/light_green.png'); // إشارة خضراء
    this.load.image('lightRed', 'assets/light_red.png'); // إشارة حمراء
    this.load.image('passenger', 'assets/passenger.png'); // الركاب
    this.load.image('destination', 'assets/destination.png'); // نقطة الوصول

    // تحميل المؤثرات الصوتية
    this.load.audio('forwardSound', 'assets/move_forward.mp3');
    this.load.audio('backwardSound', 'assets/move_backward.mp3');
}

function create() {
    this.add.tileSprite(500, 300, 2000, 1200, 'road'); // خريطة كبيرة

    car = this.physics.add.sprite(500, 500, 'car').setScale(0.5);
    car.setCollideWorldBounds(true);

    // إنشاء إشارات المرور بشكل عشوائي
    for (let i = 0; i < 5; i++) {
        let light = this.add.image(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 500), 'lightGreen');
        light.status = 'green';
        trafficLights.push(light);
    }

    // الركاب ونقاط الوجهة
    passenger = this.physics.add.sprite(200, 200, 'passenger').setScale(0.5);
    destination = this.physics.add.sprite(800, 400, 'destination').setScale(0.5);

    // إضافة النصوص
    scoreText = this.add.text(20, 20, 'المال: 500 جنيه', { fontSize: '20px', fill: '#fff' });
    timerText = this.add.text(20, 50, 'الوقت: 30 ثانية', { fontSize: '20px', fill: '#fff' });

    cursors = this.input.keyboard.createCursorKeys();

    // تحميل الأصوات
    forwardSound = this.sound.add('forwardSound');
    backwardSound = this.sound.add('backwardSound');

    // تشغيل عداد الوقت
    this.time.addEvent({ delay: 1000, callback: updateTimer, callbackScope: this, loop: true });

    // تغيير إشارات المرور كل 5 ثوانٍ
    this.time.addEvent({ delay: 5000, callback: toggleTrafficLights, callbackScope: this, loop: true });
}

function update() {
    if (!gameRunning) return;

    car.setVelocity(0);

    if (cursors.up.isDown) {
        car.setVelocityY(-200);
        if (!forwardSound.isPlaying) forwardSound.play();
    } else {
        forwardSound.stop();
    }

    if (cursors.down.isDown) {
        car.setVelocityY(200);
        if (!backwardSound.isPlaying) backwardSound.play();
    } else {
        backwardSound.stop();
    }

    if (cursors.left.isDown) {
        car.setVelocityX(-200);
    }

    if (cursors.right.isDown) {
        car.setVelocityX(200);
    }

    // التحقق من التقاط الراكب
    if (Phaser.Geom.Intersects.RectangleToRectangle(car.getBounds(), passenger.getBounds())) {
        passenger.setPosition(-100, -100); // إخفاء الراكب بعد التقاطه
    }

    // التحقق من الوصول إلى الوجهة
    if (Phaser.Geom.Intersects.RectangleToRectangle(car.getBounds(), destination.getBounds())) {
        money += 100;
        scoreText.setText('المال: ' + money + ' جنيه');
        passenger.setPosition(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 500));
        destination.setPosition(Phaser.Math.Between(100, 900), Phaser.Math.Between(100, 500));
        timeLeft = 30; // إعادة ضبط الوقت
    }

    // التحقق من عبور الإشارة الحمراء
    trafficLights.forEach(light => {
        if (light.status === 'red' && Phaser.Geom.Intersects.RectangleToRectangle(car.getBounds(), light.getBounds())) {
            money -= 50;
            scoreText.setText('المال: ' + money + ' جنيه');
        }
    });
}

function updateTimer() {
    if (!gameRunning) return;

    timeLeft--;
    timerText.setText('الوقت: ' + timeLeft + ' ثانية');

    if (timeLeft <= 0) {
        gameRunning = false;
        this.add.text(400, 300, 'انتهى الوقت! أعد المحاولة', { fontSize: '30px', fill: '#ff0000' });
    }
}

function toggleTrafficLights() {
    trafficLights.forEach(light => {
        light.status = (light.status === 'green') ? 'red' : 'green';
        light.setTexture(light.status === 'green' ? 'lightGreen' : 'lightRed');
    });
}