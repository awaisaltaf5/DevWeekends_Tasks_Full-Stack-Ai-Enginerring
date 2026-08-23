const user = {
    name: "Awais",
    age: 21,
    address:{
        city:"Islamabad",
        country:"Pakistan"
    }
};

// Destructuring
const {name, age} = user;

// Spread Operator
const skills = ["HTML","CSS"];
const newSkills = [...skills,"JavaScript","React"];

// Rest Parameters
const totalNumbers = (...numbers)=>{
    return numbers.reduce((sum,n)=>sum+n,0);
};

// Optional Chaining
const university = user.education?.university ?? "Not Available";

document.getElementById("showBtn").addEventListener("click",()=>{

document.getElementById("output").innerHTML=`

<h3>User Information</h3>

<p>Name : ${name}</p>

<p>Age : ${age}</p>

<p>City : ${user.address?.city}</p>

<p>University : ${university}</p>

<p>Skills : ${newSkills.join(", ")}</p>

<p>Total : ${totalNumbers(5,10,15,20)}</p>

`;

});