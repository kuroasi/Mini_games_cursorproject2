class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        // 修改速度相关的属性
        this.initialSpeed = 300;    // 初始速度（毫秒/帧，数值大表示移动慢）
        this.targetSpeed = 150;     // 目标速度（毫秒/帧，数值小表示移动快）
        this.currentSpeed = this.initialSpeed;  // 当前速度
        this.speedIncreaseRate = 3; // 每次加速减少的毫秒数
        this.reset();

        // 绑定事件处理器
        this.bindEvents();
    }

    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.handleDirectionChange('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.handleDirectionChange('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.handleDirectionChange('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.handleDirectionChange('right');
                    break;
            }
        });

        // 虚拟按键控制
        const buttons = {
            'upBtn': 'up',
            'downBtn': 'down',
            'leftBtn': 'left',
            'rightBtn': 'right'
        };

        Object.entries(buttons).forEach(([btnId, direction]) => {
            const button = document.getElementById(btnId);
            if (button) {
                // 处理触摸事件
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleDirectionChange(direction);
                });

                // 处理鼠标点击事件（用于测试）
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.handleDirectionChange(direction);
                });
            }
        });

        // 阻止移动端双击缩放
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    handleDirectionChange(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        // 防止反向移动
        if (this.direction !== opposites[newDirection]) {
            this.nextDirection = newDirection;
        }
    }

    reset() {
        // 初始化蛇的位置和方向
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        // 重置速度
        this.currentSpeed = this.initialSpeed;
        this.updateScore();
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        return food;
    }

    update() {
        if (this.gameOver) return;

        // 更新方向
        this.direction = this.nextDirection;

        // 计算新的头部位置
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }

        // 移动蛇
        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇身
        this.ctx.fillStyle = '#4CAF50';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 绘制蛇头
                this.drawSnakeHead(segment);
            } else if (index === this.snake.length - 1) {
                // 绘制蛇尾
                this.drawSnakeTail(segment, this.snake[index - 1]);
            } else {
                // 绘制蛇身
                this.drawSnakeBody(segment);
            }
        });

        // 绘制食物
        this.drawFood();

        // 游戏结束显示
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawSnakeHead(head) {
        // 绘制基本形状
        this.ctx.fillStyle = '#45a049';
        this.ctx.fillRect(
            head.x * this.gridSize,
            head.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );

        // 添加眼睛
        this.ctx.fillStyle = 'white';
        const eyeSize = this.gridSize / 5;
        const eyeOffset = this.gridSize / 3;

        // 根据方向调整眼睛位置
        switch(this.direction) {
            case 'right':
                this.drawEyes(head, eyeOffset, eyeSize, 0.7, 0.3, 0.7, 0.7);
                this.drawTongue(head, 1, 0.5);
                break;
            case 'left':
                this.drawEyes(head, eyeOffset, eyeSize, 0.3, 0.3, 0.3, 0.7);
                this.drawTongue(head, 0, 0.5);
                break;
            case 'up':
                this.drawEyes(head, eyeOffset, eyeSize, 0.3, 0.3, 0.7, 0.3);
                this.drawTongue(head, 0.5, 0);
                break;
            case 'down':
                this.drawEyes(head, eyeOffset, eyeSize, 0.3, 0.7, 0.7, 0.7);
                this.drawTongue(head, 0.5, 1);
                break;
        }
    }

    drawEyes(head, eyeOffset, eyeSize, x1, y1, x2, y2) {
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(
            head.x * this.gridSize + this.gridSize * x1,
            head.y * this.gridSize + this.gridSize * y1,
            eyeSize,
            0,
            Math.PI * 2
        );
        this.ctx.arc(
            head.x * this.gridSize + this.gridSize * x2,
            head.y * this.gridSize + this.gridSize * y2,
            eyeSize,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // 添加瞳孔
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(
            head.x * this.gridSize + this.gridSize * x1,
            head.y * this.gridSize + this.gridSize * y1,
            eyeSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.arc(
            head.x * this.gridSize + this.gridSize * x2,
            head.y * this.gridSize + this.gridSize * y2,
            eyeSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawTongue(head, xOffset, yOffset) {
        this.ctx.fillStyle = '#ff3366';
        this.ctx.beginPath();
        
        const tongueWidth = this.gridSize / 6;
        const tongueLength = this.gridSize / 2;
        const startX = head.x * this.gridSize + this.gridSize * xOffset;
        const startY = head.y * this.gridSize + this.gridSize * yOffset;
        
        if (this.direction === 'right') {
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX + tongueLength, startY - tongueWidth);
            this.ctx.lineTo(startX + tongueLength, startY + tongueWidth);
        } else if (this.direction === 'left') {
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX - tongueLength, startY - tongueWidth);
            this.ctx.lineTo(startX - tongueLength, startY + tongueWidth);
        } else if (this.direction === 'up') {
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX - tongueWidth, startY - tongueLength);
            this.ctx.lineTo(startX + tongueWidth, startY - tongueLength);
        } else {
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(startX - tongueWidth, startY + tongueLength);
            this.ctx.lineTo(startX + tongueWidth, startY + tongueLength);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawSnakeBody(segment) {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(
            segment.x * this.gridSize,
            segment.y * this.gridSize,
            this.gridSize - 1,
            this.gridSize - 1
        );
    }

    drawSnakeTail(tail, beforeTail) {
        this.ctx.fillStyle = '#3d8b40';
        
        // 计算尾部朝向
        const dx = tail.x - beforeTail.x;
        const dy = tail.y - beforeTail.y;
        
        // 绘制三角形尾部
        this.ctx.beginPath();
        this.ctx.moveTo(
            tail.x * this.gridSize + this.gridSize / 2,
            tail.y * this.gridSize + this.gridSize / 2
        );
        
        if (dx > 0) { // 尾部朝左
            this.ctx.lineTo(
                tail.x * this.gridSize,
                tail.y * this.gridSize
            );
            this.ctx.lineTo(
                tail.x * this.gridSize,
                tail.y * this.gridSize + this.gridSize
            );
        } else if (dx < 0) { // 尾部朝右
            this.ctx.lineTo(
                tail.x * this.gridSize + this.gridSize,
                tail.y * this.gridSize
            );
            this.ctx.lineTo(
                tail.x * this.gridSize + this.gridSize,
                tail.y * this.gridSize + this.gridSize
            );
        } else if (dy > 0) { // 尾部朝上
            this.ctx.lineTo(
                tail.x * this.gridSize,
                tail.y * this.gridSize
            );
            this.ctx.lineTo(
                tail.x * this.gridSize + this.gridSize,
                tail.y * this.gridSize
            );
        } else { // 尾部朝下
            this.ctx.lineTo(
                tail.x * this.gridSize,
                tail.y * this.gridSize + this.gridSize
            );
            this.ctx.lineTo(
                tail.x * this.gridSize + this.gridSize,
                tail.y * this.gridSize + this.gridSize
            );
        }
        
        this.ctx.fill();
    }

    drawFood() {
        const x = this.food.x * this.gridSize + this.gridSize / 2;
        const y = this.food.y * this.gridSize + this.gridSize / 2;
        const size = this.gridSize * 0.9;

        // 绘制苹果主体
        this.ctx.fillStyle = '#FF6B6B';  // 可爱的红色
        this.ctx.beginPath();
        this.ctx.arc(x, y, size/2, 0, Math.PI * 2);
        this.ctx.fill();

        // 添加底部凹陷
        this.ctx.beginPath();
        this.ctx.arc(x, y + size/8, size/6, 0, Math.PI);
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fill();

        // 添加高光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x - size/5,
            y - size/5,
            size/6,
            size/3,
            -Math.PI/4,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // 绘制叶子
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.ellipse(
            x + size/6,
            y - size/2,
            size/3,
            size/6,
            -Math.PI/6,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // 绘制梗
        this.ctx.strokeStyle = '#795548';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size/2);
        this.ctx.lineTo(x - size/6, y - size/1.5);
        this.ctx.stroke();
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    // 添加速度更新方法
    updateSpeed() {
        if (this.currentSpeed > this.targetSpeed) {
            this.currentSpeed = Math.max(this.targetSpeed, this.currentSpeed - this.speedIncreaseRate);
        }
    }
}

// 游戏初始化
const canvas = document.getElementById('gameCanvas');
const startBtn = document.getElementById('startBtn');
const game = new Snake(canvas);
let gameLoop;

startBtn.addEventListener('click', () => {
    // 重置游戏状态
    game.reset();
    
    // 清除之前的游戏循环
    if (gameLoop) clearInterval(gameLoop);
    
    // 开始新的游戏循环
    const runGameLoop = () => {
        game.update();
        game.draw();
        game.updateSpeed();  // 更新速度
        
        if (game.gameOver) {
            clearTimeout(gameLoop);
            startBtn.textContent = '重新开始';
            return;
        }
        
        // 使用当前速度设置下一帧的延迟
        gameLoop = setTimeout(runGameLoop, game.currentSpeed);
    };
    
    // 启动游戏循环
    runGameLoop();
    
    startBtn.textContent = '重新开始';
}); 