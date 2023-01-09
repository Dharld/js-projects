import {
  alphabetToNumber,
  CASE_SIZE,
  COLOR_BLACK,
  COLOR_WHITE,
  numberToAlphabet,
  NUMBER_OF_COLUMNS,
  RED_DOT_SIZE,
} from "../utils/config.js";

export class Pawn {
  #color;
  #posX;
  #posY;

  constructor(color, posX, posY, ctx) {
    this.#color = color;
    this.#posX = posX;
    this.#posY = posY;
  }

  draw(context) {
    context.beginPath();
    context.arc(
      this.#posX * CASE_SIZE + 50,
      this.#posY * CASE_SIZE + 50,
      CASE_SIZE / 2.25,
      Math.PI * 2,
      0
    );
    context.fillStyle = this.#color;
    context.fill();
    // console.log(this.pos);
  }

  showPossibleMovement(ctx, checkBoard) {
    // Show the red point(s) at the appropriate position
    this.getPossibleMovArray(checkBoard).forEach((pos) => showRedDotAt(pos));

    /** Function to get the location of a pos of the form 'a8,f0...etc' */
    function showRedDotAt(pos) {
      if (!pos) return;
      const [x, y] = Pawn.position(pos);
      ctx.beginPath();
      ctx.arc(
        x * CASE_SIZE + 50,
        y * CASE_SIZE + 50,
        RED_DOT_SIZE,
        Math.PI * 2,
        0
      );
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }

  capture(p) {}

  moveTo(newPos, redraw) {
    const [oldX, oldY] = [this.#posX, this.#posY];
    const [newX, newY] = Pawn.position(newPos);
    this.#posX = newX;
    this.#posY = newY;
    redraw(oldX, oldY, newX, newY);
  }

  /*   canMove() {} */

  canMoveTo(pos, checkBoard) {
    return this.getPossibleMovArray(checkBoard).includes(pos);
  }

  get color() {
    return this.#color;
  }
  get pos() {
    return `Pawn ${numberToAlphabet[this.#posY]}${this.#posX}`;
  }

  set pos(value) {
    /* let reg = /(?<str>\w)(?<num>\d)/;
    const found = value.match(reg);
    this.#posY = alphabetToNumber[found[1]];
    this.#posX = +found[2]; */
    [this.#posX, this.#posY] = Pawn.position(value);
  }

  getPossibleMovArray(checkBoard) {
    const possibleMov = [];

    // This represent the increment for the two possible positions
    // Depending of the pawn's color
    const moveDownward = this.#color == COLOR_BLACK ? 1 : -1;

    // If we are at the edge
    if (this.#posX == 0 || this.#posX == NUMBER_OF_COLUMNS - 1) {
      const left = this.#posX == 0;
      const pos =
        numberToAlphabet[this.#posY + moveDownward] +
        "" +
        (this.#posX + (left ? 1 : -1));
      // If there's an element add nothing
      if (checkBoard(pos) != "Empty") return;
      possibleMov.push(pos);
    }
    // Otherwise
    else {
      const [pos1, pos2] = [-1, 1].map((x) => {
        const pos =
          numberToAlphabet[this.#posY + moveDownward] + "" + (this.#posX + x);
        // If there's an element add nothing
        if (checkBoard(pos) != "Empty") return;
        return pos;
      });
      possibleMov.push(pos1, pos2);
    }

    return possibleMov;
  }
  static position(posValue) {
    let reg = /(?<str>\w)(?<num>\d)/;
    const found = posValue.match(reg);
    return [+found[2], alphabetToNumber[found[1]]];
  }
  promote() {}

  toString() {
    return this.pos;
  }
}
