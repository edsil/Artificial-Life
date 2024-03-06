import { ArtLife } from "./artlife.js";
let numbGroups = 4;
let crittersPerGroup = 300;
const minFPS = 25;
const maxFPS = 30;
const sampleFPSTime = 2000;
let canvas, ctx;
let btnNewGroup;
let divInfo1, divInfo2, divInfo3, divInfo4, divControl;
let h, w;
let mouse = { x: 0, y: 0 };
let initTime = Date.now();
let lastUpdateTime = initTime;
let frames = 0;
let fps;
let grid;
let framesSampled = 0;
let updateSampled = initTime;
const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [0, 0, 0], [64, 128, 0], [0, 64, 128], [128, 128, 0], [128, 0, 128], [128, 64, 128], [0, 255, 64], [64, 64, 255], [128, 64, 96]];
const maxGroups = colors.length;
const groups = new Array(maxGroups);
const rules = new Array(maxGroups);
const respawnBtns = new Array(maxGroups);


window.onload = function () {
  initDomElements();
  initListeners();
  resize();
  for (let i = 0; i < numbGroups; i++) {
    spawnGroup(i);
    addBtnGroup(i);
  }
  animate(0);
};

function spawnGroup(groupId) {
  const velo = 0.8 + Math.random() * 3;
  groups[groupId] = null;
  groups[groupId] = ArtLife.createGroup(crittersPerGroup, grid, colors[groupId], false, 3, undefined, undefined, velo);
  ArtLife.applyRandomVelocityToGroup(groups[groupId], velo);
  const myrules = new Array(maxGroups);
  for (let j = 0; j < maxGroups; j++) {
    const force = (groupId == j) ? 0 : -0.03 + Math.random() * 0.06;
    const minDist = (groupId == j) ? 4 : 10 + Math.random() * 100;
    const forceAfterDistance = (groupId == j) ? -(velo / 100) : (0.003 - Math.random() * 0.01);
    myrules[j] = { f: force, d: minDist, of: forceAfterDistance };
  }
  rules[groupId] = myrules;
}

function addBtnGroup(groupId) {
  let color = colors[groupId];
  let btnGroup = document.createElement('button');
  btnGroup.id = groupId.toString();
  btnGroup.classList.add('btnGroup');
  btnGroup.style.backgroundColor = rgb(color[0], color[1], color[2]);
  btnGroup.style.color = rgb(255 - color[0], 255 - color[1], 255 - color[2]);
  btnGroup.innerText = "Respawn " + groupId;
  btnGroup.onclick = btnRespawn;

  let btnRemove = document.createElement('button');
  btnRemove.id = groupId.toString();
  btnRemove.classList.add('btnRemove');

  btnRemove.style.color = rgb(color[0], color[1], color[2]);
  btnRemove.innerText = "X";
  btnRemove.onclick = removeGroup;

  respawnBtns[groupId] = [btnGroup, btnRemove];
  divControl.appendChild(btnGroup);
  divControl.appendChild(btnRemove);
}

function removeGroup(e) {
  let groupId = parseInt(e.target.id);
  groups[groupId] = undefined;
  respawnBtns[groupId][0].remove();
  respawnBtns[groupId][1].remove();
  respawnBtns[groupId] = [null, null];
}

function addGroup() {
  let groupId = 0;
  while (groupId < maxGroups) {
    if (groups[groupId] == undefined) {
      spawnGroup(groupId);
      resetRules(groupId);
      addBtnGroup(groupId);
      break;
    }
    groupId++;
  }
}

function reduceGroupSize(ratio) {
  let newSize = Math.floor(ratio * crittersPerGroup);
  groups.forEach(group => {
    group.length = newSize
  });
  crittersPerGroup = newSize;
}

function changeAllGroupsSize(ratio) {
  let newSize = Math.floor(ratio * crittersPerGroup);
  groups.forEach(group => {
    ArtLife.changeGroupSize(group, newSize);
  });
  crittersPerGroup = newSize;
}

function resetRules(groupId) {
  rules.forEach((group, j) => {
    const force = -0.03 + Math.random() * 0.06;
    const minDist = 6 + Math.random() * h / 8;
    const forceAfterDistance = (groupId == j) ? -0.01 : (0.001 - Math.random() * 0.01);
    group[groupId] = { f: force, d: minDist, of: forceAfterDistance };
  })
}

function btnRespawn(e) {
  let groupId = parseInt(e.target.id);
  spawnGroup(groupId);
  resetRules(groupId);
}

function initDomElements() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  divInfo1 = document.getElementById("info1");
  divInfo1.innerHTML = "Mouse";
  divInfo2 = document.getElementById("info2");
  divInfo3 = document.getElementById("info3");
  divInfo3.innerHTML = "Key";
  divInfo4 = document.getElementById("info4");
  divControl = document.getElementById("control");
  btnNewGroup = document.getElementById("newGroup");
  btnNewGroup.onclick = addGroup;
}

function initListeners() {
  window.onresize = resize;
  window.onkeydown = keyDown;
  window.onkeyup = keyUp;
  window.onmousedown = mouseDown;
  window.onmouseup = mouseUp;
  window.onmousemove = mouseMove;
}

function resize() {
  w = canvas.width = window.innerWidth - canvas.offsetLeft * 2;
  h = canvas.height = window.innerHeight - canvas.offsetTop - 47;
  grid = ctx.createImageData(w, h);
  divInfo2.innerHTML = "Width: " + w + "<br>Height: " + h;
}

function keyDown(e) {
  divInfo3.innerHTML = "KeyDown: " + e.key + "<br>Code: " + e.code;
}

function keyUp(e) {
  divInfo3.innerHTML = "KeyUp: " + e.key + "<br>Code: " + e.code;
}

function mouseDown(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse: Down" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>X: " + e.clientX + "<br>Y: " + e.clientY;
}

function mouseUp(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse: Up" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>Mouse X: " + mouse.x + "<br>Mouse Y: " + mouse.y;
}

function mouseMove(e) {
  mouse.x = e.clientX - canvas.offsetLeft;
  mouse.y = e.clientY - canvas.offsetTop;
  divInfo1.innerHTML = "Mouse" + ((e.buttons == 0) ? "" : " - " + e.buttons) + "<br>Mouse X: " + mouse.x + "<br>Mouse Y: " + mouse.y;
}


function animate(ts) {
  frames++;
  lastUpdateTime = Date.now();
  fps = Math.round(frames / ((lastUpdateTime - initTime) / 1000));
  if (lastUpdateTime - updateSampled >= sampleFPSTime) {
    let fpsSampled = ((frames - framesSampled) / (lastUpdateTime - updateSampled)) * 1000;
    if (fpsSampled < minFPS || fpsSampled > maxFPS) {
      let ratio = clamp(fpsSampled / ((maxFPS + minFPS) / 2), 0.925, 1.125);
      changeAllGroupsSize(ratio);
    }
    frames = Math.round(fpsSampled * (lastUpdateTime - initTime) / 1000);
    updateSampled = lastUpdateTime;
    framesSampled = frames;
  }
  draw(ts);
  requestAnimationFrame(animate);
}

function draw(ts) {
  //ctx.clearRect(0, 0, w, h);
  grid = ctx.createImageData(w, h);
  groups.forEach((groupActing, actIndex) => {
    if (groupActing != undefined) {
      groups.forEach((groupReceiving, rcvIndex) => {
        if (groupReceiving != undefined) {
          const groupRules = rules[actIndex][rcvIndex];
          ArtLife.applyRule2Groups(groupActing, groupReceiving, groupRules.f * (ts / 1000), groupRules.d, groupRules.of * (ts / 1000));
        }
      });
    }
  });

  groups.forEach(group => {
    if (group != undefined) {
      group.forEach(e => e.update(ts, true, grid));
    }
  })
  ctx.putImageData(grid, 0, 0);

  divInfo4.innerHTML = "FPS: " + fps + "<br>Time: " + Math.trunc((lastUpdateTime - initTime) / 1000) + " s<br>Critters per group: " + crittersPerGroup;
  /*
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.moveTo(0, h);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.moveTo(w, 0);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.moveTo(w, h);
  ctx.lineTo(mouse.x, mouse.y);
  ctx.stroke();
  */
}

function rgb(r, g, b) {
  return ["rgb(", limitInt255(r), ",", limitInt255(g), ",", limitInt255(b), ")"].join("");
}

function limitInt255(n) { return (n < 0) ? 0 : (n < 255) ? parseInt(n) : 255 }

function clamp(n, min, max) {
  return (n < min) ? min : (n < max) ? n : max;
}

