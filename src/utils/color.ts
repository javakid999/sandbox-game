export function HSV2RGB(h: number,s: number,v: number) 
{                              
    let f= (n:number,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
    return [f(5),f(3),f(1)];       
}   