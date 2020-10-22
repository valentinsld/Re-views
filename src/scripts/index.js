import "../styles/index.scss";
// import mouse from "mouse-position";
var mouse = require("../../node_modules/mouse-position/index")();

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

//circle
class ParentPoint {
  constructor(x, y, json, depths) {
    this.x = x;
    this.y = y;
    this.json = json;
    this.depths = depths;

    this.childs = [];

    this.createChilds();
  }
  createChilds() {
    const that = this;
    let coord = [[{ x: this.x, y: this.y }]];

    // Center point
    const newChild = new Point(that.x, that.y, 1.1, this.json.sentiment);
    this.childs.push(newChild);

    this.depths.forEach((j, i) => {
      let newCoor = [];

      j.elem.forEach((e, ix) => {
        let x1, y1;
        for (let o = 0; o < 10; o++) {
          const dir = directionBis();
          let lg = coord[i].length - 1;

          let x = coord[i][Math.floor(Math.random() * lg)].x;
          let y = coord[i][Math.floor(Math.random() * lg)].y;

          x1 = x + dir.x;
          y1 = y + dir.y;

          if (!(x1 < vs.cx && x1 > -vs.cx)) {
            x1 = x + dir.x * -1;
          }
          if (!(y1 < vs.cy && y1 > -vs.cy)) {
            y1 = y + dir.y * -1;
          }

          let overlap = false;
          coord.forEach((c) => {
            c.forEach((cc) => {
              if (cc.x == x1 && cc.y == y1) {
                overlap = true;
              }
            });
          });

          if (!overlap) {
            break;
          }
        }

        newCoor.push({ x: x1, y: y1 });
        const newChild = new Point(x1, y1, Math.pow(0.7, i), e.sentiment);
        this.childs.push(newChild);
      });

      coord.push(newCoor);
    });

    // console.log(coord);
    // console.log(this.childs);
  }
  update(a, b, d = false) {
    this.childs.forEach((c) => {
      c.draw(a, b, d);
    });
  }
  hover(a, b) {
    for (let i = 0; i < this.childs.length; i++) {
      const hov = this.childs[i].hover(a, b);

      if (hov) {
        return true;
      }
    }
  }
}
class Point {
  constructor(x, y, size, sent) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.sentiment = sent;
  }
  draw(space, size, d) {
    ctx.beginPath();

    if (d || hovPoint == undefined || this.size < 0) {
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.5;
    }

    if (d) {
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
    } else {
      ctx.fillStyle = "#ffffff";
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
  hover(a, b) {
    const cx = cw / 2 + vs.space * this.x;
    const cy = ch / 2 + vs.space * this.y;
    if (
      a > cx - vs.space / 2 - 1 &&
      a < cx + vs.space / 2 + 1 &&
      b > cy - vs.space / 2 - 1 &&
      b < cy + vs.space / 2 + 1
    ) {
      return true;
    } else {
      return false;
    }
  }
}

// data
import tenet from "../assets/tenetBis.json";
import avengers from "../assets/avengers.json";
import starWars from "../assets/star_wars_rise_of_skywalker.json";
import hollywood from "../assets/once_upon_a_time.json";
import joker from "../assets/joker12.json";
const jsons = {
  tenet,
  avengers,
  starWars,
  hollywood,
  joker,
};

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
  size: 10,
  cx: 20,
  cy: 32,
  reg: create,
  json: "tenet",
  solo: false,
};

gui.add(vs, "space", 0, 50);
gui.add(vs, "size", 0, 50);
gui.add(vs, "cx", 0, 50).onChange(create);
gui.add(vs, "cy", 0, 50).onChange(create);
gui.add(vs, "solo").onChange(create);
gui
  .add(vs, "json", ["tenet", "avengers", "starWars", "hollywood", "joker"])
  .onChange(create);
gui.add(vs, "reg");

//        DRAWING
////////////////////////////////

let points = [];
let pointsBack = [];

function create() {
  console.log("=======");
  points = [];
  pointsBack = [];

  for (let l = -vs.cx; l < vs.cx; l++) {
    for (let h = -vs.cy; h < vs.cy; h++) {
      pointsBack.push(new Point(l, h, -1));
    }
  }

  jsons[vs.json].forEach((e) => {
    let x, y;
    let d5;

    for (let l = 0; l < 20; l++) {
      d5 = true;
      x = Math.floor(Math.random() * vs.cx * 2 - vs.cx);
      y = Math.floor(Math.random() * vs.cy * 2 - vs.cy);

      let depthMax = (getDepth(e) * 2) / 3;

      points.forEach((p) => {
        const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));
        if (dist < depthMax) {
          d5 = false;
        }
      });

      if (d5) {
        break;
      }
    }

    if (d5) {
      createPoint(e, x, y);
    } else {
      console.log("NOPE");
    }
  });
}
create();

function createPoint(e, x, y) {
  //calculer profondeur

  let tab = [
    { nb: 0, elem: [] },
    { nb: 0, elem: [] },
    { nb: 0, elem: [] },
    { nb: 0, elem: [] },
    { nb: 0, elem: [] },
  ];
  depthTab(e, tab);
  // console.log(tab);

  if (tab[0].nb > 0 || vs.solo) {
    const pp = new ParentPoint(x, y, e, tab);
    points.push(pp);
  }
}

function getDepth(obj) {
  var depth = 0;
  if (obj.replies) {
    obj.replies.forEach(function (d) {
      var tmpDepth = getDepth(d);
      if (tmpDepth > depth) {
        depth = tmpDepth;
      }
    });
  }
  return 1 + depth;
}

function depthTab(obj, tab) {
  if (obj.replies) {
    obj.replies.forEach((r) => {
      tab[0].nb += 1;
      tab[0].elem.push(r);
    });
  }

  for (let i = 0; i < tab[0].nb; i++) {
    if (obj.replies[i].replies) {
      obj.replies[i].replies.forEach((r) => {
        tab[1].nb += 1;
        tab[1].elem.push(r);
      });
    }
  }

  for (let i = 0; i < tab[0].nb; i++) {
    if (obj.replies[i].replies) {
      for (let l = 0; l < tab[1].nb; l++) {
        if (obj.replies[i].replies[l] && obj.replies[i].replies[l].replies) {
          obj.replies[i].replies[l].replies.forEach((r) => {
            tab[2].nb += 1;
            tab[2].elem.push(r);
          });
        }
      }
    }
  }

  for (let i = 0; i < tab[0].nb; i++) {
    if (obj.replies[i].replies) {
      for (let l = 0; l < tab[1].nb; l++) {
        if (obj.replies[i].replies[l] && obj.replies[i].replies[l].replies) {
          for (let n = 0; n < tab[2].nb; n++) {
            if (
              obj.replies[i].replies[l].replies[n] &&
              obj.replies[i].replies[l].replies[n].replies
            ) {
              obj.replies[i].replies[l].replies[n].replies.forEach((r) => {
                tab[3].nb += 1;
                tab[3].elem.push(r);
              });
            }
          }
        }
      }
    }
  }

  for (let i = 0; i < tab[0].nb; i++) {
    if (obj.replies[i].replies) {
      for (let l = 0; l < tab[1].nb; l++) {
        if (obj.replies[i].replies[l] && obj.replies[i].replies[l].replies) {
          for (let n = 0; n < tab[2].nb; n++) {
            if (
              obj.replies[i].replies[l].replies[n] &&
              obj.replies[i].replies[l].replies[n].replies
            ) {
              for (let m = 0; m < tab[3].nb; m++) {
                if (
                  obj.replies[i].replies[l].replies[n].replies[m] &&
                  obj.replies[i].replies[l].replies[n].replies[m].replies
                ) {
                  obj.replies[i].replies[l].replies[n].replies[
                    m
                  ].replies.forEach((r) => {
                    tab[4].nb += 1;
                    tab[4].elem.push(r);
                  });
                }
              }
            }
          }
        }
      }
    }
  }
}

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
          break;
        }
      }

      points.push(new Point(x1, y1, Math.pow(0.8, a), r.sentiment, a));

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

function directionBis(a) {
  let d;
  if (a == undefined) {
    d = Math.floor(Math.random() * 4) + 1;
  } else {
    d = a;
  }

  switch (d) {
    case 1:
      return { x: 0, y: -1 };
      break;
    case 2:
      return { x: 1, y: 0 };
      break;
    case 3:
      return { x: 0, y: 1 };
      break;
    case 4:
      return { x: -1, y: 0 };
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
    p.update(vs.space, vs.size);
  });

  if (hovPoint) {
    hovPoint.update(vs.space, vs.size, true);
  }

  time += 0.01;
};
requestAnimationFrame(update);

//      Mouse pos
/////////////////////////
let hovPoint;
window.addEventListener("mousemove", () => {
  // console.log(`Pos : ${mouse[0]}, ${mouse[1]}`);
  let hov = false;

  points.forEach((p) => {
    const h = p.hover(mouse[0], mouse[1]);

    if (h) {
      document.querySelector("body").style.cursor = "pointer";
      hovPoint = p;
      hov = true;
    }
  });

  if (!hov) {
    document.querySelector("body").style.cursor = "initial";
    hovPoint = undefined;
  }
});
