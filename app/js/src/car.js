class Car {
  constructor(engine) {
    this.engine = engine;

    this.maxspeed = 10;
    this.acceleration = 0.2;
    this.deceleration = 0.9;
    this.maxsteering = 0.01;
    this.steeringdelta = 0.0008;
    this.straightendelta = .9;

    this.speed = 0;
    this.angle = 0;
    this.steering = 0;
    this.bloodtyres = 0;

    let cardiv = document.createElement('car');
    let body = new THREE.CSS3DObject(cardiv);
    body.rotation.x = 180 * (Math.PI / 180);
    body.rotation.z = 180 * (Math.PI / 180);

    let frontLeftWheel = document.createElement('wheel');
    let fl = new THREE.CSS3DObject(frontLeftWheel);
    fl.rotation.z = 90 * (Math.PI / 180);
    fl.position.x = 20;
    fl.position.y = -15;
    fl.position.z = 1;
    fl.rotation.x = 180 * (Math.PI / 180);

    let frontRightWheel = document.createElement('wheel');
    let fr = new THREE.CSS3DObject(frontRightWheel);
    fr.rotation.z = 90 * (Math.PI / 180);
    fr.position.x = 20;
    fr.position.y = 15;
    fr.position.z = 1;
    fr.rotation.x = 180 * (Math.PI / 180);

    let rearLeftWheel = document.createElement('wheel');
    let rl = new THREE.CSS3DObject(rearLeftWheel);
    rl.rotation.z = 90 * (Math.PI / 180);
    rl.position.x = -20;
    rl.position.y = -15;
    rl.position.z = 1;
    rl.rotation.x = 180 * (Math.PI / 180);

    let rearRightWheel = document.createElement('wheel');
    let rr = new THREE.CSS3DObject(rearRightWheel);
    rr.rotation.z = 90 * (Math.PI / 180);
    rr.position.x = -20;
    rr.position.y = 15;
    rr.position.z = 1;
    rr.rotation.x = 180 * (Math.PI / 180);

    let carwrapper = document.createElement('div');
    this.object = new THREE.CSS3DObject(carwrapper);
    this.object.add(fl).add(fr).add(rl).add(rr).add(body);
    this.object.position.x = 700;
    this.object.position.y = 800;
    this.object.position.z = -5;
    this.engine.scene.add(this.object);
  }

  checkCollision() {
    let rot = this.object.rotation.z;
    let col = false;

    let f = {
      x: this.object.position.x + (30 * Math.cos(rot)) - (Math.sin(rot)),
      y: this.object.position.y + (30 * Math.sin(rot)) + (Math.cos(rot))
    }

    let r = {
      x: this.object.position.x + (-30 * Math.cos(rot)) - (Math.sin(rot)),
      y: this.object.position.y + (-30 * Math.sin(rot)) + (Math.cos(rot))
    }

    let fx = ~~((f.x + 50) / 100);
    let fy = ~~((f.y + 50) / 100);
    let rx = ~~((r.x + 50) / 100);
    let ry = ~~((r.y + 50) / 100);

    if (fx < 0 || fy < 0) return;
    if (rx < 0 || ry < 0) return;
    if (fy > this.engine.map.length) return;
    if (ry > this.engine.map.length) return;
    if (fx > this.engine.map[fy].length) return;
    if (rx > this.engine.map[ry].length) return;

    if (this.engine.map[fy][fx] == 'x') {
      this.speed = -this.speed * .5;
      return true;
    }

    if (this.engine.map[ry][rx] == 'x') {
      this.speed = -this.speed * .5;
      return true;
    }

    return col;
  }

  updateSkidmarks() {
    let rot = this.object.rotation.z;
    let ox = this.object.position.x;
    let oy = (this.object.position.y);
    let px = this.object.position.x - 25;
    let py = (this.object.position.y) + 15;
    let l = {
      x: Math.cos(rot) * (px - ox) - Math.sin(rot) * (py - oy) + ox,
      y: Math.sin(rot) * (px - ox) + Math.cos(rot) * (py - oy) + oy
    }

    py = (this.object.position.y) - 15;
    let r = {
      x: Math.cos(rot) * (px - ox) - Math.sin(rot) * (py - oy) + ox,
      y: Math.sin(rot) * (px - ox) + Math.cos(rot) * (py - oy) + oy
    }

    if (this.bloodtyres > 0) {
      this.bloodtyres -= 4;
    } else {
      this.bloodtyres = 0;
    }

    let a = ((this.maxspeed - Math.abs(this.speed)) / this.maxspeed) + (Math.abs(this.steering * 5));
    a += this.bloodtyres / 128;
    this.engine.ctx.globalAlpha = Math.min(a, .25);
    this.engine.ctx.strokeStyle = `rgba(${this.bloodtyres}, 0, 0, 1)`;

    if (this.prevmark) {
      this.engine.ctx.lineWidth = 3;
      this.engine.ctx.setLineDash([16 / this.speed, 8 / this.speed]);

      this.engine.ctx.beginPath();
      this.engine.ctx.moveTo(this.prevmark.l.x + 50, this.prevmark.l.y + 50);
      this.engine.ctx.lineTo(l.x + 50, l.y + 50);

      this.engine.ctx.moveTo(this.prevmark.r.x + 50, this.prevmark.r.y + 50);
      this.engine.ctx.lineTo(r.x + 50, r.y + 50);
      this.engine.ctx.stroke();
    }

    this.prevmark = {
      l: l,
      r: r
    }
  }

  tick() {
    let prev = {
      x: this.object.position.x,
      y: this.object.position.y,
      rot: this.object.rotation.z
    }

    // steering
    if (this.engine.keysdown.indexOf('ArrowRight') != -1) {
      this.steering -= (this.steering > -this.maxsteering) ? this.steeringdelta : 0;
    } else if (this.engine.keysdown.indexOf('ArrowLeft') != -1) {
      this.steering += (this.steering < this.maxsteering) ? this.steeringdelta : 0;
    } else {
      this.steering *= this.straightendelta;
    }

    // gas
    if (this.engine.keysdown.indexOf('ArrowUp') != -1) {
      this.speed += (this.speed < this.maxspeed) ? this.acceleration: 0;
    } else if (this.engine.keysdown.indexOf('ArrowDown') != -1) { // reverse
      this.speed -= (this.speed > -this.maxspeed / 2) ? this.acceleration : 0;
    } else {
      this.speed *= this.deceleration;
    }

    this.angle += this.steering * this.speed;

    let xdir = this.speed * Math.cos(this.angle);
    let ydir = this.speed * Math.sin(this.angle);

    this.object.position.x += xdir;
    this.object.position.y += -ydir;
    this.object.rotation.z = -this.angle;

    this.object.children[0].rotation.z = this.object.children[1].rotation.z = (90 + (this.steering * 2e3)) * (Math.PI / 180);

    if (this.checkCollision()) {
      this.object.position.x = prev.x;
      this.object.position.y = prev.y;
      this.object.rotation.z = prev.rot;
    };

    this.updateSkidmarks();
  }
}

export default Car;