var mi_diccionario = [];
var tabla_pasatiempo = [];
var pistas_restantes = 3
var cookies_aceptadas = (window.localStorage.getItem("cookies_aceptadas") === "true")
var solucion_activa = 1
var tema = "tema-oscuro"

function crear_tabla() {

    for (let i = 0; i < 12; i++) {
        let longitud
        if (i < 6)
            longitud = 4
        else
            longitud = 6

        const fila_array = [];
        const fila_html = document.createElement("tr")

        for (let j = 0; j < longitud; j++) {
            const celda = document.createElement("td")
            celda.className = "celda_pasatiempo"
            celda.innerHTML = `<input type="text" maxlength="1" class="input_celda_pasatiempo" oninput="comprobar_pasatiempo()">`

            fila_html.appendChild(celda)
            fila_array.push(celda)
        }
        tabla_pasatiempo.push(fila_array)
        document.getElementById("tabla_pasatiempo").appendChild(fila_html)
    }

    window.localStorage.getItem("solucion_activa") && cargar_solucion_parcial()
}

function get_palabra(n_fila){
    let palabra = ""
    const fila = tabla_pasatiempo[n_fila]

    for (let i = 0; i < fila.length; i++) {
        palabra += fila[i].firstChild.value.toLowerCase()
    }
    return palabra
}

function comprobar_fila(n_fila){
    const fila = tabla_pasatiempo[n_fila]
    let palabra = get_palabra(n_fila)

    if (palabra.length === 4 && n_fila < 6 || palabra.length === 6 && n_fila >= 6 ) {
        switch (n_fila) {
            case 0:
            case 5:
            case 6:
            case 11:
                comprobar_definicion_servidor(palabra, n_fila)
                break;
            default:
                if (en_diccionario(palabra) && es_permutacion(n_fila)) {
                    set_fila_correcta(fila)
                }
                else {
                    set_fila_erronea(fila)
                }
                break;
        }
        if(cookies_aceptadas) {
            guardar_solucion_parcial()
        }
    }else {
        set_fila_default(fila)
    }
}

function comprobar_pasatiempo(){
    for (let i = 0; i < tabla_pasatiempo.length; i++) {
        comprobar_fila(i)
    }
}

function en_diccionario(palabra){
    return mi_diccionario.includes(palabra)
}

function normalizar (string){
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function es_permutacion(n_fila){
    const palabra_ant = normalizar(get_palabra(n_fila-1))
    const palabra = normalizar(get_palabra(n_fila))

    if (palabra_ant === palabra)
        return false

    let palabra_ant_lista =  palabra_ant.split("")
    let palabra_lista = palabra.split("")
    let coincidencias = 0;

    for (let i = 0; i < palabra_ant_lista.length ; i++) {
        if (palabra_ant_lista.includes(palabra_lista[i])) {
            palabra_ant_lista[palabra_ant_lista.indexOf(palabra_lista[i])] = "-1"
            coincidencias++;
        }
    }
    return coincidencias >= palabra_lista.length-1;
}

function comprobar_definicion_servidor(palabra, fila){

    $.post("http://localhost:8080/server", {"palabra": palabra, "fila": fila, "pasatiempo_activo": solucion_activa},
        function(result){
            if (result){
                set_fila_correcta(tabla_pasatiempo[fila])
            }else{
                set_fila_erronea(tabla_pasatiempo[fila])
            }
        });
}

function set_fila_correcta(fila){

    for (let i = 0; i < fila.length; i++) {
        fila[i].firstChild.className = "input_celda_pasatiempo fila_correcta"
    }
}

function set_fila_erronea(fila){

    for (let i = 0; i < fila.length; i++) {
        fila[i].firstChild.className = "input_celda_pasatiempo fila_erronea"
    }
}

function set_fila_default(fila){

    for (let i = 0; i < fila.length; i++) {
        fila[i].firstChild.className = "input_celda_pasatiempo"
    }
}

function mostrar_pistas(){

    let input = document.getElementById("input_pista")
    if (pistas_restantes > 0) {

        pistas_restantes --;

        if (cookies_aceptadas) {
            window.localStorage.setItem("pistas_restantes", pistas_restantes.toString())
        }
        let palabra = document.getElementById("input_pista").value

        input.placeholder = `Tienes ${pistas_restantes} pistas restantes`
        input.value = ""

        pistas = get_palabras_pistas(palabra)

        document.getElementById("div_lista_pistas").innerHTML = ""

        pistas.forEach(pista => {
            elemento = document.createElement("p")
            elemento.innerHTML = pista
            document.getElementById("div_lista_pistas").appendChild(elemento)
        })
    }else if (pistas_restantes === 0){
        input.placeholder = "No te quedan pistas!"
    }
    input.value = ""
}

function get_palabras_pistas(palabra) {

    palabra = palabra.split("")
    let pistas = []
    let regex = ""


    palabra.forEach(letra => regex += `(?=.*${letra})`)

    mi_diccionario.forEach(palabra_dicc => {
        if (normalizar(palabra_dicc).match(regex) && (palabra_dicc.length === 4 || palabra_dicc.length === 6))
            pistas.push(palabra_dicc)
    })
    return pistas
}

function guardar_solucion_parcial(){
    let filas = []

    tabla_pasatiempo.forEach(f => {
        let fila = []
        for (let i = 0; i < f.length ; i++) {
            fila.push(f[i].firstChild.value)
        }
        filas.push(fila.join())
    })

    window.localStorage.setItem("pasatiempo" + solucion_activa, filas.join(";"))
}

function cargar_solucion_parcial(){

    solucion_activa = window.localStorage.getItem("solucion_activa")
    pistas_restantes = window.localStorage.getItem("pistas_restantes")

    let tabla = window.localStorage.getItem("pasatiempo" + solucion_activa)
    let filas = tabla.split(";")
    let celdas = []

    filas.forEach(f => {
        celdas = celdas.concat(f.split(","))
    })

    tabla_pasatiempo.forEach(f => {
        for (let i = 0; i < f.length ; i++) {
            f[i].firstChild.value = celdas.shift()
        }
    })

    comprobar_pasatiempo()
}

function  limpiar_solucion_parcial(){

    tabla_pasatiempo.forEach(f => {
        for (let i = 0; i < f.length ; i++) {
            f[i].firstChild.value = ""
        }
        set_fila_default(f)
    })
}

async function limpiar_almacenamiento() {
    window.localStorage.clear()
    cookies_aceptadas = false
}

function set_tema(nombre_tema) {
    if(cookies_aceptadas){
        localStorage.setItem("tema", nombre_tema)
    }
    tema = nombre_tema
    document.documentElement.className = nombre_tema
}

function cambiar_tema() {
    if (tema === "tema-oscuro") {
        set_tema("tema-claro")
    } else {
        set_tema("tema-oscuro")
    }
}

function on_load() {
    if (window.localStorage.getItem("pistas_restantes")){
        pistas_restantes = window.localStorage.getItem("pistas_restantes")
        document.getElementById("input_pista").placeholder = `Tienes ${pistas_restantes} pistas restantes`
    }else if (cookies_aceptadas){
        window.localStorage.setItem("pistas_restantes", pistas_restantes.toString())
    }

    cambiar_pistas()

    document.getElementById("input_pista").addEventListener("keydown", event => {
        if (event.key === "Enter" && document.getElementById("input_pista").value.trim() !== "") {
            mostrar_pistas()
        }
    });
}

function set_cookies(aceptadas){
    if (aceptadas){
        cookies_aceptadas = aceptadas;
        window.localStorage.setItem("cookies_aceptadas", aceptadas)
        guardar_almacenamiento_local()
    }else {
        limpiar_almacenamiento()
    }
    document.getElementById("cookieConsentContainer").style.visibility = "hidden"
}

function crear_popup_cookies()
{
    document.body.innerHTML += "<div class=\"cookieConsentContainer\" id=\"cookieConsentContainer\" style=\"opacity: 1; display: block;\">\n" +
        "    <div class=\"cookieTitle\">\n" +
        "        <a>Almacenamiento local.</a>\n" +
        "    </div>\n" +
        "    <div class=\"cookieDesc\">\n" +
        "        <p>¿Acepta que almacenemos datos de esta página web como la resolución parcial o el tema para su posterior recuperación?</p>\n" +
        "    </div>\n" +
        "        <div class=\"cookie_aceptar\">\n" +
        "            <a onclick=\"set_cookies(true)\">Acepto</a>\n" +
        "        </div>\n" +
        "        <div class=\"cookie_rechazo\">\n" +
        "            <a onclick=\"set_cookies(false)\">Rechazar</a>\n" +
        "        </div>\n" +
        "</div>"
}

function guardar_almacenamiento_local() {
    guardar_solucion_parcial()
    localStorage.setItem("pistas_restantes", pistas_restantes)
    localStorage.setItem("solucion_activa", solucion_activa)
    localStorage.setItem("tema", tema)
}

function cargar_almacenamiento_local(){

    //Hago un set del tema en base al local storage, claro por defecto
    if (window.localStorage.getItem("solucion_activa")){
        solucion_activa = window.localStorage.getItem("solucion_activa")
        if (solucion_activa == 2){
            document.getElementById("radio_p2").checked = "checked"
        }else if (solucion_activa == 3){
            document.getElementById("radio_p3").checked = "checked"
        }
        cargar_solucion_parcial()
    }else{
        document.getElementById("selector_pasatiempo").zIndex = "200";
        location.href = "#selector_pasatiempo"
    }

    //Creo el pop up de las cookies si no estan aceptadas
    if (!cookies_aceptadas) {
        crear_popup_cookies();
    }

    //Hago un set del tema en base al local storage, oscuro por defecto
    if (localStorage.getItem('tema') === 'tema-claro') {
        set_tema('tema-claro');
        document.getElementById('slider').checked = true
    } else {
        set_tema('tema-oscuro');
        document.getElementById('slider').checked = false
    }

}

function cambiar_pasatiempo() {

    if (cookies_aceptadas) {
        guardar_solucion_parcial()
    }

    if (document.getElementById("radio_p1").checked) {
        solucion_activa = 1
    } else if (document.getElementById("radio_p2").checked) {
        solucion_activa = 2
    } else if (document.getElementById("radio_p3").checked) {
        solucion_activa = 3
    }

    if(cookies_aceptadas) {
        localStorage.setItem("solucion_activa", solucion_activa.toString())
    }

    limpiar_solucion_parcial()
    cambiar_pistas()
    if (cookies_aceptadas) {
        cargar_solucion_parcial()
        comprobar_pasatiempo()
    }
}

function cambiar_pistas(pasatiempo = solucion_activa){

    console.log(pasatiempo)

    let pista1 = "Fila 1: "
    let pista2 = "Fila 4: "
    let pista3 = "Fila 5: "
    let pista4 = "Fila 12: "

    if (pasatiempo == 1) {
        pista1 += "Familia en Escocia."
        pista2 += "Tristeza y dolor por algo."
        pista3 += "Termino algo definitivamente."
        pista4 += "El que torea."
    }else if (pasatiempo == 2) {
        pista1 += "Enfermedad de la piel caracterizada por una inflamación crónica de las glándulas sebáceas, especialmente en la cara y en la espalda"
        pista2 += "Para estimular a las bestias."
        pista3 += "Hacer bobo a alguien, entorpecerle el uso de las facultades intelectuales."
        pista4 += "Dicho de una parte de un animal: Situada en el extremo opuesto a la boca."
    }else if (pasatiempo == 3) {
        pista1 += "Bolígrafo."
        pista2 += "Que tiene una temperatura inferior a la ordinaria o conveniente."
        pista3 += "Que tiene forma de cubo geométrico."
        pista4 += "Dicho de un diablo: Que, según la opinión vulgar, bajo apariencia de varón tenía trato carnal con una mujer."
    }

    document.getElementById("pista1").innerHTML = pista1
    document.getElementById("pista2").innerHTML = pista2
    document.getElementById("pista3").innerHTML = pista3
    document.getElementById("pista4").innerHTML = pista4
}


fetch("https://ordenalfabetix.unileon.es/aw/diccionario.txt")
    .then(response => response.text())
    .then (data => data.split("\n"))
    .then (diccionario => {
        const palabras_ejemplo = ["cria", "nací", "nace", "torero"]
        mi_diccionario = diccionario.concat(palabras_ejemplo)
        crear_tabla()
    })
    .catch( error => console.log(error));

cargar_almacenamiento_local()
