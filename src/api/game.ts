import { Canvas } from "./canvas"
import { InputManager } from "./inputmanager"

export class Game {
    assets:{[index: string]: HTMLImageElement}
    inputManager: InputManager
    canvas: Canvas
    lastTime: number

    constructor(assets: {[index: string]: HTMLImageElement}) {
        this.assets = assets 
        this.canvas = new Canvas([800,600], this.assets)
        this.inputManager = new InputManager(this.canvas.element)
        this.lastTime = 0
    }

    start() {
        
        this.canvas.initScenes();

        this.update()
    }

    update() {
        const deltaTime = performance.now()-this.lastTime
        this.canvas.render()
        this.canvas.update(this.inputManager, deltaTime)

        this.inputManager.updateInput()
        this.lastTime = performance.now()
        window.requestAnimationFrame(this.update.bind(this))
    }
}