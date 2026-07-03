import {numberGenerator,createIterator} from "./math.js";

const gen=numberGenerator();

const output=document.getElementById("result");

document.getElementById("nextBtn").addEventListener("click",()=>{

const value=gen.next();

if(value.done){

output.innerHTML+="<p>Generator Finished</p>";

return;

}

output.innerHTML+=`<p>${value.value}</p>`;

});

// Iterator Demo

const iterator=createIterator(["HTML","CSS","JS"]);

console.log(iterator.next());

console.log(iterator.next());

console.log(iterator.next());

// Prototype Chain Demo

function Student(name){

this.name=name;

}

Student.prototype.sayHello=function(){

console.log(`Hello ${this.name}`);

}

const s1=new Student("Awais");

s1.sayHello();

console.log(Object.getPrototypeOf(s1));