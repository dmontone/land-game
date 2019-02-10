import { Map } from './map'

export class Game {
    
    constructor(){

        this.canvas = this.generateCanvas(document.body)
        this.ctx = this.canvas.getContext('2d')

        this.worldDimensions = { width: 100, height: 100 }

        this.atlas = new Map({
            type: 'atlas',
            dimensions: this.worldDimensions
        }, this.canvas, this.ctx)
        
        this.canvas.onclick = e => {
            const tileX = Math.round( e.clientX / 6 ),
                  tileY = Math.round( e.clientY / 6 )
            this.atlas._tile(tileX, tileY).onClick(e)
        }

    }

    generateCanvas(parent){
        const wrapper = document.createElement('div')
        wrapper.id = 'wrapper'
        const canvas = document.createElement('canvas')
        canvas.width = 600
        canvas.height = 600
        wrapper.appendChild(canvas)
        parent.appendChild(wrapper)
        return canvas
    }

}