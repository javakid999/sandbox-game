import { Canvas } from "./canvas";
import { InputManager } from "./inputmanager";

export abstract class Scene {
    timeActive: number

    constructor() {
        this.timeActive = 0
    }

    reset() {}

    activate() {}

    render(_canvas: Canvas) {
        
    }

    update(deltaTime: number) {
        this.timeActive += deltaTime
    }

    updateInput(_inputManager: InputManager) { }
}

