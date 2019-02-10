export class Tile {

    constructor(props){

        this.x = props.x || 10
        this.y = props.y || 10
        this.bin = props.bin

        this._coast = false
        this._fertil = Math.random() * 20
        this._height = 0
        this.reviewHeight = 3

    }

    set coast(value){ this._coast = !!value }
    get coast(){ return this._coast }

    set fertil(value){ this._fertil = Math.max(0, value) }
    get fertil(){ return this._fertil }

    set height(value){ this._height = Math.max(0, value) }
    get height(){ return this._height }

    get color(){
        if( this.coast ) return 'cyan'
        if( this.fertil > 18 ) return 'green'
        if( this.bin === 1 ) return 'brown'
        return 'blue'
    }

    onClick(e){
        console.log(' ')
        console.log('Tile', this.x, this.y)
        console.log('Fertilization level:', this.fertil)
        console.log('Height level:', this.height)
    }

    morph(obj){
        this.x = obj.x
        this.y = obj.y
        this.bin = obj.bin
        this._coast = obj._coast
        this._fertil = obj._fertil
        this._height = obj._height
    }

}