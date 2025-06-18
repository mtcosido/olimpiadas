const mensajeError = document.querySelector(".error-message");

document.getElementById("login-form").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const form = e.target;

    const nombre = form.querySelector("#nombre").value;
    const password = form.querySelector("#passwrd").value;
    const email = form.querySelector("#email").value;

    const res = await fetch("http://localhost:1364/api/login", {
        method: "POST",
        headers: {
            "content-Type" : "application/json"
        },
        body : JSON.stringify({
                nombre,
                password,
                email
        })
    })

    if(!res.ok) return mensajeError.classList.toggle("hidden", false);
    const resJson = await res.json();
    if(resJson.redirect){
        window.location.href = resJson.redirect;
    }

})