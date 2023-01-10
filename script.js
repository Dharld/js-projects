import { Game } from "./src/actors/Game.js";
import { Pawn } from "./src/actors/Pawn.js";
import { COLOR_BLACK, COLOR_WHITE } from "./src/utils/config.js";

const game = new Game();
game.init();

const p1 = new Pawn(COLOR_BLACK);
p1.pos = "d2";

const p2 = new Pawn(COLOR_WHITE);
p2.pos = "e3";

/*
console.log(`P1: ${p1.pos}`);
console.log(`P2: ${p2.pos}`);

console.log("P1 captures P2");
p2.capture(
  p1,
  () => {
    console.log("Remove P2 from the board");
  },
  () => {
    console.log("Redraw the screen with the new state");
  }
);

console.log(`P2: ${p2.pos}`); */
