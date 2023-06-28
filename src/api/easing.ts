export class Easing {
    static linear(a: number, b: number, x: number) {return (1-x)*a+b*x}
    static cosine(a: number, b: number, x: number) {return (1 - (1-Math.cos(x*Math.PI))/2) * a + (1-Math.cos(x*Math.PI))/2 * b}
    static quadratic(a: number, b: number, x: number) {return(b-a)*(x*x)+a}
}