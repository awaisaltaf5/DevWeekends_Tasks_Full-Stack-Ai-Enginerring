// Generator

export function* numberGenerator(){

yield 1;

yield 2;

yield 3;

yield 4;

yield 5;

}

// Iterator

export function createIterator(arr){

let index=0;

return{

next(){

if(index<arr.length){

return{

value:arr[index++],

done:false

};

}

return{

done:true

};

}

};

}