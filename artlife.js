
export class ArtLife {
  constructor(grid, color, bounceWalls = false, size = 4, pos, velocity, maxVelocity = 4) {
    this.grid = grid;
    this.w = grid.width;
    this.h = grid.height;
    this.pos = (pos == undefined) ? { x: randomInt(10, this.w - 10), y: randomInt(10, this.h - 10) } : pos;
    this.velocity = (velocity == undefined) ? { x: 0, y: 0 } : velocity;
    this.color = (color == undefined) ? this.randomColor() : color;
    this.bounceWalls = bounceWalls;
    this.size = Math.abs(size);
    this.maxVelocity = Math.abs(maxVelocity);
  }

  static colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [0, 0, 0], [64, 128, 0], [0, 64, 128], [128, 128, 0], [128, 0, 128], [128, 64, 128], [0, 255, 64], [64, 64, 255], [128, 64, 96]];

  static randomColor() {
    return this.colors[randomInt(colors.length)];
  }

  static createGroup(number, grid, color, bounceWalls, size, pos, velocity, maxVelocity) {
    const group = new Array(number);
    for (let i = 0; i < number; i++) {
      group[i] = new ArtLife(grid, color, bounceWalls, size, pos, velocity, maxVelocity);
    }
    return group;
  }

  static changeGroupSize(group, toNewSize) {
    if (group == undefined) return;
    const currentSize = group.length;
    group.length = toNewSize;
    if (currentSize >= toNewSize) {
      return;
    }
    const grid = group[0].grid;
    const color = group[0].color;
    const bounceWalls = group[0].bounceWalls;
    const size = group[0].size;
    const maxVelocity = group[0].maxVelocity;
    for (let i = currentSize; i < toNewSize; i++) {
      group[i] = new ArtLife(grid, color, bounceWalls, size, undefined, undefined, maxVelocity);
    }
    return;
  }

  static applyRule2Particles(partActing, partReceiving, force, minDist = 5, forcebelowMinDist = 0) {
    if (partActing == partReceiving) return;
    let dx = partActing.pos.x - partReceiving.pos.x;
    let dy = partActing.pos.y - partReceiving.pos.y;
    if (dx == 0 && dy == 0) return;
    if (!partReceiving.bounceWalls) {
      if (Math.abs(dx) > partReceiving.w / 2) {
        dx = (dx < 0) ? (dx + partReceiving.w) : (dx - partReceiving.w);
      }
      if (Math.abs(dy) > partReceiving.h / 2) {
        dy = (dy < 0) ? (dy + partReceiving.h) : (dy - partReceiving.h);
      }
    }

    let dist = (dx * dx + dy * dy);
    if (dist >= 1 && dist < 100000) {
      dist = Math.sqrt(dist);
      let f;
      if (dist < minDist) {
        f = forcebelowMinDist / dist;
      } else {
        f = (force / dist);
      }

      partReceiving.velocity.x += f * (dx / dist);
      partReceiving.velocity.y += f * (dy / dist);
    }
  }

  static applyRule2Groups(groupActing, groupReceiving, force, minDist, forcebelowMinDist) {
    groupActing.forEach(partActing => {
      groupReceiving.forEach(partReceiving => {
        this.applyRule2Particles(partActing, partReceiving, force, minDist, forcebelowMinDist);
      });
    });
  }

  static applyRandomVelocityToGroup(group, maxX, maxY) {
    group.forEach(e => e.applyRandomVelocity(maxX, maxY));
  }

  applyRandomVelocity(maxX, maxY) {
    if (maxY == undefined) maxY = maxX;
    this.velocity.x += (Math.random() * 2 - 1) * maxX;
    this.velocity.y += (Math.random() * 2 - 1) * maxY;
  }

  draw(grid = false) {
    if (grid) {
      this.grid = grid;
      this.w = grid.width;
      this.h = grid.height;
    }
    let pos = (Math.floor(this.pos.y) * this.w + Math.floor(this.pos.x)) * 4;
    for (let sx = 0; sx < this.size; sx++) {
      for (let sy = 0; sy < this.size; sy++) {
        pos = (Math.floor(this.pos.y + sy) * this.w + Math.floor(this.pos.x + sx)) * 4;
        this.grid.data[pos] = this.color[0];
        this.grid.data[pos + 1] = this.color[1];
        this.grid.data[pos + 2] = this.color[2];
        this.grid.data[pos + 3] = 255;
      }
    }
  }

  update(ts, draw = false, grid = false) {
    if (grid) {
      this.grid = grid;
      this.w = grid.width;
      this.h = grid.height;
    }
    ts = Math.min(1, ts / 1000);
    this.velocity.x = clamp(this.velocity.x, -this.maxVelocity, this.maxVelocity);
    this.velocity.y = clamp(this.velocity.y, -this.maxVelocity, this.maxVelocity);
    this.pos.x += this.velocity.x * ts;
    this.pos.y += this.velocity.y * ts;
    if (this.bounceWalls) {
      if (this.pos.x < this.size) {
        this.pos.x -= this.velocity.x * ts;
        this.velocity.x = Math.abs(this.velocity.x);
        this.pos.x += this.velocity.x * ts;
      } else if ((this.pos.x) > (this.w - this.size)) {
        this.pos.x -= this.velocity.x * ts;
        this.velocity.x = -Math.abs(this.velocity.x);
        this.pos.x += this.velocity.x * ts;
      }
      if (this.pos.y < this.size) {
        this.pos.y -= this.velocity.y * ts;
        this.velocity.y = Math.abs(this.velocity.y);
        this.pos.y += (this.velocity.y * ts);
      } else if ((this.pos.y) > (this.h - this.size)) {
        this.pos.y -= this.velocity.y * ts;
        this.velocity.y = -Math.abs(this.velocity.y);
        this.pos.y += (this.velocity.y * ts);
      }
    } else {
      if (this.pos.x < this.size) {
        this.pos.x += (this.w - this.size);
      } else if ((this.pos.x) > (this.w - this.size)) {
        this.pos.x -= (this.w - this.size);
      }
      if (this.pos.y < this.size) {
        this.pos.y += (this.h - this.size);
      } else if ((this.pos.y) > (this.h - this.size)) {
        this.pos.y -= (this.h - this.size);
      }
    }
    this.pos.x = clamp(this.pos.x, this.size, this.w - this.size);
    this.pos.y = clamp(this.pos.y, this.size, this.h - this.size);

    if (draw) this.draw();
  }

}

function randomInt(min, max) {
  if (max == undefined) {
    return parseInt(Math.random() * min);
  } else {
    return parseInt(min + Math.random() * (max - min));
  }
}

function clamp(value, min, max) {
  if (min > max) {
    [min, max] = [max, min];
  }
  return (value <= min) ? min : (value < max) ? value : max;
}