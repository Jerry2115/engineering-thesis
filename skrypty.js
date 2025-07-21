console.log("✅ Skrypt `skrypty.js` został załadowany!");

document.addEventListener("DOMContentLoaded", () => {
    const secpage = document.getElementById("section-placeholder");
  
    if (secpage) {
     
      fetch("sec.html")
        .then(response => response.text())
        .then(data => {
          secpage.innerHTML = data;
          console.log("✅ Plik `sec.html` został załadowany!");  
          
          const phishingMailForm = document.getElementById("phishing-mail");
          if (!phishingMailForm) {
            console.error("❌ Nie znaleziono formularza o ID 'phishing-mail' po załadowaniu sec.html");
            return;
          }
  
          console.log("✅ Formularz został znaleziony:");  
          
          phishingMailForm.addEventListener("submit", async (e) => {
            
            e.preventDefault();
            console.log("✅ Submit event zadziałał!");            
            const email = document.getElementById("email").value;
  
            try {
              const response = await fetch("http://localhost:3000/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });

              const result = await response.json();
              alert(result.message);
            } catch (error) {
              console.error("Błąd:", error);
              alert("❌ Wystąpił błąd podczas wysyłania phishingu.");
            }
          });
        })
        .catch(error => console.error("❌ Błąd ładowania sekcji w main:", error));
    } else {
      console.error("Nie znaleziono elementu o ID 'section-placeholder'");
    }
  });  

console.log("✅ Skrypt `phishing-mail` został załadowany!");

const navpage = document.getElementById("nav-placeholder");
if (navpage) {
    fetch("nav.html")
        .then(response => response.text())
        .then(data => {
            navpage.innerHTML = data;
        })
        .catch(error => console.error("❌ Błąd ładowania nawigacji:", error));
}
console.log("✅ Plik `nav.html` został załadowany!");



const carouselpage = document.getElementById("carousel-placeholder");
if (!carouselpage) {
    console.error("❌ Nie znaleziono elementu #carousel-placeholder! Sprawdź HTML.");
} else {
    console.log("✅ Element #carousel-placeholder znaleziony!");

    fetch("carousel.html")
        .then(response => {
           if(!response.ok) throw new Error(`❌ Błąd HTTP: ${response.status}`);
            return response.text();
        })
        .then(data => {
            console.log("✅ Karuzela załadowana!");
            carouselpage.innerHTML = data;
            setTimeout(initializeCarousel, 100); 
        })
        .catch(error => console.error("❌ Błąd ładowania karuzeli:", error));
}

function initializeCarousel() {
    const carousel = document.querySelector(".carousel");
    const items = document.querySelectorAll(".carousel-item");

    if (!carousel || items.length === 0) {
        console.error("❌ Brak klasy `.carousel` lub elementów `.carousel-item`!");
        return;
    }
    let currentIndex = 0;

    function showNextItem() {
        if (!items[currentIndex]) {
            console.error(`❌ Element z indeksem ${currentIndex} nie istnieje!`);
            return;
        }
        items[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % items.length;

        if (!items[currentIndex]) {
            console.error(`❌ Element z indeksem ${currentIndex} nie istnieje!`);
            return;
        }
        items[currentIndex].classList.add("active");
    }
    setInterval(showNextItem, 3000);
}
console.log("✅ Plik `carousel.html` został załadowany!");

