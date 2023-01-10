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
      this.#posX * CASE_SIZE + CASE_SIZE / 2,
      this.#posY * CASE_SIZE + CASE_SIZE / 2,
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
        x * CASE_SIZE + CASE_SIZE / 2,
        y * CASE_SIZE + CASE_SIZE / 2,
        RED_DOT_SIZE,
        Math.PI * 2,
        0
      );
      ctx.fillStyle = "red";
      ctx.fill();
    }
  }

  canMoveTo(pos, checkBoard) {
    const arr = this.getPossibleMovArray(checkBoard);
    return arr.includes(pos);
  }

  capture(p, removeCapturedPawn, redraw) {
    const [cx, cy] = Pawn.position(p.pos);
    let newPosX, newPosY;
    // Removing the captured pawn from the screen and from the board array
    // Compute new position and move;
    const moveDownward =
      this.#posY - cy == -1 ? +1 : this.#posY - cy == 1 ? -1 : 0;
    const moveLeftward =
      this.#posX - cx == -1 ? +1 : this.#posX - cx == 1 ? -1 : 0;

    if (moveDownward == 0 || moveLeftward == 0) return;

    removeCapturedPawn(p);

    newPosY = this.#posY + moveDownward * 2;
    newPosX = this.#posX + moveLeftward * 2;

    const newPos = `${numberToAlphabet[newPosY]}${newPosX}`;
    this.pos = newPos;

    moveTo(newPos, redraw);
  }

  moveTo(newPos, redraw) {
    const [oldX, oldY] = [this.#posX, this.#posY];
    const [newX, newY] = Pawn.position(newPos);
    this.#posX = newX;
    this.#posY = newY;

    const left = newX - oldX < 0 ? true : false;
    const up = newY - oldY < 0 ? true : false;

    if (Math.abs(newX - oldX) == 2 && Math.abs(newY - oldY) == 2)
      document.dispatchEvent(
        new CustomEvent("capture", { detail: { left, up, oldX, oldY } })
      );

    redraw(oldX, oldY, newX, newY);
  }

  /*   canMove() {} */

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
    const moveDownwardBool = moveDownward == 1 ? true : false;

    // If there's a capture
    let pawnAtLeft = this.at(true, !moveDownwardBool, checkBoard);
    let pawnAtRight = this.at(false, !moveDownwardBool, checkBoard);

    if (
      pawnAtRight &&
      pawnAtRight != "Empty" &&
      pawnAtRight.color != this.color
    ) {
      let up = pawnAtRight.posY - this.#posY == -1 ? true : false;
      let left = pawnAtRight.posX - this.#posX == -1 ? true : false;
      let secondPawnAtRight = pawnAtRight.at(left, up, checkBoard);
      if (secondPawnAtRight && secondPawnAtRight == "Empty") {
        // Adding this pos to the possibleMov
        const posX = pawnAtRight.posX + 1;
        const posY = pawnAtRight.posY + moveDownward;
        const newPos = `${numberToAlphabet[posY]}${posX}`;

        possibleMov.push(newPos);
      }
    }
    if (pawnAtLeft && pawnAtLeft != "Empty" && pawnAtLeft.color != this.color) {
      let up = pawnAtLeft.posY - this.#posY == -1 ? true : false;
      let left = pawnAtLeft.posX - this.#posX == -1 ? true : false;
      let secondPawnAtLeft = pawnAtLeft.at(left, up, checkBoard);
      if (secondPawnAtLeft && secondPawnAtLeft == "Empty") {
        // Adding this pos to the possibleMov
        const posX = pawnAtLeft.posX - 1;
        const posY = pawnAtLeft.posY + moveDownward;
        const newPos = `${numberToAlphabet[posY]}${posX}`;

        possibleMov.push(newPos);
      }
    }

    if (this.#posX == 0 || this.#posX == NUMBER_OF_COLUMNS - 1) {
      // If we are at the edge
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
      if (pos1) {
        possibleMov.push(pos1);
      }
      if (pos2) {
        possibleMov.push(pos2);
      }
    }

    return possibleMov;
  }

  at(left, up, checkBoard) {
    let posX = this.#posX + (left == true ? -1 : +1);
    let downward = up == false ? 1 : -1;
    /* let posX = this.#posX + (position == "left" ? -1 : +1);
    let downward = this.#color === COLOR_BLACK ? 1 : -1; */
    let posY = this.#posY + downward;
    const newPos = `${numberToAlphabet[posY]}${posX}`;
    return checkBoard(newPos);
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

  get posX() {
    return this.#posX;
  }

  get posY() {
    return this.#posY;
  }
}
