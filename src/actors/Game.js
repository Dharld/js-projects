import {
  CASE_SIZE,
  COLOR_BLACK,
  COLOR_WHITE,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  INITIAL_NUMBER_OF_ROWS_WITH_PAWNS,
  numberToAlphabet,
  NUMBER_OF_COLUMNS,
  NUMBER_OF_ROWS,
} from "../utils/config.js";
import { Pawn } from "./Pawn.js";

export class Game {
  #field = document.getElementById("canvas");
  #board = [[], [], [], [], [], [], [], [], [], []];
  #activePlayer = "Player1";
  #activePawn;

  constructor() {
    // Draw black pawns
    for (let row = 0; row < INITIAL_NUMBER_OF_ROWS_WITH_PAWNS; row++) {
      for (let col = 0; col < NUMBER_OF_COLUMNS; col++) {
        if (this.#isEven(row) == !this.#isEven(col)) {
          this.#board[row][col] = new Pawn(COLOR_BLACK, col, row);
        } else {
          this.#board[row][col] = "Empty";
        }
      }
    }

    // Draw black pawns
    for (
      let row = NUMBER_OF_ROWS - 1;
      row > NUMBER_OF_ROWS - INITIAL_NUMBER_OF_ROWS_WITH_PAWNS - 1;
      row--
    ) {
      for (let col = 0; col < NUMBER_OF_COLUMNS; col++) {
        if (this.#isEven(row) == !this.#isEven(col)) {
          this.#board[row][col] = new Pawn(COLOR_WHITE, col, row);
        } else {
          this.#board[row][col] = "Empty";
        }
      }
    }
    // Fill remaining rows {

    for (let row = 4; row < 6; row++) {
      for (let col = 0; col < NUMBER_OF_COLUMNS; col++) {
        this.#board[row][col] = "Empty";
      }
    }

    this.#addListeners();
  }

  playATurn(e) {
    const posX = Math.floor((e.clientX - this.#field.offsetLeft) / CASE_SIZE);
    const posY = Math.floor((e.clientY - this.#field.offsetTop) / CASE_SIZE);

    if (!this.#activePawn && this.#activePlayer) {
      // Get the pawn at the clicked position

      const p = this.#board[posY][posX];

      if (p == "Empty") return;

      this.#activePawn = p;

      if (this.checkTurn()) {
        p.showPossibleMovement(this.context, this.checkBoard.bind(this));
      }
    } else {
      // Checking if the clicked case is empty
      const newPos = `${numberToAlphabet[posY]}${posX}`;
      if (
        this.board[posY][posX] == "Empty" &&
        this.#activePawn.canMoveTo(newPos, this.checkBoard.bind(this))
      ) {
        if (this.checkTurn())
          this.#activePawn.moveTo(newPos, (oldX, oldY, newX, newY) => {
            document.addEventListener("capture", (e) => {
              const { left, up, oldX, oldY } = e.detail;
              /*               console.log(oldX, oldY);
               */ const pLeft = oldX + (left ? -1 : 1);
              const pUp = oldY + (up ? -1 : 1);

              this.board[pUp][pLeft] = "Empty";
              /* const pawnToRemove = this.#activePawn.at(
                left,
                up,
                this.checkBoard.bind(this)
              ); */
              /*               console.log(pawnToRemove);
               */
            });

            // Empty the previous position
            // console.log(`x: ${oldX},y: ${oldY},newX: ${newX},newY: ${newY}`);
            this.board[oldY][oldX] = "Empty";

            // Put the pawn in the good location
            this.board[newY][newX] = this.#activePawn;
            requestAnimationFrame(this.renderBoard.bind(this));

            this.#activePlayer =
              this.#activePlayer == "Player1" ? "Player2" : "Player1";
          });
        // no active pawn
        this.#activePawn = "";
      } else {
        this.cancel();
      }
    }
  }

  update() {
    const ctx = this.#field.getContext("2d");
    for (let row of this.#board) {
      for (let p of row) {
        if (p == "Empty") continue;
        p.draw(ctx);
      }
    }
  }

  renderBoard() {
    this.#clearScreen();
    this.#drawBoard();
    this.update();
  }

  init() {
    this.renderBoard();
  }

  checkTurn() {
    return (
      (this.#activePlayer == "Player1" &&
        this.#activePawn.color == COLOR_WHITE) ||
      (this.#activePlayer == "Player2" && this.#activePawn.color == COLOR_BLACK)
    );
  }

  #drawBoard() {
    const ctx = this.#field.getContext("2d");
    for (let x = 0; x < NUMBER_OF_ROWS; x++) {
      for (let y = 0; y < NUMBER_OF_COLUMNS; y++) {
        if (this.#isEven(x) == !this.#isEven(y)) {
          ctx.rect(x * CASE_SIZE, y * CASE_SIZE, CASE_SIZE, CASE_SIZE);
          ctx.fillStyle = "black";
          ctx.fill();
        } else {
          ctx.fillStyle = "#9C5110";
          ctx.fill();
        }
      }
    }
  }
  #clearScreen() {
    this.context.clearRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
  }

  get context() {
    return this.#field.getContext("2d");
  }

  set activePawn(p) {
    this.#activePawn = p;
  }
  #isEven(number) {
    return number % 2 == 0;
  }

  #addListeners() {
    this.#field.addEventListener("click", (e) => {
      //   console.log(this.#field.offsetLeft, this.#field.offsetTop);
      this.playATurn(e, this.#activePlayer);
    });
  }

  get board() {
    return this.#board;
  }

  checkBoard(pos) {
    const [x, y] = Pawn.position(pos);
    return this.#board[y][x];
  }

  cancel() {
    this.#activePawn = null;
    this.renderBoard();
  }
}
