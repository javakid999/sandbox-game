
export class ParticleSystem {
    position: number[]
    size: number[]
    num: number
    color: string

    gravity: number
    bounds: number[]
    velocity: number[]
    startTime: number
    activated: boolean
    sprites: number[][]

    constructor(position: number[], size: number[], num: number, velocity: number[], color: string) {
        this.gravity = 0.001;
        this.position = position;
        this.color = color;
        this.size = size;
        //minx max miny maxy mina, maxa
        this.velocity = velocity;
        this.num = num;
        this.startTime = -1;
        this.activated = false;
        this.sprites = [];
        this.bounds = [0,0,800,600]

        for (let i = 0; i < this.num; i++) {
            this.sprites.push([this.position[0], this.position[1], this.velocity[0]+Math.random()*(this.velocity[1]-this.velocity[0]), this.velocity[2]+Math.random()*(this.velocity[3]-this.velocity[2]), 0, this.velocity[4]+Math.random()*(this.velocity[5]-this.velocity[4])]);
        }
    }
  
    activate() {
        if (this.activated) return;
        this.activated = true;
        this.startTime = performance.now();
    }
    
    update(deltaTime: number) {
    if (!this.activated) return;
    this.sprites.forEach((sprite) => {
        sprite[3] += this.gravity * deltaTime;
        sprite[0] += sprite[2] * deltaTime;
        sprite[1] += sprite[3] * deltaTime;
        sprite[4] += sprite[5] * deltaTime;
    });
    }
  
    render(ctx: CanvasRenderingContext2D) {
        if (this.activated) {
            ctx.fillStyle = this.color
            this.sprites.forEach((sprite, i) => {
                ctx.save()
                ctx.translate((sprite[0] * 2 + this.size[0])/2, (sprite[1] * 2 + this.size[1])/2);
                ctx.rotate(sprite[4]);
                ctx.fillRect(this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
                ctx.restore();
                if (sprite[0] > this.bounds[2] || sprite[0] < this.bounds[0]) this.sprites.splice(i, 1)
                if (sprite[1] > this.bounds[3] || sprite[1] < this.bounds[1]) this.sprites.splice(i, 1)
            });
        }
    }
  }