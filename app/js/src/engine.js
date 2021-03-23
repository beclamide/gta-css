import Pedestrian from './pedestrian.js';
import Car from './car';
import { mobileAndTabletCheck } from './utils';

class Engine {

  constructor() {
    this.keysdown = [];
    this.touches = [];
    this.touchGas;
    this.touchSteering;
    this.score = 0;

    this.cameraCatchup = .1;
    this.isMobile = mobileAndTabletCheck();

    this.map = [
      'wwwwwwwwwwwwwwwwwwwwww',
      'wwwwwwwwwwwwwwwwwwwwww',
      'wwwww-----wwwwwwwwwwww',
      'wwwww-----wwwwwwwwwwww',
      'wwwww-----xxxxxxxxxxxw',
      'wwwwwwww--x---------xw',
      'wwxxxxxx--x-rrrrrrr-xw',
      'wwx-------x-rrrrrrr-xw',
      'wwx-x--rr---rr---rr-xw',
      'wwx-x-rrrrrrrr-x-rr-xw',
      'wwx---rrrrrrrr-x-rr-xw',
      'wwxgg-rr----rr-x-rr-xw',
      'wwxgg-rr-xx-rr-x-rr-xw',
      'wwxgg----xx-rr---rr-xw',
      'wwxgg-------rrrrrrr-xw',
      'wwxxxx------rrrrrrr-xw',
      'wwwwxxxxxxx-rr---rr-xw',
      'wwwwwwwwwxx-rr-x-rr-xw',
      'wwwwwwwwwxx-rr-x-rr-xw',
      'wwwwwwwwwxx-rr-x-rr-xw',
      'wwwwwwwwwxx---------xw',
      'wwwwwwwwwxxxxxxxxxxxxw',
      'wwwwwwwwwwwwwwwwwwwwww',
    ];
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 10000);
    this.camera.up.set(0, -1, 0);
    this.camera.position.x = 500;
    this.camera.position.y = 500;
    this.camera.position.z = -600;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.CSS3DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(this.renderer.domElement);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.map[0].length * 100;
    this.canvas.height = this.map.length * 100;
    this.ctx = this.canvas.getContext('2d');
    let c = new THREE.CSS3DObject(this.canvas);
    c.position.x = ~~((this.map[0].length * 100) / 2) - 50;
    c.position.y = ~~((this.map.length * 100) / 2) - 50;
    c.position.z = -1;
    c.rotation.x = 180 * (Math.PI / 180)
    this.scene.add(c);

    this.bloodsprites = new Image();
    this.bloodsprites.src = 'images/blood.png';

    if (this.isMobile) {
      document.getElementById('mobileControls').classList.add('visible');
    }

    this.addEvents();

    this.generateMap();

    this.addCar();

    this.generatePeds();

    this.render();
  }

  addEvents() {
    document.addEventListener('keydown', e => this.keysdown.push(e.code));

    document.addEventListener('keyup', e => {
      let index;
      do {
        index = this.keysdown.indexOf(e.code);
        if (index > -1) {
          this.keysdown.splice(index, 1);
        }
      } while (index > -1)
    });

    const gasController = document.getElementById('gasController');
    gasController.addEventListener('touchstart', e => {
      e.preventDefault();
      this.touchGas = this.copyTouch(e.changedTouches[0]);
    });
    gasController.addEventListener('touchmove', e => {
      e.preventDefault();
      this.touchGas = this.copyTouch(e.changedTouches[0]);
    });
    gasController.addEventListener('touchend', () => this.touchGas = null);
    gasController.addEventListener('touchcancel', () => this.touchGas = null);

    const steeringController = document.getElementById('steeringController');
    steeringController.addEventListener('touchstart', e => {
      e.preventDefault();
      this.touchSteering = this.copyTouch(e.changedTouches[0]);
    });
    steeringController.addEventListener('touchmove', e => {
      e.preventDefault();
      this.touchSteering = this.copyTouch(e.changedTouches[0]);
    });
    steeringController.addEventListener('touchend', () => this.touchSteering = null);
    steeringController.addEventListener('touchcancel', () => this.touchSteering = null);

    document.addEventListener('ped_dead', e => {
      this.car.bloodtyres = 128;
      this.ctx.globalAlpha = 1;
      this.ctx.save();
      this.ctx.translate(e.detail.x + 50, e.detail.y + 50);
      this.ctx.rotate(this.car.object.rotation.z);
      this.ctx.translate(-64, -32);
      this.ctx.scale(1 + (Math.abs(this.car.speed) * .25), 1);
      this.ctx.drawImage(this.bloodsprites, 64 * Math.floor(Math.random() * 4), 0, 64, 64, 0, 0, 64, 64);
      this.ctx.restore();

      this.score += 100;
      document.getElementById('currentScore').innerText = `$${this.score}`;
    })

    window.addEventListener('resize', () => this.renderer.setSize(window.innerWidth, window.innerHeight));
    window.addEventListener('orientationchange', () => this.renderer.setSize(window.innerWidth, window.innerHeight));
  }

  copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
  }

  ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < this.touches.length; i++) {
      var id = this.touches[i].identifier;
  
      if (id == idToFind) {
        return i;
      }
    }
    return -1;
  }

  generateMap() {
    let graph = [];

    for (let i in this.map) {

      graph.push([]);

      for (let v in this.map[i]) {

        let cellWeight = 100;

        if (this.map[i][v] == '-') {
          cellWeight = 1;
        } else if (this.map[i][v] == 'r') {
          cellWeight = 3;
        }

        let building;

        if (this.map[i][v] == 'x') {

          //place building
          let bdiv = document.createElement('building');
          building = new THREE.CSS3DObject(bdiv);

          let topdiv = document.createElement('div');
          topdiv.className = 'top';
          let top = new THREE.CSS3DObject(topdiv);
          top.position.z = -200;
          top.rotation.x = 180 * Math.PI / 180;

          let rightdiv = document.createElement('div');
          rightdiv.className = 'right';
          let right = new THREE.CSS3DObject(rightdiv);
          right.position.x = 50;
          right.position.z = -100;
          right.rotation.x = -90 * Math.PI / 180;
          right.rotation.y = 90 * Math.PI / 180;

          let leftdiv = document.createElement('div');
          leftdiv.className = 'left';
          let left = new THREE.CSS3DObject(leftdiv);
          left.position.x = -50;
          left.position.z = -100;
          left.rotation.x = -90 * Math.PI / 180;
          left.rotation.y = -90 * Math.PI / 180;

          let frontdiv = document.createElement('div');
          frontdiv.className = 'front';
          let front = new THREE.CSS3DObject(frontdiv);
          front.position.y = 50;
          front.position.z = -100;
          front.rotation.x = -90 * Math.PI / 180;

          let backdiv = document.createElement('div');
          backdiv.className = 'back';
          let back = new THREE.CSS3DObject(backdiv);
          back.position.y = -50;
          back.position.z = -100;
          back.rotation.y = -180 * Math.PI / 180;
          back.rotation.x = -90 * Math.PI / 180;

          building.add(top).add(right).add(left).add(front).add(back);

        } else {

          let bdiv = document.createElement('building');
          building = new THREE.CSS3DObject(bdiv);

          let bottomdiv = document.createElement('div');
          bottomdiv.className = 'bottom ' + this.map[i][v];

          // calculate shading
          if (i > 0 && v > 0 && this.map[i][v] != 'w') {
            if (this.map[i - 1][v - 1] != 'x') {
              if (this.map[i][v - 1] == 'x') {
                bottomdiv.className += ' shade sw';
              } else if (this.map[i - 1][v] == 'x') {
                bottomdiv.className += ' shade ne';
              }
            } else {
              bottomdiv.className += ' shade full';
            }
          }

          let bottom = new THREE.CSS3DObject(bottomdiv);
          bottom.rotation.x = 180 * Math.PI / 180;
          bottom.position.z = 0;
          building.add(bottom);
        }

        building.position.x = v * 100;
        building.position.y = i * 100;
        building.position.z = 0;
        this.scene.add(building);

        graph[graph.length - 1].push(cellWeight);

      }
    }

    this.graph = new Graph(graph);
  }

  addCar() {
    this.car = new Car(this);
  }

  generatePeds() {
    this.peds = [];

    for (let i = 0; i < 20; i++) {
      this.peds.push(new Pedestrian(this));
      this.scene.add(this.peds[i].object);
    }
  }

  update() {
    this.updateCar();
    this.updatePedestrians();
    this.updateCamera();
  }

  updateCar() {
    if (!this.car) return;

    this.car.tick();
  }

  updatePedestrians() {
    if (!this.peds) return;

    this.peds.forEach(ped => {
      ped.tick();
      ped.checkCollision(this.car);
    });
  }

  updateCamera() {
    this.camera.position.x -= (this.camera.position.x - this.car.object.position.x) * this.cameraCatchup;
    this.camera.position.y -= (this.camera.position.y - this.car.object.position.y) * this.cameraCatchup;
    this.camera.position.z -= (this.camera.position.z + 500 + Math.abs(this.car.speed * 15)) * this.cameraCatchup;

    this.camera.lookAt(new THREE.Vector3(this.car.object.position.x, this.car.object.position.y, 0));
  }

  render() {
    this.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.render());
  }
}

export default Engine;