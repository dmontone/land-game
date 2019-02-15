import { Map } from './map'

export class Game {
    
    constructor(element){

        this.$ = element
        this.atlas = new Map({
            dim: { w: 100, h: 100 },
            tileDim: { w: 6, h: 6 }
        })



        // this.canvas = this._genCanvas(document.body)
        // this.ctx = this.canvas.getContext('2d')

        // this.atlas = new Map({
        //     type: 'atlas',
        //     dimensions: { width: 100, height: 100 },
        //     tileDimensions: { width: 5, height: 5 }
        // }, this.canvas, this.ctx)

    }

}