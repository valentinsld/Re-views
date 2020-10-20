import "../styles/index.scss";

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

//circle
class Point {
  constructor(x, y, size, sent) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.sentiment = sent;
  }
  draw(space, size) {
    ctx.beginPath();
    // ctx.fillStyle = "#ffffff";

    if (this.sentiment == undefined) {
      ctx.fillStyle = "#ffffff";
    } else {
      if (this.sentiment.global == "positive") {
        ctx.fillStyle = "green";
      } else if (this.sentiment.global == "mixed") {
        ctx.fillStyle = "orange";
      } else {
        ctx.fillStyle = "red";
      }
    }

    let sizez = this.size * size;
    if (sizez < 1) {
      sizez = 1;
    }

    ctx.rect(cw / 2 + space * this.x, ch / 2 + space * this.y, sizez, sizez);
    ctx.fill();

    ctx.closePath();
  }
}

// data
import tenet from "../assets/tenetBis.json";
console.log(tenet);

// init canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
let cw = canvas.width;
let ch = canvas.height;

// rect
ctx.beginPath();

ctx.fillStyle = "#000000";
ctx.rect(0, 0, cw, ch);
ctx.fill();

ctx.closePath();

// variables
const dat = require("dat.gui");

// ES6:
const gui = new dat.GUI();

let space = 15;
let size = 8;
let cx = 20;
let cy = 32;

let points = [];
for (let l = -cx; l < cx; l++) {
  for (let h = -cy; h < cy; h++) {
    points.push(new Point(l, h, -1));
  }
}

tenet.forEach((e) => {
  const x = Math.floor(Math.random() * cx * 2 - cx);
  const y = Math.floor(Math.random() * cy * 2 - cy);

  points.push(new Point(x, y, 1, e.sentiment));

  child(e, x, y, 1);
});

function child(e, x, y, a) {
  if (e.hasOwnProperty("replies")) {
    e.replies.forEach((r) => {
      const dir = direction();
      const x1 = x + dir.x;
      const y1 = y + dir.y;

      points.push(new Point(x1, y1, Math.pow(0.8, a), r.sentiment));

      child(r, x1, y1, a + 1);
    });
  }
}

function direction() {
  const d = Math.floor(Math.random() * 8);

  switch (d) {
    case 1:
      return { x: 0, y: -1 };
      break;
    case 2:
      return { x: 1, y: -1 };
      break;
    case 3:
      return { x: 1, y: 0 };
      break;
    case 4:
      return { x: 1, y: 1 };
      break;
    case 5:
      return { x: 0, y: 1 };
      break;
    case 6:
      return { x: -1, y: 1 };
      break;
    case 7:
      return { x: -1, y: 0 };
      break;
    case 8:
      return { x: -1, y: -1 };
      break;

    default:
      return { x: 0, y: 0 };
      break;
  }
}

points.forEach((p) => {
  p.draw(space, size);
});

// loop
// let time = 0;
// const update = () => {
//   requestAnimationFrame(update);

//   ctx.fillStyle = "#000000";
//   ctx.rect(0, 0, cw, ch);
//   ctx.fill();

//   time += 0.01;
// };
// requestAnimationFrame(update);
