export class GameObject {
    position: number[]
    size: number[]
    image: HTMLImageElement
    angle: number

    constructor(position: number[], size: number[], angle: number, image: HTMLImageElement) {
        this.position = position
        this.size = size
        this.angle = angle
        this.image = image
    }
    
    render(ctx: CanvasRenderingContext2D, _frame?: number) {
        ctx.save()
        ctx.translate((this.position[0] * 2 + this.size[0])/2, (this.position[1] * 2 + this.size[1])/2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
        ctx.restore();
    }

    update(_deltaTime: number) { } 
}

export class GameObjectAnimated extends GameObject {
    image: HTMLImageElement
    imageSize: number[]

    constructor(position: number[], size: number[], angle: number, image: HTMLImageElement, imageSize: number[]) {
        super(position, size, angle, image);
        this.image = image
        this.imageSize = imageSize
    }

    render(ctx: CanvasRenderingContext2D, frame: number) {
        ctx.save()
        ctx.translate((this.position[0] * 2 + this.size[0])/2, (this.position[1] * 2 + this.size[1])/2);
        ctx.rotate(this.angle);
        const numImagesHoriz = this.image.width/this.imageSize[0]
        const numImagesVert = this.image.height/this.imageSize[1]
        ctx.drawImage(this.image, (frame%numImagesHoriz)*this.imageSize[0], (Math.floor(frame/numImagesHoriz)%numImagesVert)*this.imageSize[1], this.imageSize[0], this.imageSize[1], this.size[0]/-2, this.size[1]/-2, this.size[0], this.size[1]);
        ctx.restore();
    }

    update(_deltaTime: number) { } 
}

export class ScrollingBackground {
    position: number[]
    size: number[]
    speed: number
    image: HTMLImageElement

    constructor(position: number[], size: number[], speed: number, image: HTMLImageElement) {
        this.position = position
        this.size = size
        this.speed = speed
        this.image = image
    }

    render(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < Math.ceil(800/this.size[0])+1; i++) {
            const numImages = (Math.ceil(800/this.size[0])+1)*this.size[0];
            ctx.drawImage(this.image, (((this.position[0]+this.size[0]*i) % numImages) + numImages) % numImages - this.size[0], this.position[1], this.size[0], this.size[1]);
        }
    }

    update(deltaTime: number) {
        this.position[0] += this.speed*deltaTime
    }
}