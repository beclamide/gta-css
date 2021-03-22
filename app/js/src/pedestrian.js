class Pedestrian {
    constructor(engine) {
      this.engine = engine;
      this.element = document.createElement('pedestrian');
      this.object = new THREE.CSS3DObject(this.element);
      this.object.rotation.x = Math.PI / 180 * -180;
      this.object.position.z = -3;
      this.spawn();
      this.lerp = 0;
    }
  
    spawn() {
      let node;
  
      while (!node) {
        let rX = ~~(Math.random() * this.engine.map.length);
        let rY = ~~(Math.random() * this.engine.map[0].length);
        if (this.engine.graph.grid[rX][rY].weight == 1) {
          node = {
            x: rX,
            y: rY
          }
        }
      }
  
      this.setPosition(node.x * 100, node.y * 100);
      this.getRoute(node.x, node.y)
    }

    getRoute(startX, startY) {
      let nextNode;
  
      while (!nextNode) {
        let rX = ~~(Math.random() * this.engine.map.length);
        let rY = ~~(Math.random() * this.engine.map[0].length);
        if (this.engine.graph.grid[rX][rY].weight == 1) {
          nextNode = {
            x: rX,
            y: rY
          }
        }
      }
  
      this.route = astar.search(this.engine.graph, this.engine.graph.grid[startX][startY], this.engine.graph.grid[nextNode.x][nextNode.y]);
      this.step = 0;
      this.speed = Math.random() / 100 + 0.01;
      if (this.route.length == 0) {
        this.getRoute(startX, startY)
      }
      this.setTarget(this.route[0].x, this.route[0].y);
    }
  
    setPosition(gridx, gridy) {
      this.object.position.x = gridy;
      this.object.position.y = gridx;
    }
  
    setRotation(deg) {
      this.object.rotation.z = deg;
    }
  
    setTarget(x, y) {
      this.startPosition = {
        x: this.object.position.y,
        y: this.object.position.x
      }
  
      let xoffset = ~~(Math.random() * 50) - 25;
      let yoffset = ~~(Math.random() * 50) - 25;
      this.targetPosition = {
        x: x * 100 + xoffset,
        y: y * 100 + yoffset
      }
  
    }
  
    checkCollision(collider) {
      let x1 = this.object.position.x - 20;
      let x2 = this.object.position.x + 20;
      let y1 = this.object.position.y - 20;
      let y2 = this.object.position.y + 20;
      if ((x1 <= collider.object.position.x) && (collider.object.position.x <= x2) &&
        (y1 <= collider.object.position.y) && (collider.object.position.y <= y2)) {
  
          document.dispatchEvent(new CustomEvent('ped_dead', {
            detail: {
              x: this.object.position.x,
              y: this.object.position.y,
              rot: this.object.rotation.z
            }
          }));
  
        this.spawn();
      }
    }
  
    tick() {
      if (this.dead) return;
  
      this.lerp += this.speed;
      const y = this.startPosition.y + (this.targetPosition.y - this.startPosition.y) * this.lerp;
      const x = this.startPosition.x + (this.targetPosition.x - this.startPosition.x) * this.lerp;
      this.setPosition(x, y);
  
      // angle
      const rot = Math.atan2(this.targetPosition.x - this.startPosition.x, this.startPosition.y - this.targetPosition.y);
      this.setRotation(rot + (Math.PI / 180 * 90));
  
      if (this.lerp >= 1) {
        this.lerp = 0;
        this.step++;
  
        if (this.step >= this.route.length) {
          this.getRoute(this.route[this.route.length - 1].x, this.route[this.route.length - 1].y);
        } else {
          this.setTarget(this.route[this.step].x, this.route[this.step].y);
        }
      }
    }
  }
  
  export default Pedestrian;
  