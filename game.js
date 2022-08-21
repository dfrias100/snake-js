function drawBackground(context, width, height) {
    context.fillStyle = "black";
    context.fillRect(0, 0, width, height);
}

function drawColoredSquare(context, x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
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
    drawColoredSquare(context, screen_coords.x + 1, screen_coords.y + 1, 8, 8, "red");
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
    drawColoredSquare(context, screen_coords.x + 1, screen_coords.y + 1, 8, 8, "white");
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

function moveSnake(snake) {
    if (snake.length == 1) {
        var new_location = computeNewCoords(snake.location, snake.direction);
        new_location.x %= 50;
        new_location.y %= 50;
        snake.location = new_location;
    }
}

function drawState(context, snake, apple) {
    drawBackground(context, canvas_width, canvas_height);

    var snake_screen_coords = logicalCoordsToScreenCoords(snake.location.x, snake.location.y);
    var apple_screen_coords = logicalCoordsToScreenCoords(apple.location.x, apple.location.y);

    drawColoredSquare(context, snake_screen_coords.x + 1, snake_screen_coords.y + 1, 8, 8, "white");
    drawColoredSquare(context, apple_screen_coords.y + 1, apple_screen_coords.y + 1, 8, 8, "red");
}

function doGame(context, board_array, snake, apple, game_state) {
    switch (game_state) {
        case GameStates.NOT_STARTED:
            break;
        case GameStates.IN_PROGRESS:
            moveSnake(snake);
            drawState(context, snake, apple);
            break;
        case GameStates.OVER:
            break;
    }
    setTimeout(doGame, 167, context, board_array, snake, apple, game_state);
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
    switch (code) {
        case 37: snake.direction = Direction.LEFT; break;
        case 38: snake.direction = Direction.UP; break;
        case 39: snake.direction = Direction.RIGHT; break;
        case 40: snake.direction = Direction.DOWN; break;
    }
    if (checkIfOppositeDirection(last_direction, snake.direction)) {
        snake.direction = last_direction;
    }
}

function logicalCoordsToScreenCoords(x, y) {
    return {
        x: x * 10,
        y: y * 10
    };
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

var snake = {
    location: {
        x: 0,
        y: 0
    },
    direction: Direction.NONE,
    length: 1,
    tail: []
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

var logical_width = canvas_width / 10;
var logical_height = canvas_height / 10;

var board = new Array(logical_height);

var game_state = GameStates.IN_PROGRESS;

for (var i = 0; i < board.length; i++) {
    board[i] = new Array(logical_width);
}

resetBoard(game_context, board);
generateFood(game_context, board, apple);
generateSnakeStart(game_context, board, snake);
window.addEventListener("keydown", checkKey, false);

snake.direction = Direction.NONE;

doGame(game_context, board, snake, apple, game_state);