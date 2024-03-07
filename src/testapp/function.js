class Maintest {
    
    constructor(a,b){
        this.a = a;
        this.b = b;
     }

     getSum (){
      
       return this.a+ this.b;
    
     }
     getSub(){
        return this.a-this.b;
     }

     updateValue(a,b){
        this.a = a;
        this.b = b;
        return 'update value';
     }

}

export default Maintest