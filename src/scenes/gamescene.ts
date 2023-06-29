import { Canvas } from "../api/canvas";
import { InputManager } from "../api/inputmanager";
import { Scene } from "../api/scene";
import { Bedrock, Board } from "../game/board";

export class GameScene extends Scene {
    assets: {[index: string]: HTMLImageElement}
    canvas: Canvas
    board: Board;
    selectedParticle: number

    constructor(canvas: Canvas, assets: {[index: string]: HTMLImageElement}) {
        super();

        this.selectedParticle = 1

        document.getElementById('game')?.appendChild(document.createElement('br'))

        let button = document.createElement('button')
        button.textContent = 'CLEAR'
        button.onclick = () => {
            this.board.particle = Array(this.board.size[1]).fill(0).map(() => Array(this.board.size[0]).fill(null))
            for(let i = 0; i < this.board.size[0]; i++) {
                this.board.particle[this.board.size[1]-1][i] = new Bedrock()
            }
        }
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'SAND'
        button.onclick = () => {this.selectedParticle = 1}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'SALT'
        button.onclick = () => {this.selectedParticle = 2}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'STONE'
        button.onclick = () => {this.selectedParticle = 3}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'WATER'
        button.onclick = () => {this.selectedParticle = 4}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'SLIME'
        button.onclick = () => {this.selectedParticle = 5}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'LAVA'
        button.onclick = () => {this.selectedParticle = 6}
        document.getElementById('game')?.appendChild(button)

        button = document.createElement('button')
        button.textContent = 'SEED'
        button.onclick = () => {this.selectedParticle = 7}
        document.getElementById('game')?.appendChild(button)

        document.getElementById('game')?.appendChild(document.createElement('br'))

        button = document.createElement('button')
        button.textContent = 'FIRE'
        button.onclick = () => {this.selectedParticle = 8}
        document.getElementById('game')?.appendChild(button)

        this.canvas = canvas
        this.board = new Board(200,150);
        this.assets = assets
    }

    

    render(canvas: Canvas) {
        this.board.render(canvas) 
    }

    update(deltaTime: number) {
        super.update(deltaTime)
        this.board.update()
    }

    updateInput(inputManager: InputManager) {
        if (inputManager.leftClicking) {
            this.board.place(inputManager.mousePos, this.selectedParticle)
        } else if (inputManager.rightClicking) {
            this.board.place(inputManager.mousePos, 0)
        }

        super.updateInput(inputManager);
    }
}