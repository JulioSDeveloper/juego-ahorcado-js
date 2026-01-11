const PALABRAS = ["alma","miguel","ozzo","pequeño","mandarina","pimpon","laika","coca"];
let aleatoria = [];
const pVidas = document.getElementById("vidas");
let listaLetras = Array.from(document.querySelectorAll(".letra"));
const oculta = document.getElementById("palabra");
const RESTANTES = document.getElementById("restante");
const reiniciarBtn = document.getElementById("reiniciar");
const partes = document.querySelectorAll(".parte");
const mensajeFinal = document.getElementById("mensaje-final");
const textoFinal = document.getElementById("texto-final");
let vidas = 6;
let estado = false;
let aciertos = [];

function quitarTildes(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
}

/* 🌐 Obtener palabra desde API */
async function obtenerPalabraAleatoria() {
  try {
    const respuesta = await fetch("https://random-word-api.herokuapp.com/word?lang=es");
    if (!respuesta.ok) throw new Error("Error en la API");
    const datos = await respuesta.json();

    // Filtrar palabras raras o muy cortas
    let palabra = datos[0].toLowerCase();
    palabra = quitarTildes(palabra); // 👈 Eliminar tildes

    if (palabra.length < 3 || palabra.length > 10 || palabra.includes(" ")) {
      throw new Error("Palabra no válida");
    }
    return palabra.split("");
  } catch (error) {
    console.warn("⚠️ No se pudo obtener palabra desde la API. Usando lista local.", error);
    let palabraLocal = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    palabraLocal = quitarTildes(palabraLocal); // 👈 También las limpiamos
    return palabraLocal.split("");
  }
}


function mostrarMensaje(tipo, texto) {
  mensajeFinal.classList.remove("oculto");
  mensajeFinal.classList.add("visible");
  textoFinal.textContent = texto;

  if (tipo === "ganar") {
    mensajeFinal.classList.add("ganar");
  } else {
    mensajeFinal.classList.add("perder");
  }
}

// Inicializar juego
function initJuego() {
  
  let guiones = aleatoria.map(() => "-");
  aciertos = [...guiones];
  oculta.innerText = guiones.join("");
  RESTANTES.innerText = vidas;
  

  // Reset muñeco
  partes.forEach(p => p.style.opacity = 0);

  // Reset teclado
  listaLetras.forEach(b => {
    b.disabled = false;
    b.className = "letra";
    b.style.visibility = "visible";
  });

  reiniciarBtn.style.display = "none";
}

// Mostrar parte del muñeco según las vidas restantes
function mostrarParte() {
  const totalPartes = partes.length; // 6
  const indice = totalPartes - vidas; // va de 0 a 5
  if (indice >= 0 && indice < totalPartes) {
    partes[indice].style.opacity = 1;
  }
}


// Verificar letra
function verificarLetra(l) {
  l = l.toLowerCase();
  for (let i = 0; i < aleatoria.length; i++) {
    if (aleatoria[i] === l) {
      aciertos[i] = l;
    }
  }
  return aciertos;
}


document.addEventListener("DOMContentLoaded", async() => {
  aleatoria = await obtenerPalabraAleatoria();
  initJuego();

  listaLetras.forEach(e => {
    e.addEventListener("click", () => {
      if (estado || vidas <= 0) return;

      const letra = e.textContent.toLowerCase();

      e.classList.add("ocultar");

      if (aleatoria.includes(letra)) {
        e.classList.add("correcta");
        const resultado = verificarLetra(letra);
        oculta.innerText = resultado.join("");
        oculta.classList.add("mostrar");
        setTimeout(() => oculta.classList.remove("mostrar"), 300);
      } else {
        e.classList.add("incorrecta");
        if (vidas > 0) vidas--;
        RESTANTES.innerText = vidas;
        mostrarParte();
      }

      // 🎉 Ganar
if (!aciertos.includes("-")) {
  estado = true;
  listaLetras.forEach(b => b.disabled = true);
  mostrarMensaje("ganar", "🎉 ¡Felicidades! Has ganado 🎉");
  setTimeout(() => {reiniciarBtn.style.display = "block";}, 200);
}

// 💀 Perder
if (vidas <= 0) {
  estado = true;
  partes.forEach(p => p.style.opacity = 1);
  oculta.innerText = aleatoria.join("").toUpperCase();
  pVidas.innerHTML = "💔";
  listaLetras.forEach(b => b.disabled = true);
  mostrarMensaje("perder", `💀 Perdiste... La palabra era: ${aleatoria.join("").toUpperCase()}`);
  setTimeout(() => {reiniciarBtn.style.display = "block";}, 200);
}
    });
  });
});

reiniciarBtn.addEventListener("click", () => {
  location.reload();
});

