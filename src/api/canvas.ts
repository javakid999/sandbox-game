import { GameScene } from "../scenes/gamescene";
import { InputManager } from "./inputmanager";
import { Scene } from "./scene";
import vsrc from '../shaders/vertex.glsl?raw'
import fsrc from '../shaders/fragment.glsl?raw'

export class Canvas {
    assets: {[index: string]: HTMLImageElement}
    element: HTMLCanvasElement;
    scenes: {[index: string]: Scene}
    activeScene: string

    gl: WebGL2RenderingContext
    program: WebGLProgram
    vao: WebGLVertexArrayObject | null

    constructor(dimensions: number[], assets: {[index: string]: HTMLImageElement}) {
        this.assets = assets;
        this.element = document.createElement('canvas') as HTMLCanvasElement;

        this.element.width = dimensions[0]
        this.element.height = dimensions[1]
        this.element.id = 'game-canvas';
        this.gl = this.element.getContext('webgl2')!;
        document.getElementById('game')!.appendChild(this.element);
        this.element.appendChild
        
        this.load()

        this.scenes = {}
        this.activeScene = 'game'

        this.program = this.createProgram(this.gl, vsrc, fsrc)!;
        this.gl.viewport(0,0,this.element.width,this.element.height)
        this.vao = this.gl.createVertexArray()
        this.gl.bindVertexArray(this.vao)
    }

    reset() {
        localStorage.clear()
    }

    save() {
        // save localstorage things
    }

    load() {
        // load localstorage things
    }

    initScenes() {
        this.scenes['game'] = new GameScene(this, this.assets)
    }

    createShader(gl: WebGL2RenderingContext, type: number, source: string) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        
        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    createProgram(gl: WebGL2RenderingContext, vsrc: string, fsrc: string) {
        const program = gl.createProgram()!;
        const vertex = this.createShader(gl, gl.VERTEX_SHADER, vsrc)!;
        const fragment = this.createShader(gl, gl.FRAGMENT_SHADER, fsrc)!;
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    render() {
        this.gl.clearColor(0,0,0,1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        switch(this.activeScene) {
            case('game'):
                this.scenes['game'].render(this);
                break;
        }
    }

    update(inputManager: InputManager, deltaTime: number) {
        switch(this.activeScene) {
            case('game'):
                this.scenes['game'].updateInput(inputManager);
                this.scenes['game'].update(deltaTime)
                break;
        }
    }
}