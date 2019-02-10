import { Pencil } from './pencil'
import { Tile } from './tile'
import AtlasArray from './_map'

export class Map {

    constructor(props = {}, canvas, ctx){

        this.type = props.type || atlas
        
        this.dimensions = props.dimensions
        this.totalTiles = this.dimensions.width * this.dimensions.height
        
        this.seed = props.seed || .5
        this.randomSeed = false
        
        this._map = AtlasArray
        this._map = []

        this._tiles = {
            land: [],
            sea: [],
            coast: [],
            fertil: [],
            heights: []
        }
        
        this._generate()
        
        this.draw = new Pencil(ctx)
        this._draw()

    }

    _tile(x, y){
        return this._map[x][y]
    }
    _tileLoop(cb){
        for(let x = 0; x < this.dimensions.width; x++){
            for(let y = 0; y < this.dimensions.height; y++){
                cb(x, y)
            }
        }
    }
    _rndTile(only){

        if(only === 'land'){
            return this._tiles.land[ Math.floor( 1 + (Math.random() * this._tiles.land.length - 1) ) ]
        }

        let x = Math.floor( 1 + (Math.random() * this.dimensions.width - 1) ),
            y = Math.floor( 1 + (Math.random() * this.dimensions.height - 1) )
        return this._map[x][y]

    }
    _surrounds(x, y, cb, spread = 1){
        
        for(let nx = x - spread; nx <= x + spread; nx++){
            if( nx < 0 || nx > (this.dimensions.width - 1)  ) continue
            
            for(let ny = y - spread; ny <= y + spread; ny++){
                if( ny < 0 || ny > (this.dimensions.height - 1) ) continue

                if( nx == x && ny == y ) continue
                
                if( this._map[nx][ny] && this._map[nx][ny].bin ){
                    if( cb(this._map[nx][ny], nx, ny) === 'break' )
                        break
                }

            }

        }

    }

    _isLimit(x, y){
        if( x == 0 || x == this.dimensions.width - 1 || y == 0 || y == this.dimensions.height - 1 )
            return true
        return false
    }

    _smoothMap(level = 0){
        
        this._tileLoop((x, y) => {
            
            let wallCount = 0
            this._surrounds(x, y, tile => {
                wallCount += tile.bin
            })
            
            if(this._isLimit(x, y) || wallCount < 4) this._map[x][y].bin = 0
            if(!this._isLimit(x, y) && wallCount > 4) this._map[x][y].bin = 1

        })
        
        console.log('Smoothing', level, '...')
        if(level > 0) this._smoothMap( level - 1 )

    }
    _generate(){

        if( this._map.length > 0 )
            return this._map

        this._tileLoop((x, y) => {
            
            this._map[x] = this._map[x] || []
            let binary = Math.random() > this.seed ? 1 : 0
            this._map[x][y] = new Tile({
                x: x,
                y: y,
                bin: binary
            })

            if(binary) this._tiles.land.push( this._map[x][y] )
            else       this._tiles.sea.push( this._map[x][y] )
            
            if( this._isLimit(x, y) )
                this._map[x][y].bin = 0

        })

        this._tileLoop((x, y) => {
            if( this._isLimit(x, y) ){
                this._surrounds(x, y, tile => {
                    tile.bin = 0
                }, 5)
            }
        })
        
        return this._tileLoop((x, y) => {
          this._map[x][y].morph( AtlasArray[x][y] )  
        })

        this._smoothMap(10)
        this._genCoasts()
        this._genFertil()
        this._genHeights()

        return this._map

    }

    _genCoasts(){

        this._tileLoop((x, y) => {
            if( this._map[x][y].bin === 0 ){
                this._surrounds(x, y, tile => {
                    if(tile.bin === 1){
                        this._map[x][y].coast = true
                        return 'break'
                    }
                    this._tiles.coast.push( this._map[x][y] )
                }, 2)
            }
        })
        
    }   
    _genFertil(){

        const fertilPercent = 40
        const fertilAbsolute = Math.round( (this.totalTiles/100) * fertilPercent )

        for( var i = 0; i < fertilAbsolute; i++){
            let tile = this._rndTile()
            if(tile.bin == 1){
                tile.fertil = 20 + Math.random() * 50
            }
            this._tiles.fertil.push( tile )
        }

        function raise(tile){
            tile.fertil += Math.min( (tile.fertil/100 * (Math.random() * 5)), 100)
        }

        this._tiles.fertil.forEach(ferTile => {
            this._surrounds(ferTile.x, ferTile.y, raise, 5)
            this._surrounds(ferTile.x, ferTile.y, raise, 4)
            this._surrounds(ferTile.x, ferTile.y, raise, 3)
            this._surrounds(ferTile.x, ferTile.y, raise, 2)
            this._surrounds(ferTile.x, ferTile.y, raise)
        })

    }
    _genHeights(){
        const highPercent = 90
        const highAbsolute = Math.round( (this._tiles.land.length/100) * highPercent )
        for( var i = 0; i < highAbsolute; i++){
            let tile = this._rndTile('land')
            if(tile.bin == 1){
                tile.height = Math.min( Math.random() * 120, 100 )
            }
            this._tiles.heights.push( tile )
        }

        function raise(tile, refTile, seed){
            if(tile.reviewHeight > 0){
                let newHeight = (tile.height + refTile.height) / (Math.random() + 1.5)
                tile.height = newHeight
                tile.reviewHeight--
            }
        }

        this._tiles.heights.forEach(highTile => {
            this._surrounds(highTile.x, highTile.y, tile => raise(tile, highTile), 8)
        })

    }

    _draw(){
        this._tileLoop((x, y) => {
            this.draw.tile( this._map[x][y] )
            
            this.__data = this.__data || []
            this.__data[x] = this.__data[x] || []

            this.__data[x][y] = {
                x: this._map[x][y].x,
                y: this._map[x][y].y,
                bin: this._map[x][y].bin,
                _coast: this._map[x][y]._coast,
                _fertil: this._map[x][y]._fertil,
                _height: this._map[x][y]._height
            }

        })

    }

}