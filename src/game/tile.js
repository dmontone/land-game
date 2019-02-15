import { TileColors } from './_tiles.js'
import { TileLayer } from './tile-layer'

export class Tile {

    constructor(props = {}, $map, getMap){
        
        this.index = props.index

        this.x = props.x
        this.y = props.y
        this.dim = props.dim

        this._isDebug = false

        this._next = { up: null, right: null, bottom: null, left: null }

        this._limits = props.xyLimit
        this._isLand = props._isLand || false
        this._isIsland = props._isIsland || false
        this._height = props.height || 0
        this._fertil = props._fertil || 0

        this.getMap = getMap
        this.$map = $map
        this._$el = this.$el

        this.$el.onclick = (e) => {
            console.log(' ')
            console.log('x:', this.x, 'y:', this.y)
            console.log('Region', this.region)
            console.log('isLand', this.isLand)
            console.log('Height', this.height, 'Height Level', this.heightLevel)
            console.log('Fertil', this.fertil, 'Fertil Level', this.fertilLevel)
        }
        
    }

    surrounds(spread = 5, randomize = false){

        let _map = this.getMap(),
            tiles = [],
            checked = [],
            current = this,
            check = (tile, distance) => {
                
                checked[tile.x] = checked[tile.x] || []
                checked[tile.x][tile.y] = checked[tile.x][tile.y] || {}
                
                if(!checked[tile.x][tile.y].tile){
                    checked[tile.x][tile.y] = {tile: tile}
                    tiles.push(checked[tile.x][tile.y])
                }

                if( randomize ) distance = Math.floor((distance - 0.5) + Math.random())

                if( distance > 0 ){
                    distance -= 1
                    if(tile._next.up) check( tile._next.up, distance )
                    if(tile._next.right) check( tile._next.right, distance )
                    if(tile._next.bottom) check( tile._next.bottom, distance )
                    if(tile._next.left) check( tile._next.left, distance )
                }

            }   

        check(current, spread)

        let filtered = []
        tiles.forEach(entry => {
            filtered.push(entry.tile)
        })
        return filtered

    }



    _setClass(){
        
        this.$el.className = 'tile'

        this.$el.classList.add( this.isLand ? 'land' : 'sea' )

        if( this._region )
            this.$el.classList.add( 'region-' + this._region )

        if( this._isIsland )
            this.$el.classList.add( 'island' )

        this.$el.classList.add( 'high-' + this.heightLevel )
        this.$el.classList.add( 'fertil-' + this.fertilLevel )

        if( this._isDebug )
            this.$el.classList.add( 'debug' )

    }

    get isLimit() { return ( this.x == 0 || this.y == 0 || this.x === this._limits.x || this.y === this._limits.y ) }

    get isLand(){ return this._isLand }
    set isLand(value){ this._isLand = !!value; this._setClass() }
    
    get isIsland(){ return this._isIsland }
    set isIsland(value){ this._isIsland = value; this._setClass() }
    
    get region(){ return this._region }
    set region(value){ this._region = value; this._setClass() }
    
    set height(value){ this._height = Math.min(value, 1000); this._setClass() }
    get height(){ return this._height }
    get heightLevel(){ return Math.round((7/1000) * this._height) }
    
    set fertil(value){ this._fertil = Math.min(value, 1000); this._setClass() }
    get fertil(){ return this._fertil }
    get fertilLevel(){ return Math.round((7/1000) * this._fertil) }

    get isDebug(){ return this._isDebug }
    set isDebug(value){ this._isDebug = value; this._setClass() }

    get tileUp(){ return this._next.up }
    get tileRight(){ return this._next.right }
    get tileBottom(){ return this._next.bottom }
    get tileLeft(){ return this._next.left }

    set $el(value){ this._$el = value }
    get $el(){
        if(!this._$el){
            this._$el = document.createElement('div')
            this._$el.style.width = '6px'
            this._$el.style.height = '6px'
            this._$el.style.top = ( this.y * this.dim.w ) + 'px'
            this._$el.style.left = ( this.x * this.dim.h ) + 'px'

            this._setClass()

            this.$map.appendChild(this._$el)
        }
        return this._$el
    }

}