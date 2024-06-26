document.addEventListener("DOMContentLoaded", function() 
{
    const toggle = document.querySelector(".tax-btn");
    const tax = document.querySelectorAll(".tax");
    const taxNone = document.querySelectorAll(".tax-none");
    toggle.addEventListener("click", () => {
        
        if(toggle.innerText == "Remove tax"){
            toggle.innerText = "With tax";
        }else{
            toggle.innerText = "Remove tax";
            toggle.classList.add("Darker")
        }
        

        if (tax[0].classList.contains("hidden")) {
            
            tax.forEach((t) => {
                t.classList.remove("hidden");
            });
            taxNone.forEach((t) => {
                t.classList.add("hidden");
            });
        } else {
            
            tax.forEach((t) => {
                t.classList.add("hidden");
            });
            taxNone.forEach((t) => {
                t.classList.remove("hidden");
            });
        }
    });

});


