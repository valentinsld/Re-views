import "../styles/index.scss";
var mouse = require("../../node_modules/mouse-position/index")();

if (process.env.NODE_ENV === "development") {
  require("../index.html");
}

// circles
class ParentPoint {
  constructor(x, y, json, depths, c1, gs) {
    this.x = x;
    this.y = y;
    this.json = json;
    this.depths = depths;
    this.colorFront = c1;
    this.globalSentiment = gs;

    this.childs = [];

    this.createChilds();
  }
  createChilds() {
    const that = this;
    let coord = [[{ x: this.x, y: this.y }]];

    // Center point
    const newChild = new Point(
      that.x,
      that.y,
      1.1,
      this.json.sentiment,
      this.colorFront
    );
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
        // console.log(this.globalSentiment);
        return true;
      }
    }
  }
}
class Point {
  constructor(x, y, size, sent, c1) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.colorFront = c1;

    this.sentiment = sent;
    this.hoverr = {
      x1: cw / 2 + vs.space * this.x - vs.space / 2 - 1,
      x2: cw / 2 + vs.space * this.x + vs.space / 2 + 1,
      y1: ch / 2 + vs.space * this.y - vs.space / 2 - 1,
      y2: ch / 2 + vs.space * this.y + vs.space / 2 + 1,
    };
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
        ctx.fillStyle = this.colorFront;
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
      ctx.fillStyle = this.colorFront;
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
    if (
      a > this.hoverr.x1 &&
      a < this.hoverr.x2 &&
      b > this.hoverr.y1 &&
      b < this.hoverr.y2
    ) {
      return true;
    } else {
      return false;
    }
  }
}
class BackPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// data
import tenet from "../assets/tenetBis.json";
import avengers from "../assets/avengers.json";
import starWars from "../assets/star_wars_rise_of_skywalker.json";
import hollywood from "../assets/once_upon_a_time.json";
import joker from "../assets/joker12.json";

// variables
// let vh = ch / 100;
let vs = {
  space: 15,
  size: 10,
  cx: 21,
  cy: 32,
  solo: true,
};

let cw = innerWidth;
let ch = innerHeight;

class Paint {
  constructor(canvas, json, c1, c2) {
    // init this.canvas
    this.json = json;
    this.colorBack = c1;
    this.colorFront = c2;

    this.canvas = document.querySelector(canvas);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = this.colorBack;
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

      if (!moved) {
        this.ctx.fillStyle = this.colorBack;
        this.ctx.globalAlpha = 0.3;
        this.ctx.rect(0, 0, cw, ch);
        this.ctx.fill();

        this.ctx.globalAlpha = 1;

        this.pointsBack.forEach((p) => {
          // p.draw(vs.space, vs.size, false, this.ctx);
          this.ctx.beginPath();
          this.ctx.fillStyle = this.colorFront;
          this.ctx.rect(cw / 2 + vs.space * p.x, ch / 2 + vs.space * p.y, 1, 1);
          this.ctx.fill();
          this.ctx.closePath();
        });

        this.points.forEach((p) => {
          p.update(vs.space, vs.size, false, this.ctx, this.hovPoint);
        });

        if (this.hovPoint) {
          this.hovPoint.update(vs.space, vs.size, true, this.ctx);
        }
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
  }
  create() {
    console.log("=======");
    this.points = [];
    this.pointsBack = [];

    for (let l = -vs.cx; l < vs.cx; l++) {
      for (let h = -vs.cy; h < vs.cy; h++) {
        this.pointsBack.push(new BackPoint(l, h));
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
    let tab2 = {};
    this.depthTab(e, tab, tab2);

    if (tab[0].nb > 0 || vs.solo) {
      const pp = new ParentPoint(x, y, e, tab, this.colorFront, tab2);
      this.points.push(pp);
    }
  }

  depthTab(obj, tab, tab2) {
    let positive = obj.sentiment.positive + obj.sentiment.neutral;
    let negative = obj.sentiment.negative;
    let total = 1;

    if (obj.replies) {
      obj.replies.forEach((r) => {
        tab[0].nb += 1;
        tab[0].elem.push(r);

        if (r.sentiment && r.sentiment.positive != undefined) {
          positive += r.sentiment.positive + r.sentiment.neutral;
          negative += r.sentiment.negative;
          total++;
        }
      });
    }

    for (let i = 0; i < tab[0].nb; i++) {
      if (obj.replies[i].replies) {
        obj.replies[i].replies.forEach((r) => {
          tab[1].nb += 1;
          tab[1].elem.push(r);

          if (r.sentiment && r.sentiment.positive != undefined) {
            positive += r.sentiment.positive + r.sentiment.neutral;
            negative += r.sentiment.negative;
            total++;
          }
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
              if (r.sentiment && r.sentiment.positive != undefined) {
                positive += r.sentiment.positive + r.sentiment.mixed;
                negative += r.sentiment.negative;
                total++;
              }
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
                  if (r.sentiment && r.sentiment.positive != undefined) {
                    positive += r.sentiment.positive + r.sentiment.mixed;
                    negative += r.sentiment.negative;
                    total++;
                  }
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

                      if (r.sentiment && r.sentiment.positive != undefined) {
                        positive += r.sentiment.positive + r.sentiment.mixed;
                        negative += r.sentiment.negative;
                        total++;
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    tab2.positive = (total - negative) / total;
    tab2.negative = negative / total;
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

const tenetPaint = new Paint("#tenet", tenet, "#ffffff", "#000000");
const jokerPaint = new Paint("#joker", joker, "#000000", "#ffffff");

//       Change
////////////////////////////////
let moved,
  close = false;
window.addEventListener("mousedown", () => {
  moved = true;
  document.querySelector("body").style.cursor = "grabbing";
});
document.addEventListener("keydown", function () {
  document.querySelector("body").style.cursor = "grabbing";
});
window.addEventListener("mousemove", () => {
  if (moved) {
    // console.log("moved");

    jokerPaint.canvas.style.clipPath = `inset(0 ${
      cw - lerp(mouse.prev[0], mouse[0], 0.01)
    }px 0 0)`;
    document.querySelector("body").style.cursor = "grabbing";
    jokerPaint.canvas.style.transition = "none";
  } else {
    if (mouse[0] > cw - 50 && !close) {
      jokerPaint.canvas.style.clipPath = "inset(0 60px 0 0)";
      document.querySelector("body").style.cursor = "grab";
    } else if (mouse[0] < 50 && close) {
      jokerPaint.canvas.style.clipPath = `inset(0 ${cw - 60}px 0 0)`;
      document.querySelector("body").style.cursor = "grab";
    } else {
      if (!close) {
        jokerPaint.canvas.style.clipPath = "inset(0 0 0 0)";
      } else {
        jokerPaint.canvas.style.clipPath = `inset(0 ${cw}px 0 0)`;
      }
    }
  }
});
window.addEventListener("mouseup", () => {
  if (moved) {
    if (mouse[0] > cw / 2) {
      jokerPaint.canvas.style.transition = "all 700ms ease-out";
      jokerPaint.canvas.style.clipPath = "inset(0 0 0 0)";
      close = false;
    } else {
      jokerPaint.canvas.style.transition = "all 700ms ease-out";
      jokerPaint.canvas.style.clipPath = "inset(0 100% 0 0)";
      close = true;
    }

    document.querySelector("body").style.cursor = "initial";
    moved = false;
  }
});

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

//        Add auto
////////////////////////////////
import io from "socket.io-client";

const socket = io("https://dataviz-server.herokuapp.com/");

socket.on("msg", function (msg) {
  console.log(msg);
});

//        Animation
////////////////////////////////
import gsap from "gsap";

const tl = gsap.timeline();
const lines = document.querySelectorAll(".content-sub .wrapper span");
const btn = document.querySelector(".cta");

gsap.set(lines, { y: "100%" });
gsap.set(".content-title span", { y: "100%" });
gsap.set("rect", { opacity: 0 });
gsap.set("header a", { y: "100%" });
gsap.set(".cta span", { opacity: 0 });
gsap.set(".content-2 span", { y: "100%" });

tl.to(
  "header a",
  { y: "0%", duration: 1.2, stagger: 0.2, ease: "power3.out" },
  6
)
  .to(
    ".content-title span",
    { y: "0%", duration: 1.3, stagger: 0.1, ease: "power3.out" },
    "-=1.2"
  )
  .to(
    "rect",
    {
      opacity: 1,
      ease: "power3.out",
      stagger: { from: "random", amount: "0.5", ease: "power3.inOut" },
      duration: 0.01,
    },
    "-=1"
  )
  .to(
    lines,
    { y: "0%", duration: 1.2, stagger: 0.15, ease: "power3.out" },
    "-=1"
  )
  .to(
    ".background",
    { opacity: 0.15, duration: 2, ease: "power3.out" },
    "-=2.5"
  )
  .to(
    ".cta span",
    {
      opacity: 1,
      ease: "power3.out",
      stagger: { from: "random", amount: "0.4" },
      duration: 0.01,
    },
    "-=1"
  );

btn.addEventListener("click", (e) => {
  console.log("click");
  tl.to(".background", {
    scale: 0.7,
    opacity: 0,
    duration: 1.4,
    ease: "power3.inOut",
  })
    .to(
      ".content",
      { scale: 0.7, opacity: 0, duration: 1.4, ease: "power3.inOut" },
      "-=1.1"
    )
    .to(btn, { opacity: 0, duration: 0.6, ease: "power3.inOut" }, "-=1")
    .to(".content-2 span", {
      y: "0%",
      duration: 1.2,
      stagger: 0.15,
      ease: "power3.out",
    })
    .to(
      ".content-2 span",
      { y: "100%", duration: 0.8, stagger: 0.05, ease: "power3.in" },
      "+=1"
    )
    .to(
      "#joker",
      { scale: "1", opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.in" },
      "+=1"
    )
    .to(
      "#tenet",
      { scale: "1", opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.in" },
      "+=1"
    );
});
