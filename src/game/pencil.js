export class Pencil {

    constructor(ctx){
        this.ctx = ctx
        this.width = 6
        this.height = 6
    }

    tile(tile){

        const Rect = function(cb){
            this.ctx.beginPath()
            this.ctx.rect( (tile.x - 1) * this.width, (tile.y - 1) * this.height, this.width, this.height )
            cb()
            this.ctx.fill()
        }.bind(this)
        
        // base color
        Rect(() => {
            this.ctx.fillStyle = tile.bin === 1 ? 'white' : 'blue'
            if(tile.coast) this.ctx.fillStyle = 'cyan'
        })
        
        // COLOR LAYERS
        
        // Rivers
        Rect(() => {
            if(tile.region){
                this.ctx.fillStyle = 'rgba(' + 10 * tile.region + ', 0, 0, 1)'
            }
        })

        // Fertility
        // Rect(() => { this.ctx.fillStyle = 'rgba(0, 200, 0, ' + ((tile.fertil/100) - 0.15) + ')' })

        // Heights
        // Rect(() => {
        //     if( tile.bin == 0 ) return
        //     let color = '255, 30, 30'
        //     if( tile.height <= 20 ) color = '175, 255, 90'
        //     if( tile.height <= 40 ) color = '225, 255, 90'
        //     if( tile.height <= 60 ) color = '255, 255, 90'
        //     if( tile.height <= 80 ) color = '255, 160, 90'
        //     this.ctx.fillStyle = 'rgba(' + color + ', ' + ((tile.height/100) + .5) + ')'
        // })
        
    }

}