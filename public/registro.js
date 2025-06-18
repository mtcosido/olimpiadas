
const mensajeError = document.querySelector(".error-message");

document.getElementById("register-form").addEventListener("submit",async(e)=>{
    e.preventDefault();
    console.log(e);

    const form = e.target;

    const nombre = form.querySelector("#nombre").value;
    const password = form.querySelector("#password").value;
    const email = form.querySelector("#email").value;  
    const cuil = form.querySelector("#cuil").value;



    const res = await fetch("http://localhost:1364/api/registro", {
        method: "POST",
        headers: {
            "content-Type" : "application/json"
        },
        body : JSON.stringify({
                nombre,
                password,
                cuil,
                email
        })
    });
    if(!res.ok) return mensajeError.classList.toggle("hidden", false);
        const resJson = await res.json();
        if(resJson.redirect){
            window.location.href = resJson.redirect;
        }
});
