import { Canvas } from "../api/canvas"
import { HSV2RGB } from "../utils/color"

export class Board {
    size: number[]
    particle: Particle[][] | null[][]

    constructor(width: number, height: number) {
        this.size = [width, height]
        this.particle = Array(height).fill(0).map(() => Array(width).fill(null))
        for(let i = 0; i < this.size[0]; i++) {
            this.particle[this.size[1]-1][i] = new Bedrock()
        }
    }

    render(canvas: Canvas) {
        canvas.gl.useProgram(canvas.program)
        canvas.gl.bindVertexArray(canvas.vao)

        const colors: number[] = []
        const positions: number[] = []
        const colorRandoms: number[] = []

        this.particle.forEach((row, i) => {
            row.forEach((particle, j) => {
                if (particle instanceof Water) {
                    colors.push(...particle.color.map((color) => (color+particle.salinity*200)/256))
                    positions.push(j/this.size[0]*2-1,(this.size[1]-i*2)/this.size[1])
                    colorRandoms.push(...particle?.colorRandom.map((color) => color/256))
                } else if (particle) {
                    colors.push(...particle.color.map((color) => color/256))
                    positions.push(j/this.size[0]*2-1,(this.size[1]-i*2)/this.size[1])
                    colorRandoms.push(...particle?.colorRandom.map((color) => color/256))
                } 
            })
        })

        const posBuffer = canvas.gl.createBuffer()
        canvas.gl.bindBuffer(canvas.gl.ARRAY_BUFFER, posBuffer);
        canvas.gl.bufferData(canvas.gl.ARRAY_BUFFER, new Float32Array(positions), canvas.gl.STATIC_DRAW)

        canvas.gl.enableVertexAttribArray(canvas.gl.getAttribLocation(canvas.program, 'pointPosition'))
        canvas.gl.vertexAttribPointer(canvas.gl.getAttribLocation(canvas.program, 'pointPosition'), 2, canvas.gl.FLOAT, false, 0, 0)

        const colorBuffer = canvas.gl.createBuffer()
        canvas.gl.bindBuffer(canvas.gl.ARRAY_BUFFER, colorBuffer);
        canvas.gl.bufferData(canvas.gl.ARRAY_BUFFER, new Float32Array(colors), canvas.gl.STATIC_DRAW)

        canvas.gl.enableVertexAttribArray(canvas.gl.getAttribLocation(canvas.program, 'pointColor'))
        canvas.gl.vertexAttribPointer(canvas.gl.getAttribLocation(canvas.program, 'pointColor'), 3, canvas.gl.FLOAT, false, 0, 0)

        const colorRandomBuffer = canvas.gl.createBuffer()
        canvas.gl.bindBuffer(canvas.gl.ARRAY_BUFFER, colorRandomBuffer);
        canvas.gl.bufferData(canvas.gl.ARRAY_BUFFER, new Float32Array(colorRandoms), canvas.gl.STATIC_DRAW)

        canvas.gl.enableVertexAttribArray(canvas.gl.getAttribLocation(canvas.program, 'pointColorRandom'))
        canvas.gl.vertexAttribPointer(canvas.gl.getAttribLocation(canvas.program, 'pointColorRandom'), 3, canvas.gl.FLOAT, false, 0, 0)

        canvas.gl.drawArrays(canvas.gl.POINTS, 0, positions.length/2)
    }

    checkNeighbors(x: number, y: number, particle: Particle) {
        const neighbors = [[false, false, false], [false, false, false], [false, false, false]]
        if (particle instanceof Solid) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (!(i == 0 && j == 0) && i+y > 0 && i+y < this.size[1]-1 && j+x > 0 && j+x < this.size[0]-1 && !(this.particle[y+i][x+j] instanceof Solid || this.particle[y+i][x+j] instanceof Block || this.particle[y+i][x+j] instanceof Fire)) {
                        neighbors[i+1][j+1] = true
                        if (this.particle[y+i][x+j] instanceof Liquid && particle.density <= this.particle[y+i][x+j]!.density) {
                            neighbors[i+1][j+1] = false
                        }
                    }
                }
            }
        } else if (particle instanceof Liquid) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (!(i == 0 && j == 0) && i+y > 0 && i+y < this.size[1]-1 && j+x > 0 && j+x < this.size[0]-1 && !(this.particle[y+i][x+j] instanceof Solid || this.particle[y+i][x+j] instanceof Block)) {
                        neighbors[i+1][j+1] = true
                        if (this.particle[y+i][x+j] instanceof Liquid && (particle.density <= this.particle[y+i][x+j]!.density)) {
                            neighbors[i+1][j+1] = false
                        }
                    }
                }
            }
        } else if (particle instanceof Block) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (!(i == 0 && j == 0) && i+y > 0 && i+y < this.size[1]-1 && j+x > 0 && j+x < this.size[0]-1 && !(this.particle[y+i][x+j] instanceof Solid || this.particle[y+i][x+j] instanceof Block)) {
                        neighbors[i+1][j+1] = true
                    }
                }
            }
        } else if (particle instanceof Gas) {
            if (particle instanceof Fire) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (!(i == 0 && j == 0) && i+y > 0 && i+y < this.size[1]-1 && j+x > 0 && j+x < this.size[0]-1 && this.particle[y+i][x+j]?.flammable) {
                            neighbors[i+1][j+1] = true
                        }
                    }
                }
            } else {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (!(i == 0 && j == 0) && i+y > 0 && i+y < this.size[1]-1 && j+x > 0 && j+x < this.size[0]-1 && !(this.particle[y+i][x+j] instanceof Solid || this.particle[y+i][x+j] instanceof Block || this.particle[y+i][x+j] instanceof Liquid)) {
                            neighbors[i+1][j+1] = true
                        }
                    }
                }
            }
        }
        return neighbors
    }

    update() {
        const newParticle = Array(this.size[1]).fill(0).map(() => Array(this.size[0]).fill(0))
        this.particle.forEach((row, i) => {
            row.forEach((block, j) => {
                this.particle[i][j] == null ? newParticle[i][j] = null : newParticle[i][j] = Object.assign(Object.create(Object.getPrototypeOf(block)), block);
            });
        });
        for (let i = 0; i < this.particle.length; i++) {
            for (let j = 0; j < this.particle[i].length; j++) {
                const neighbors = this.checkNeighbors(j, i, this.particle[i][j]!)
                if (this.particle[i][j] instanceof Liquid && Math.random() > this.particle[i][j]!.thickness) {
                    if (this.particle[i][j] instanceof Lava && this.particle[i+1][j] instanceof Stone) {
                        newParticle[i+1][j] = new Lava()
                    } else if (this.particle[i][j] instanceof Lava) {
                        if (this.particle[i+1][j] instanceof Water || this.particle[i][j-1] instanceof Water || this.particle[i][j+1] instanceof Water || this.particle[i-1][j] instanceof Water) {
                            newParticle[i][j] = new Stone();
                        } else if (this.particle[i+1][j]?.flammable || this.particle[i][j-1]?.flammable || this.particle[i][j+1]?.flammable || this.particle[i-1][j]?.flammable) {
                            newParticle[i][j] = new Fire();
                        }
                    } 

                    if (neighbors[2][1]) {
                        [newParticle[i+1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j]] 
                    } else if (neighbors[2][0] || neighbors[1][0] || neighbors[2][2] || neighbors[1][2]) {
                        const dir = Math.random()
                        if (dir < 0.5) {
                            if (neighbors[2][0]) {
                                [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                            } else if (neighbors[2][2]) {
                                [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j],  newParticle[i+1][j+1]]
                            } else if (neighbors[1][0]) {
                                [newParticle[i][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j-1]]
                            } else if (neighbors[1][2]) {
                                [newParticle[i][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j+1]]
                            }
                        } else {
                            if (neighbors[2][2]) {
                                [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j],  newParticle[i+1][j+1]]
                            } else if (neighbors[2][0]) {
                                [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                            }  else if (neighbors[1][2]) {
                                [newParticle[i][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j+1]]
                            } else if (neighbors[1][0]) {
                                [newParticle[i][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j-1]]
                            } 
                        }
                    }
                } else if (this.particle[i][j] instanceof Solid && Math.random() > this.particle[i][j]!.thickness) {
                    if (this.particle[i][j] instanceof Sand) {
                        if (neighbors[2][1]) {
                            [newParticle[i+1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j]]
                        } else if ((neighbors[2][0] && neighbors[1][0]) || (neighbors[2][2] && neighbors[1][2])) {
                            const dir = Math.random()
                            if (dir > 0.5) {
                                if (neighbors[2][2] && neighbors[1][2]) {
                                    [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j+1]]
                                } else if (neighbors[2][0] && neighbors[1][0]) {
                                    [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                                }
                            } else {
                                if (neighbors[2][0] && neighbors[1][0]) {
                                    [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                                } else if (neighbors[2][2] && neighbors[1][2]) {
                                    [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j+1]]
                                } 
                            } 
                        }
                    } else if (this.particle[i][j] instanceof Salt) {
                        if (newParticle[i-1][j] instanceof Water) {
                            newParticle[i][j] = null
                            newParticle[i-1][j].salinity += 0.1
                            newParticle[i-1][j].density += 0.05
                        } else if (newParticle[i][j-1] instanceof Water) {
                            newParticle[i][j] = null
                            newParticle[i][j-1].salinity += 0.1
                            newParticle[i][j-1].density += 0.05
                        } else if (newParticle[i][j+1] instanceof Water) {
                            newParticle[i][j] = null
                            newParticle[i][j+1].salinity += 0.1
                            newParticle[i][j+1].density += 0.05
                        } else if (neighbors[2][1]) {
                            if (newParticle[i+1][j] instanceof Water) {
                                [newParticle[i+1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j]]
                                newParticle[i+1][j] = null
                                newParticle[i][j].salinity += 0.1
                                newParticle[i][j].density += 0.05
                            } else {
                                [newParticle[i+1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j]]
                            }
                        }
                    } else if (this.particle[i][j] instanceof Seed) {
                        if (neighbors[2][1]) {
                            [newParticle[i+1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j]]
                            if (this.particle[i+1][j] instanceof Water) {
                                newParticle[i][j] = null
                                newParticle[i+1][j] = new Flower()
                                newParticle[i+1][j].energy = 1
                            }
                        } else if (neighbors[0][1]) {
                            if (this.particle[i-1][j] instanceof Water) {
                                newParticle[i-1][j] = null
                                newParticle[i][j] = new Flower()
                                newParticle[i][j].energy = 1
                            }
                        } else if ((neighbors[2][0] && neighbors[1][0]) || (neighbors[2][2] && neighbors[1][2])) {
                            const dir = Math.random()
                            if (dir > 0.5) {
                                if (neighbors[2][2] && neighbors[1][2]) {
                                    [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j+1]]
                                } else if (neighbors[2][0] && neighbors[1][0]) {
                                    [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                                }
                            } else {
                                if (neighbors[2][0] && neighbors[1][0]) {
                                    [newParticle[i+1][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j-1]]
                                } else if (neighbors[2][2] && neighbors[1][2]) {
                                    [newParticle[i+1][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i+1][j+1]]
                                }
                            }
                        }
                    }
                } else if (this.particle[i][j] instanceof Block) {
                    if (this.particle[i][j] instanceof Flower && (this.particle[i][j]! as Flower).energy > 0) {
                        const dir = Math.random()
                        if (dir < 0.25) {
                            if (neighbors[1][0]) {
                                [newParticle[i][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j-1]]
                                newParticle[i][j] = new Stem()
                                newParticle[i][j-1].energy -= 0.1
                            }
                        } else if (dir > 0.75) {
                            if (neighbors[1][2]) {
                                [newParticle[i][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j+1]]
                                newParticle[i][j] = new Stem()
                                newParticle[i][j+1].energy -= 0.1
                            }
                        } else {
                            if (neighbors[0][1]) {
                                [newParticle[i-1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i-1][j]]
                                newParticle[i][j] = new Stem()
                                newParticle[i-1][j].energy -= 0.1
                            }
                        }
                    } else if (this.particle[i][j] instanceof Stem) {
                        if (neighbors[2][1]) {
                            if (this.particle[i+1][j] instanceof Water) {
                                newParticle[i][j] = null
                                newParticle[i+1][j] = new Flower()
                                newParticle[i+1][j].energy = 1
                            }
                        } else if (neighbors[0][1]) {
                            if (this.particle[i-1][j] instanceof Water) {
                                newParticle[i-1][j] = null
                                newParticle[i][j] = new Flower()
                                newParticle[i][j].energy = 1
                            }
                        }
                    }
                } else if (this.particle[i][j] instanceof Gas) {
                    if (this.particle[i][j] instanceof Steam || this.particle[i][j] instanceof Smoke) {
                        (newParticle[i][j] as Gas).lifetime-- ;
                        if ((newParticle[i][j] as Gas).lifetime <= 0) {
                            newParticle[i][j] = null
                        } else {
                            const dir = Math.random();
                            if (dir < 0.33) {
                                if (neighbors[1][0]) {
                                    [newParticle[i][j-1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j-1]]
                                }
                            } else if (dir < 0.67) {
                                if (neighbors[1][2]) {
                                    [newParticle[i][j+1], newParticle[i][j]] = [newParticle[i][j], newParticle[i][j+1]]
                                }
                            } else {
                                if (neighbors[0][1]) {
                                    [newParticle[i-1][j], newParticle[i][j]] = [newParticle[i][j], newParticle[i-1][j]]
                                }
                            }
                        }
                    } else if (newParticle[i][j] instanceof Fire) {
                        if (neighbors[0][1]) {
                            if (Math.random() < 0.1) newParticle[i-1][j] = new Fire()
                        } else if (neighbors[2][1]) {
                            if (Math.random() < 0.1) newParticle[i+1][j] = new Fire()
                        } else if (neighbors[1][0]) {
                            if (Math.random() < 0.1) newParticle[i][j-1] = new Fire()
                        } else if (neighbors[1][2]) {
                            if (Math.random() < 0.1) newParticle[i][j+1] = new Fire()
                        } else {
                            (newParticle[i][j] as Gas).lifetime-- ;
                            if ((newParticle[i][j] as Gas).lifetime <= 0) {
                                newParticle[i][j] = new Smoke()
                            }
                        }
                    }
                }
            }
        }
        this.particle = newParticle
    }

    place(mousePos: number[], type: number) {
        const x = Math.floor(mousePos[0]/4)
        const y = Math.floor(mousePos[1]/4)
        if (x > 0 && x < this.size[0]-1 && 1 >= 0 && y < this.size[1]-1)
        switch (type) {
            case(8):
                this.particle[y][x] = new Fire()
                break;
            case(7):
                this.particle[y][x] = new Seed()
                break;
            case(6):
                this.particle[y][x] = new Lava()
                break;
            case(5):
                this.particle[y][x] = new Slime()
                break;
            case(4):
                this.particle[y][x] = new Water()
                break;
            case(3):
                this.particle[y][x] = new Stone()
                break;
            case(2):
                this.particle[y][x] = new Salt()
                break;
            case(1):
                this.particle[y][x] = new Sand()
                break;
            case(0):
                this.particle[y][x] = null
        }
        
    }
}

interface Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean;
}

abstract class Block {
    type: string
    constructor() {
        this.type = 'block'
    }
}

abstract class Solid {
    type: string
    constructor() {
        this.type = 'solid'
    }
}

abstract class Liquid {
    type: string
    constructor() {
        this.type = 'liquid'
    }
}

abstract class Gas {
    type: string
    lifetime: number
    constructor() {
        this.type = 'gas'
        this.lifetime = 0
    }
}

class Fire extends Gas implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    lifetime: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 1
        this.lifetime = 3
        this.thickness = 0
        this.color = [255,50,0]
        this.colorRandom = [-20,200,0]
    }
}

class Steam extends Gas implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    lifetime: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 1
        this.lifetime = 60
        this.thickness = 0
        this.color = [120,120,120]
        this.colorRandom = [-40,-40,-40]
    }
}

class Smoke extends Gas implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    lifetime: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 1
        this.lifetime = 60
        this.thickness = 0
        this.color = [50,50,50]
        this.colorRandom = [-40,-40,-40]
    }
}

class Sand extends Solid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean
    constructor() {
        super();
        this.flammable = true
        this.density = 1
        this.thickness = 0
        this.color = [220,200,10]
        this.colorRandom = [20,20,20]
    }
}

class Salt extends Solid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 0.6
        this.thickness = 0
        this.color = [220,220,220]
        this.colorRandom = [25,25,25]
    }
}

class Stone extends Block implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 1
        this.thickness = 1
        this.color = [100,100,100]
        this.colorRandom = [25,25,25]
    }
}

export class Bedrock extends Block implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.density = 1
        this.thickness = 1
        this.color = [50,50,50]
        this.colorRandom = [25,25,25]
    }
}

class Water extends Liquid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    salinity: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.salinity = 0
        this.density = 0.5
        this.thickness = 0.1
        this.color = [0,20,230]
        this.colorRandom = [0,3,5]
    }
}

class Slime extends Liquid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    salinity: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.salinity = 0
        this.density = 0.7
        this.thickness = 0.5
        this.color = [20,230,20]
        this.colorRandom = [50,-25,50]
    }
}

class Lava extends Liquid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    salinity: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = false
        this.salinity = 0
        this.density = 0.9
        this.thickness = 0.8
        this.color = [255,50,0]
        this.colorRandom = [-30,100,20]
    }
}

class Seed extends Solid implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    flammable: boolean
    constructor() {
        super();
        this.flammable = true
        this.density = 0.7
        this.thickness = 0.5
        this.color = [202, 204, 75]
        this.colorRandom = [25,25,25]
    }
}

class Stem extends Block implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    energy: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = true
        this.energy = 0
        this.density = 1
        this.thickness = 1
        this.color = [88, 219, 61]
        this.colorRandom = [50,-25,50]
    }
}

class Flower extends Block implements Particle {
    density: number
    thickness: number
    color: number[]
    colorRandom: number[]
    energy: number
    flammable: boolean
    constructor() {
        super();
        this.flammable = true
        this.energy = 0
        this.density = 1
        this.thickness = 1
        this.color = HSV2RGB(Math.random()*360, 1, 255)
        this.colorRandom = [-50,-50,-50]
    }
}