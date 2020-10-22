import "../styles/index.scss";
var mouse = require("../../node_modules/mouse-position/index")();

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

// circles
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
  }
  update(a, b, d = false, ctx, hov) {
    this.childs.forEach((c) => {
      c.draw(a, b, d, ctx, hov);
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
  draw(space, size, d, ctx, hovPoint) {
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

// variables
// let vh = ch / 100;
// const dat = require("dat.gui");
// const gui = new dat.GUI();
let vs = {
  space: 15,
  size: 10,
  cx: 20,
  cy: 32,
  // reg: create,
  json: "tenet",
  solo: true,
};

// gui.add(vs, "space", 0, 50);
// gui.add(vs, "size", 0, 50);
// gui.add(vs, "cx", 0, 50).onChange(create);
// gui.add(vs, "cy", 0, 50).onChange(create);
// gui.add(vs, "solo").onChange(create);
// // gui
// //   .add(vs, "json", ["tenet", "avengers", "starWars", "hollywood", "joker"])
// //   .onChange(create);
// gui.add(vs, "reg");


let cw = innerWidth;
let ch = innerHeight;

class Paint {
  constructor(canvas, json) {
    // init this.canvas
    this.json = json;

    this.canvas = document.querySelector(canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#000000";
    this.ctx.rect(0, 0, cw, ch);
    this.ctx.fill();

    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;

    window.addEventListener("resize", () => {
      this.canvas.width = innerWidth;
      this.canvas.height = innerHeight;
      cw = innerWidth;
      ch = innerHeight;
    });

    //        DRAWING
    ////////////////////////////////

    this.points = [];
    this.pointsBack = [];
    this.hovPoint;


    this.create();
    const update = () => {
      requestAnimationFrame(update);
    
      this.ctx.fillStyle = "#000000";
      this.ctx.globalAlpha = 0.4;
      this.ctx.rect(0, 0, cw, ch);
      this.ctx.fill();

      this.ctx.globalAlpha = 1;
    
      this.pointsBack.forEach((p) => {
        p.draw(vs.space, vs.size, false, this.ctx);
      });
    
      this.points.forEach((p) => {
        p.update(vs.space, vs.size, false, this.ctx, this.hovPoint);
      });
    
      if (this.hovPoint) {
        this.hovPoint.update(vs.space, vs.size, true, this.ctx);
      }
    
    };
    requestAnimationFrame(update);

    //      Mouse pos
    /////////////////////////
    this.canvas.addEventListener("mousemove", () => {
      let hov = false;

      this.points.forEach((p) => {
        const h = p.hover(mouse[0], mouse[1]);

        if (h) {
          document.querySelector("body").style.cursor = "pointer";
          this.hovPoint = p;
          hov = true;
        }
      });

      if (!hov) {
        document.querySelector("body").style.cursor = "initial";
        this.hovPoint = undefined;
      }
    });

    // this.getDepth = this.getDepth.bind(this);
  }
  create() {
    console.log("=======");
    this.points = [];
    this.pointsBack = [];

    for (let l = -vs.cx; l < vs.cx; l++) {
      for (let h = -vs.cy; h < vs.cy; h++) {
        this.pointsBack.push(new Point(l, h, -1));
      }
    }

    this.json.forEach((e) => {
      let x, y;
      let d5;

      for (let l = 0; l < 20; l++) {
        d5 = true;
        x = Math.floor(Math.random() * vs.cx * 2 - vs.cx);
        y = Math.floor(Math.random() * vs.cy * 2 - vs.cy);

        let depthMax = (getDepth(e) * 2) / 3;

        function getDepth (obj) {
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

        this.points.forEach((p) => {
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
        this.createPoint(e, x, y);
      } else {
        console.log("NOPE");
      }
    });
  }

  createPoint(e, x, y) {
    //calculer profondeur

    let tab = [
      { nb: 0, elem: [] },
      { nb: 0, elem: [] },
      { nb: 0, elem: [] },
      { nb: 0, elem: [] },
      { nb: 0, elem: [] },
    ];
    this.depthTab(e, tab);

    if (tab[0].nb > 0 || vs.solo) {
      const pp = new ParentPoint(x, y, e, tab);
      this.points.push(pp);
    }
  }

  depthTab(obj, tab) {
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

const tenetPaint = new Paint('#tenet', tenet, "#000000", "#ffffff");
const jokerPaint = new Paint('#joker', joker, "#000000", "#ffffff");
