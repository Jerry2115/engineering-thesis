const form = document.getElementById("phishing-form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("email-content").value;

    resultDiv.innerHTML = "🔍 Analizuję treść...<br>";

    const emailResult = await isSimilarToPhishing(input);

    
    const emailSimilarityPercent = (emailResult.similarity * 100).toFixed(2);
    if (emailResult.similarity > 0.63) {
        resultDiv.innerHTML += `⚠️ <span style="color:red;">Treść wygląda podejrzanie</span><br>`;
    } else {
        resultDiv.innerHTML += `✅ <span style="color:green;">Treść wygląda bezpiecznie</span><br>`;
    }
    resultDiv.innerHTML += `📊 Podobieństwo treści e-maila: ${emailSimilarityPercent}%<br><br>`;

    
});

async function isSimilarToPhishing(text) {
    try {
        const response = await fetch("http://localhost:3000/check-similarity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emailText: text })
        });
        return await response.json();
    } catch (error) {
        resultDiv.innerHTML += "<span style='color:orange;'>❌ Błąd połączenia z serwerem.</span><br>";
        console.error(error);
        return { similarity: 0 };
    }
}
