const form = document.getElementById("phishing-form");
const resultDiv = document.getElementById("result");

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const urlInput = document.getElementById("url-content").value;

    resultDiv.innerHTML = "🔍 Analizuję treść...<br>";


    const urlResult = await checkUrl(urlInput);

    // URL similarity
    if (urlResult.error) {
        resultDiv.innerHTML += `<span style='color:orange;'>❌ Błąd analizy adresu URL.</span><br>`;
    } else {
        const urlSimilarityPercent = (urlResult.maxSimilarity * 100).toFixed(2);
        if (urlResult.isSuspicious) {
            resultDiv.innerHTML += `⚠️ <span style="color:red;">Adres URL wygląda podejrzanie: ${urlResult.domain}</span><br>`;
        } else {
            resultDiv.innerHTML += `✅ <span style="color:green;">Adres URL wygląda bezpiecznie: ${urlResult.domain}</span><br>`;
        }
        resultDiv.innerHTML += `📊 Podobieństwo domeny URL do zaufanych: ${urlSimilarityPercent}%<br>`;
    }
});

async function checkUrl(urlText) {
    try {
        const response = await fetch("http://localhost:3000/check-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlText })
        });
        return await response.json();
    } catch (error) {
        console.error("Błąd sprawdzania URL:", error);
        return { error: true };
    }
}
