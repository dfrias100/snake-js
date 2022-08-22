const CELL_SIZE = 20;
const SQUARE_SIZE = CELL_SIZE - 2;

function drawBackground(context, width, height) {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
}

function drawColoredSquare(context, x, y, side_length, color) {
    context.fillStyle = color;
    context.fillRect(x, y, side_length, side_length);
}

function resetBoard(context, board_array) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board_array[i][j] = ObjectTypes.EMPTY;
        }
    }
    drawBackground(context, canvas_width, canvas_height);
}

function generateFood(context, board_array, apple) {
    var x = Math.floor(Math.random() * board_array.length);
    var y = Math.floor(Math.random() * board_array[0].length);

    while (board_array[x][y] != ObjectTypes.EMPTY) {
        x = Math.floor(Math.random() * board_array.length);
        y = Math.floor(Math.random() * board_array[0].length);
    }

    apple.location.x = x;
    apple.location.y = y;
    board_array[x][y] = ObjectTypes.FOOD;
    var screen_coords = logicalCoordsToScreenCoords(x, y);
    drawColoredSquare(context, screen_coords.x + 1, screen_coords.y + 1, SQUARE_SIZE, "red");
}

function generateSnakeStart(context, board_array, snake) {
    var x = Math.floor(Math.random() * board_array.length);
    var y = Math.floor(Math.random() * board_array[0].length);

    while (board_array[x][y] != ObjectTypes.EMPTY) {
        x = Math.floor(Math.random() * board_array.length);
        y = Math.floor(Math.random() * board_array[0].length);
    }

    snake.location.x = x;
    snake.location.y = y;

    board_array[x][y] = ObjectTypes.SNAKE;
    var screen_coords = logicalCoordsToScreenCoords(x, y);
    drawColoredSquare(context, screen_coords.x + 1, screen_coords.y + 1, SQUARE_SIZE, "white");
}

function computeNewCoords(logical_coordinates, direction) {
    if (direction == Direction.UP) {
        logical_coordinates.y--;
    } else if (direction == Direction.DOWN) {
        logical_coordinates.y++;
    } else if (direction == Direction.LEFT) {
        logical_coordinates.x--;
    } else if (direction == Direction.RIGHT) {
        logical_coordinates.x++;
    }
    return logical_coordinates;
}

function moveSnake(snake, food_collision = false) {
    if (snake.length == 1) {
        board[snake.location.x][snake.location.y] = ObjectTypes.EMPTY;
        computeNewCoords(snake.location, snake.direction);
        board[snake.location.x][snake.location.y] = ObjectTypes.SNAKE;
    } else {
        var old_location = { x: snake.location.x, y: snake.location.y };

        computeNewCoords(snake.location, snake.direction);
        board[snake.location.x][snake.location.y] = ObjectTypes.SNAKE;

        if (!food_collision) {
            snake.tail.pushFront(old_location);

            let old_tail_location = snake.tail.popBack();
            board[old_tail_location.x][old_tail_location.y] = ObjectTypes.EMPTY;
        }
    }
}

function drawState(context, snake, apple) {
    drawBackground(context, canvas_width, canvas_height);

    var snake_screen_coords = logicalCoordsToScreenCoords(snake.location.x, snake.location.y);
    var apple_screen_coords = logicalCoordsToScreenCoords(apple.location.x, apple.location.y);

    drawColoredSquare(context, snake_screen_coords.x + 1, snake_screen_coords.y + 1, SQUARE_SIZE, "white");
    drawColoredSquare(context, apple_screen_coords.x + 1, apple_screen_coords.y + 1, SQUARE_SIZE, "red");

    let snake_tail_head = snake.tail.getHead();
    while (snake_tail_head != null) {
        var tail_screen_coords = logicalCoordsToScreenCoords(snake_tail_head.data.x, snake_tail_head.data.y);
        drawColoredSquare(context, tail_screen_coords.x + 1, tail_screen_coords.y + 1, SQUARE_SIZE, "white");
        snake_tail_head = snake_tail_head.next;
    }
}

function checkCollision(snake, apple, width, height) {
    var test_coordinates = { x: snake.location.x, y: snake.location.y };
    computeNewCoords(test_coordinates, snake.direction);

    if (test_coordinates.x < 0 ||
        test_coordinates.x >= width ||
        test_coordinates.y < 0 ||
        test_coordinates.y >= height) {
            return Collisions.WALL;
    } else if (test_coordinates.x == apple.location.x && test_coordinates.y == apple.location.y) {
        return Collisions.APPLE;
    } else {
        let snake_tail_head = snake.tail.getHead();
        while (snake_tail_head != null) {
            if (test_coordinates.x == snake_tail_head.data.x && test_coordinates.y == snake_tail_head.data.y) {
                return Collisions.SNAKE;
            }
            snake_tail_head = snake_tail_head.next;
        }
    }

    return Collisions.NONE;
}

function growSnake(snake) {
    var old_location = { x: snake.location.x, y: snake.location.y };
    snake.tail.pushFront(old_location);
    snake.length++;
}

function doGame(context, board_array, snake, apple, game_state) {
    switch (game_state.state) {
        case GameStates.NOT_STARTED:
            break;
        case GameStates.IN_PROGRESS:
            let collision = checkCollision(snake, apple, board_array[0].length, board_array.length);

            if (collision == Collisions.APPLE) {
                growSnake(snake);
                board_array[apple.location.x][apple.location.y] = ObjectTypes.SNAKE;
                generateFood(context, board_array, apple);
            } else if (collision == Collisions.SNAKE || collision == Collisions.WALL) {
                game_state.state = GameStates.OVER;
                break;
            }

            moveSnake(snake, collision == Collisions.APPLE);
            drawState(context, snake, apple);
            game_state.snake_moved = true;
            break;
        case GameStates.OVER:
            snake.tail = new LinkedList();
            snake.length = 1;
            snake.direction = Direction.NONE;
            resetBoard(context, board_array);
            generateSnakeStart(context, board_array, snake);
            generateFood(context, board_array, apple);
            game_state.state = GameStates.NOT_STARTED;
            break;
    }
    setTimeout(doGame, 125, context, board_array, snake, apple, game_state);
}

function checkIfOppositeDirection(direction1, direction2) {
    switch (direction1) {
        case Direction.UP:
            return direction2 == Direction.DOWN;
        case Direction.DOWN:
            return direction2 == Direction.UP;
        case Direction.LEFT:
            return direction2 == Direction.RIGHT;
        case Direction.RIGHT:
            return direction2 == Direction.LEFT;
        default:
            return false;
    }
}

function checkKey(e) {
    var code = e.keyCode;
    var last_direction = snake.direction;
    if (game_state.snake_moved == true) {
        switch (code) {
            case 37: snake.direction = Direction.LEFT; break;
            case 38: snake.direction = Direction.UP; break;
            case 39: snake.direction = Direction.RIGHT; break;
            case 40: snake.direction = Direction.DOWN; break;
        }
    }
    game_state.snake_moved = false;
    if (checkIfOppositeDirection(last_direction, snake.direction)) {
        snake.direction = last_direction;
    }
    if (game_state.state == GameStates.NOT_STARTED) {
        game_state.state = GameStates.IN_PROGRESS;
    }
}

function logicalCoordsToScreenCoords(x, y) {
    return {
        x: x * CELL_SIZE,
        y: y * CELL_SIZE
    };
}

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    pushBack(data) {
        var new_node = new Node(data);
        if (this.head == null) {
            this.head = new_node;
            this.tail = new_node;
        } else {
            this.tail.next = new_node;
            new_node.prev = this.tail;
            this.tail = new_node;
        }
        this.length++;
    }

    popBack() {
        if (this.length == 0) {
            return null;
        } else if (this.length == 1) {
            var data = this.head.data;
            this.head = null;
            this.tail = null;
            this.length = 0;
            return data;
        } else {
            var data = this.tail.data;
            this.tail = this.tail.prev;
            this.tail.next = null;
            this.length--;
            return data;
        }
    }

    pushFront(data) {
        var new_node = new Node(data);
        if (this.head == null) {
            this.head = new_node;
            this.tail = new_node;
        } else {
            this.head.prev = new_node;
            new_node.next = this.head;
            this.head = new_node;
        }
        this.length++;
    }

    popFront() {
        if (this.length == 0) {
            return null;
        } else if (this.length == 1) {
            var data = this.head.data;
            this.head = null;
            this.tail = null;
            this.length = 0;
            return data;
        } else {
            var data = this.head.data;
            this.head = this.head.next;
            this.head.prev = null;
            this.length--;
            return data;
        }
    }

    peekFront() {
        if (this.head == null) {
            return null;
        } else {
            return this.head.data;
        }
    }

    getHead() {
        return this.head;
    }
}

const ObjectTypes = {
    SNAKE: 0,
    FOOD: 1,
    EMPTY: 2
}

const Direction = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
    NONE: 4
}

const GameStates = {
    NOT_STARTED: 0,
    IN_PROGRESS: 1,
    OVER: 2
}

const Collisions = {
    WALL : 0,
    SNAKE : 1,
    FOOD : 2,
    NONE : 3
}

var snake = {
    location: {
        x: 0,
        y: 0
    },
    direction: Direction.NONE,
    length: 1,
    tail: null
}

var apple = {
    location: {
        x: 0,
        y: 0
    }
}

var game_canvas = document.getElementById("game-canvas");
var game_context = game_canvas.getContext("2d");
var canvas_width = game_canvas.width;
var canvas_height = game_canvas.height;

var logical_width = canvas_width / CELL_SIZE;
var logical_height = canvas_height / CELL_SIZE;

var board = new Array(logical_height);

var game_state = { state: GameStates.NOT_STARTED, snake_moved: false };

for (var i = 0; i < board.length; i++) {
    board[i] = new Array(logical_width);
}

resetBoard(game_context, board);
generateFood(game_context, board, apple);
generateSnakeStart(game_context, board, snake);

snake.direction = Direction.NONE;
snake.tail = new LinkedList();

window.addEventListener("keydown", checkKey, false);

doGame(game_context, board, snake, apple, game_state);