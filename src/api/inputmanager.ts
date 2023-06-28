export class InputManager {
    keys: {[index: string]: boolean}
    mousePos: number[]
    mouseSensitivity: number
    leftClicked: boolean
    rightClicked: boolean
    leftClicking: boolean
    rightClicking: boolean
    constructor(canvas: HTMLCanvasElement) {     
        canvas.addEventListener('mousemove', this.mousemoveListener.bind(this));
        canvas.addEventListener('keydown', this.keydownListener.bind(this));
        canvas.addEventListener('keyup', this.keyupListener.bind(this));
        canvas.addEventListener('mousedown', this.mousedownListener.bind(this));
        canvas.addEventListener('mouseup', this.mouseupListener.bind(this));
        canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault())
        this.leftClicking = false
        this.rightClicking = false
        this.keys = {}
        this.mousePos = [0,0]
        this.mouseSensitivity = 0.002
        this.leftClicked = false
        this.rightClicked = false
    }

    mousemoveListener(e: MouseEvent) {
        this.mousePos = [e.offsetX, e.offsetY]
    }

    keydownListener(e: KeyboardEvent) {
        switch (e.key) {
            case (' '):
                if (!e.repeat) {
                    this.keys[' '] = true;
                }
                break;
        }
    }

    keyupListener(_e: KeyboardEvent) {

    }

    mousedownListener(e: MouseEvent) {
        e.preventDefault()
        if (e.button == 0) { this.leftClicking = true }
        if (e.button == 2) { this.rightClicking = true }
    }

    mouseupListener(e: MouseEvent) {
        if (e.button == 0) {this.leftClicked = true}
        if (e.button == 2) {this.rightClicked = true}
        if (e.button == 0) { this.leftClicking = false }
        if (e.button == 2) { this.rightClicking = false }
    }

    updateInput() {
        this.leftClicked = false
        this.rightClicked = false
        this.keys[' '] = false;
    }
}