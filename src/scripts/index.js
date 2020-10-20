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

    ctx.rect(
      cw / 2 + space * this.x - sizez / 2,
      ch / 2 + space * this.y - sizez / 2,
      sizez,
      sizez
    );
    ctx.fill();

    ctx.closePath();
  }
}

// data
import tenet from "../assets/tenetBis.json";

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
const gui = new dat.GUI();
let vs = {
  space: 15,
  size: 8,
  cx: 20,
  cy: 32,
  reg: create,
};

gui.add(vs, "space", 0, 50);
gui.add(vs, "size", 0, 50);
gui.add(vs, "cx", 0, 50).onChange(create);
gui.add(vs, "cy", 0, 50).onChange(create);
gui.add(vs, "reg");

//        DRAWING
////////////////////////////////

let points = [];
let pointsBack = [];

function create() {
  points = [];
  pointsBack = [];

  for (let l = -vs.cx; l < vs.cx; l++) {
    for (let h = -vs.cy; h < vs.cy; h++) {
      pointsBack.push(new Point(l, h, -1));
    }
  }

  tenet.forEach((e) => {
    let x, y;
    let d5;

    for (let l = 0; l < 10; l++) {
      d5 = true;
      x = Math.floor(Math.random() * vs.cx * 2 - vs.cx);
      y = Math.floor(Math.random() * vs.cy * 2 - vs.cy);

      points.forEach((p) => {
        const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
        if (dist < 2) {
          d5 = false;
        }
      });

      if (d5) {
        break;
      }
    }

    if (d5) {
      points.push(new Point(x, y, 1, e.sentiment));
      child(e, x, y, 1);
    } else {
      console.log("NOPE");
    }
  });
}
create();

function child(e, x, y, a) {
  if (e.hasOwnProperty("replies")) {
    e.replies.forEach((r) => {
      const dir = direction();
      let x1 = x + dir.x;
      let y1 = y + dir.y;

      if (!(x1 < vs.cx && x1 > -vs.cx)) {
        x1 = x + dir.x * -1;
      }
      if (!(y1 < vs.cy && y1 > -vs.cy)) {
        y1 = y + dir.y * -1;
      }

      for (let i = 0; i < points.length; i++) {
        if (points[i].x == x1 && points[i].y == y1) {
          console.log(`break`);

          // for (let l = 0; l < 8; l++) {
          //   const dir = direction(l);
          //   let x1 = x + dir.x;
          //   let y1 = y + dir.y;

          // }

          break;
        }
      }

      points.push(new Point(x1, y1, Math.pow(0.8, a), r.sentiment));

      child(r, x1, y1, a + 1);
    });
  }
}

function direction(a) {
  let d;
  if (a == undefined) {
    d = Math.floor(Math.random() * 7) + 1;
  } else {
    d = a;
  }

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
      console.error("error direction");
      return { x: 0, y: 0 };
      break;
  }
}

// loop
let time = 0;
const update = () => {
  requestAnimationFrame(update);

  ctx.fillStyle = "#000000";
  ctx.rect(0, 0, cw, ch);
  ctx.fill();

  pointsBack.forEach((p) => {
    p.draw(vs.space, vs.size);
  });

  points.forEach((p) => {
    p.draw(vs.space, vs.size);
  });

  time += 0.01;
};
requestAnimationFrame(update);
