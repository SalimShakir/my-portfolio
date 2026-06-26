document.addEventListener("DOMContentLoaded", () => {
   window.addEventListener("scroll", () => {

const nav=document.querySelector("nav");

if(window.scrollY>40){

nav.style.padding="14px 5vw";

}

else{

nav.style.padding="18px 5vw";

}

});
});
