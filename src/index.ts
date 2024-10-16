//@ts-nocheck
import {splashScreen} from './splash-screen'
import "@/style.scss";
import sfx from './sound.mp3'

splashScreen.init()
splashScreen.onInit(() => {
    main()
})

function main() {
    // Получаем элемент canvas и устанавливаем размеры на весь экран
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 0.8 * window.innerWidth;
    canvas.height = 0.8 * window.innerHeight;

// Переменные игры
    let ballRadius = 20;
    let x, y, dx, dy, speedMultiplier;
    let gameRunning = true;
    let score = 0;
    let gamesWon = 0; // Количество побед подряд
    let cheatActivated = false;

// Параметры платформы
    const paddleHeight = 10;
    let paddleWidth = canvas.width / 6;
    let paddleX = (canvas.width - paddleWidth) / 2;

// Управление клавишами
    let rightPressed = false;
    let leftPressed = false;

// Ввод чит-кода
    let cheatCode = '';
    const cheatCodeSequence = 'iddqd';

// Параметры кирпичей
    const brickRowCount = Math.floor(canvas.height / 100);
    const brickColumnCount = Math.floor(canvas.width / 100);
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 20;
    const brickOffsetTop = 30;
    const brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

    let bricks = [];


    const audio = new Audio(sfx);

// Функция для воспроизведения звука
    function playSound() {
        audio.play();
    }

// Функция для сброса игры
    function resetGame() {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2;
        dy = -2;
        speedMultiplier = 1;
        paddleWidth = canvas.width / 8; // Сброс ширины платформы
        paddleX = (canvas.width - paddleWidth) / 2;
        gameRunning = true;
        score = 0; // Сброс счета
        cheatActivated = false; // Сброс чит-кода
        document.getElementById('message').innerText = ''; // Очистка сообщений
        document.getElementById('message').style.display = 'none'; // Скрываем сообщение

        // Пересоздаем кирпичи
        bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = {x: 0, y: 0, status: 1};
            }
        }
    }

    resetGame(); // Инициализация первой игры

// Обработчики событий клавиш
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    function keyDownHandler(e) {
        if (e.code === "KeyD" || e.code === "ArrowRight") {
            rightPressed = true;
        } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
            leftPressed = true;
        } else if (e.code === "KeyR") {
            if (!gameRunning) {
                resetGame();
                draw();
            }
        }

        // Ввод чит-кода
        cheatCode += e.key.toLowerCase();
        if (cheatCode.endsWith(cheatCodeSequence)) {
            activateCheat();
            cheatCode = '';
        }
    }

    function keyUpHandler(e) {
        if (e.code === "KeyD" || e.code === "ArrowRight") {
            rightPressed = false;
        } else if (e.code === "KeyA" || e.code === "ArrowLeft") {
            leftPressed = false;
        }
    }

// Активация чит-кода
    function activateCheat() {
        if (!cheatActivated) {
            paddleWidth *= 10;
            paddleX = (canvas.width - paddleWidth) / 2; // Центрируем платформу
            cheatActivated = true;
            document.getElementById('message').innerText = 'Чит активирован: Размер платформы увеличен!';
            document.getElementById('message').style.display = 'block'; // Показываем сообщение
        }
    }

// Проверка столкновения с кирпичами
    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    // Определяем координаты кирпича
                    const brickX = b.x;
                    const brickY = b.y;

                    // Проверяем коллизию между мячом и кирпичом
                    const closestX = Math.max(brickX, Math.min(x, brickX + brickWidth));
                    const closestY = Math.max(brickY, Math.min(y, brickY + brickHeight));

                    const distanceX = x - closestX;
                    const distanceY = y - closestY;

                    // Проверяем, пересекается ли мяч с кирпичом
                    if (distanceX * distanceX + distanceY * distanceY < ballRadius * ballRadius) {
                        dy = -dy; // Отскок мяча
                        b.status = 0; // Уничтожаем кирпич
                        score++;
                        playSound();

                        // Увеличиваем скорость каждые 10 кирпичей
                        if (score % 10 === 0) {
                            speedMultiplier *= 1.05;
                            dx *= 1.05;
                            dy *= 1.05;
                        }

                        if (score === brickRowCount * brickColumnCount) {
                            gamesWon++; // Увеличиваем счетчик побед
                            gameRunning = false;
                            document.getElementById('message').innerText = 'Победа! Нажми "R" чтобы начать новую игру.';
                            document.getElementById('message').style.display = 'block'; // Показываем сообщение
                            return;
                        }
                    }
                }
            }
        }
    }

// Рисуем счет и количество побед подряд
    function drawScore() {
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerText = `Счет: ${score} | Побед подряд: ${gamesWon}`;
    }

// Рисуем мяч
    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#333333";
        ctx.fill();
        ctx.closePath();
    }

// Рисуем платформу
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = "#333333";
        ctx.fill();
        ctx.closePath();
    }

// Рисуем кирпичи
    function drawBricks() {
        const colors = ["#0969A3", "#BF3030", "#269926", "#FF8C00"];
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = colors[c % colors.length]; // Изменено на c для окраски по столбцам
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

// Основная функция отрисовки
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }

        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                const relativeX = x - (paddleX + paddleWidth / 2);
                const maxBounceAngle = Math.PI / 3;
                const normalizedRelativeX = relativeX / (paddleWidth / 2);
                const bounceAngle = normalizedRelativeX * maxBounceAngle;

                // Сохраняем скорость после отскока
                const speed = Math.sqrt(dx * dx + dy * dy);

                dx = speed * Math.sin(bounceAngle);
                dy = -Math.abs(speed * Math.cos(bounceAngle));
                playSound();
            } else {
                // Игра окончена
                gameRunning = false;
                gamesWon = 0; // Сбрасываем счетчик побед
                document.getElementById('message').innerText = 'Игра окончена! Нажми "R" чтобы начать заново.';
                document.getElementById('message').style.display = 'block'; // Показываем сообщение
                return;
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;

        if (gameRunning) {
            requestAnimationFrame(draw);
        }
    }

    draw();
}