
const params = new URLSearchParams(window.location.search);

const uid = params.get("uid");
const token = params.get("token");

document
.getElementById("formReset")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const password =
        document.getElementById("password").value;

    const password2 =
        document.getElementById("password2").value;

    if(password !== password2){
        alert("Las contraseñas no coinciden");
        return;
    }

    try {

        const response = await fetch(
            "/api/reset-password/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    uid,
                    token,
                    password
                })
            }
        );

        const data = await response.json();

        if(!response.ok){
            throw new Error(
                data.error || "Error"
            );
        }

        document.getElementById("mensaje").innerHTML =
            "Contraseña actualizada correctamente";

    } catch(error){

        document.getElementById("mensaje").innerHTML =
            error.message;
    }
});