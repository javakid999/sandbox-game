import { GameObject } from "./object"

export class Trigger {
    position: number[]
    size: number[]
    type: string
    triggered: boolean
    colliding: boolean

    constructor(position: number[], size: number[], type: string) {
        this.position = position
        this.size = size
        this.type = type
        this.triggered = false
        this.colliding = false
    }
    // TRIGGER TYPES
    // toggle
    // once
    // continuous

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.triggered ? 'green' : 'red'
        ctx.fillRect(this.position[0], this.position[1], this.size[0], this.size[1])
    }

    collideObject(object: GameObject) {
        if (this.position[0] < object.position[0]+object.size[0] && this.position[0]+this.size[0] > object.position[0] && this.position[1] < object.position[1]+object.size[1] && this.position[1]+this.size[1] > object.position[1]) {
            switch(this.type) {
                case('toggle'):
                    if (!this.colliding) this.triggered = !this.triggered
                    break;
                case('continuous'):
                    this.triggered = true
                    break;
                case('once'):
                    if (!this.colliding && !this.triggered) {
                        this.triggered = true
                    } else {
                        this.triggered = false
                    }
            }
            this.colliding = true
        } else {
            if (this.type != 'once') this.colliding = false
            if (this.type != 'toggle') this.triggered = false
        }
    }

    collideMouse(position: number[]) {
        if (this.position[0] < position[0] && this.position[0]+this.size[0] > position[0] && this.position[1] < position[1] && this.position[1]+this.size[1] > position[1]) {
            switch(this.type) {
                case('toggle'):
                    if (!this.colliding) this.triggered = !this.triggered
                    break;
                case('continuous'):
                    this.triggered = true
                    break;
                case('once'):
                    if (!this.colliding && !this.triggered) {
                        this.triggered = true
                    } else {
                        this.triggered = false
                    }
            }
            this.colliding = true
        } else {
            if (this.type != 'once') this.colliding = false
            if (this.type != 'toggle') this.triggered = false
        }
    }
}