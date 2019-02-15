import { Pencil } from './pencil'
import { Tile } from './tile'
import AtlasArray from './_map'

export class Map {

    constructor(props = {}){

        this.dim = props.dim
        this.tileDim = props.tileDim
    
        document.body.appendChild( this.$map )

        this._map = this._gen()
        this._mapXY = this.getCoordMap()
        this._genNextLinks()

        let debug = this._map[5550]
        this._sinkBorders()
        this._smoothMaps(3)
        this._genHeights()
        this._genFertil()

        // this._regions = []

        // this._defineContinents()

        // this._canvas = canvas
        // this._ctx = ctx

        // this.type = props.type || atlas
        // this.dimensions = props.dimensions
        // this.tileDimensions = props.tileDimensions

        // this._canvas.width = this.dimensions.width * this.tileDimensions.width
        // this._canvas.height = this.dimensions.height * this.tileDimensions.height

        // this._map = []

        // this._generate()
        
        // this.draw = new Pencil(ctx)
        // window.setInterval(() => {
        //     this._draw()
        // }, 500)

    }

    _gen(){
        
        let _map = [],
            [ x, y ] = [ 0, 0 ],
            totalTiles = ( this.dim.w ) * ( this.dim.h )

        while(_map.length < (this.dim.w * this.dim.h)){
            let index = _map.length
            _map.push(new Tile({
                index,
                x, y,
                dim: this.tileDim,
                _isLand: (Math.random() < .5),
                xyLimit: { x: this.dim.w - 1, y: this.dim.h - 1 }
            }, this.$map, this.getMap.bind(this)))
            let incY = () => { if( y === (this.dim.h - 1) ) { y = 0 } else { y++ } }
            if(x === (this.dim.w - 1) ) { x = 0; incY(); } else { x++ }
        }

        return _map

    }
    _genNextLinks(){
        this._map.forEach(tile => {
            if(tile.y > 0) tile._next.up = this._mapXY[tile.x][tile.y - 1]
            if(tile.x < this.dim.w - 1) tile._next.right = this._mapXY[tile.x + 1][tile.y]
            if(tile.y < this.dim.h - 1) tile._next.bottom = this._mapXY[tile.x][tile.y + 1]
            if(tile.x > 0) tile._next.left = this._mapXY[tile.x - 1][tile.y]
            // if(tile.x < tile.dim.h) tile._next.up = this._mapXY[tile.x + 1][tile.y]
            // if(tile.y > 0) tile._next.bottom = this._mapXY[tile.x][tile.y - 1]
        })
    }

    _sinkBorders(spread = 5){

        let tileList = [],
        checked = [],
            check = tile => {
                checked[tile.x] = checked[tile.x] || []
                checked[tile.x][tile.y] = checked[tile.x][tile.y] || false
                if(!checked[tile.x][tile.y]){
                    checked[tile.x][tile.y] = tile
                    tileList.push(tile)
                }
            },
            limitTiles = this._map.filter(tile => {
                return tile.isLimit
            })

        limitTiles.forEach(tile => {
            check(tile)
            tile.surrounds(5, true).forEach(tile => check(tile))
        })

        tileList.forEach(tile => tile.isLand = false)

    }
    _smoothMaps(levels = 1){

        while(levels > 0){

            this._map.forEach(tile => {
                let surrounds = tile.surrounds(2, true),
                    wallCount = surrounds.filter( tile => tile.isLand ).length
                if(wallCount > (surrounds.length / 2)) tile.isLand = true
                if(wallCount < (surrounds.length / 2)) tile.isLand = false
            })

            levels--
        }

    }
    _defineContinents(){

        let workingRegion = this._regions.length
        this._regions[workingRegion] = this._regions[workingRegion] || []

        let defineRegion = (tile) => {
            
            let tiles = [],
                regionList = []

            let check = (tile) => {
                
                let [x, y] = [ tile.x, tile.y ]
                
                tiles[x] = tiles[x] || []
                tiles[x][y] = tiles[x][y] || false

                if(!tiles[x][y]){
                    tiles[x][y] = true
                    regionList.push(tile)
                    tile.surrounds().filter( tile => tile.isLand ).forEach( tile => check(tile) )
                }

            }

            check(tile)
            regionList.forEach(tile => {
                this._regions[workingRegion].push( tile )
                tile.region = workingRegion
            })

        }

        this._map.forEach(tile => {
            if(tile.isLand && !tile.region){
                this._regions.push([])
                workingRegion = this._regions.length
                this._regions[workingRegion] = this._regions[workingRegion] || []
                defineRegion(tile)
            }
        })

        this._regions = [
            [],
            ...this._regions.filter( region => {

                if(region.length < 50)
                    region.forEach(tile => {
                        tile.region = false
                        tile.isIsland = true   
                    })

                return region.length > 50

            })
        ]

        this._regions.forEach((region, index) => {
            region.forEach(tile => tile.region = index)
        })

    }
    _genHeights(){
        
        let landTiles = this._map.filter(tile => tile.isLand),
            heightsPct = 5, highTilesNumber = Math.round( (landTiles.length/100) * heightsPct ),
            highTiles = []

        for(var i = 0; i < highTilesNumber; i++){
            let tile = landTiles[ Math.max(0, Math.round( Math.random() * landTiles.length - 1 ) ) ]
            tile.height = Math.random() * 1000
            highTiles.push(tile)
        }

        highTiles.forEach(tile => {
            tile.surrounds(7 + (Math.round( Math.random() * 3 )), true).filter(tile => tile.isLand).forEach(surr => {
                surr.height = (surr.height + tile.height) / 2.2 + (Math.random())
            })
            tile.surrounds(2 + (Math.round( Math.random() * 3 )), true).filter(tile => tile.isLand).forEach(surr => {
                surr.height = (surr.height + tile.height) / 1.8 + (Math.random())
            })
        })

    }
    _genFertil(spread = 5){

        let tiles = [],
            checked = [],
            check = (tile, distance) => {
                checked[tile.x] = checked[tile.x] || []
                checked[tile.x][tile.y] = checked[tile.x][tile.y] || false
                if(!checked[tile.x][tile.y]){
                    checked[tile.x][tile.y] = tile
                    tiles.push({tile, distance})
                }
                if(distance > 0){
                    distance -= 1
                    tile.surrounds(1, true).forEach(tile => check(tile, distance))
                }
            },
            coastalLands = this._map.filter(tile => {
                let coastCount = tile.surrounds(1, false).filter( tile => !tile.isLand ).length
                return tile.isLand && coastCount > 0
            })

        coastalLands.forEach((tile, level)  => {
            check(tile, spread)
        })

        tiles.forEach(entry => {
            
        })


    }

    getMap(){
        return this._map
    }
    getCoordMap(){
        let _xy = []
        this._map.forEach(tile => {
            _xy[tile.x] = _xy[tile.x] || []
            _xy[tile.x][tile.y] = _xy[tile.x][tile.y] || tile
        })
        return _xy
    }

    get $map(){
        if(!this._$map){
            let $map = document.createElement('div')
            $map.id = 'map'
            this._$map = $map
        }
        return this._$map
    }    

}