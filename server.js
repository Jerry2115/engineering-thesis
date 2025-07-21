const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const natural = require("natural");
const nodemailer = require("nodemailer");
const { spawn } = require("child_process");
const { phishingExamples, suspiciousTLDs, knownLegitDomains } = require("./const");


const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

async function generateEmail(prompt) {
    return new Promise((resolve) => {
        const ollama = spawn("ollama", ["run", "mistral"]);
        let output = "";

        ollama.stdin.write(prompt + "\n");
        ollama.stdin.end();

        ollama.stdout.on("data", (data) => {
            output += data.toString();
        });

        ollama.on("close", () => {
            resolve(output.trim());
        });

        ollama.on("error", (err) => {
            console.error("❌ Błąd generowania e-maila:", err);
            const random = fakeEmails[Math.floor(Math.random() * fakeEmails.length)];
            resolve(random);
        });
    });
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "militox258@gmail.com",
        pass: "hcnn vjdl gwes mpqw"
    }
});

app.post("/send-email", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Brak adresu e-mail!" });
    }

    const message = await generateEmail(
        "Napisz przekonujący, realistyczny e-mail phishingowy, który wygląda jakby był wysłany przez instytucję finansową lub dużą firmę. Użyj alarmującego tonu, który nakłania odbiorcę do natychmiastowego działania, np. kliknięcia w link lub podania danych. Link powinien wyglądać na zaufany (np. 'mbank.pl'), ale prowadzić gdzie indziej (np. 'login-verification-info.net'). Użyj wymyślonych, lecz naturalnie brzmiących danych — nie używaj nawiasów ani oznaczeń typu [imię]. Nie używaj słów takich jak subiekt, subject, subjekt ani podobnych. Styl i język mają być jak najbardziej zbliżone do autentycznych wiadomości phishingowych."
    );

    const mailOptions = {
        from: "noreply@phimail.com",
        to: email,
        subject: "Ważna wiadomość",
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "✅ E-mail został wysłany!" });
    } catch (error) {
        console.error("❌ Błąd wysyłania e-maila:", error);
        res.status(500).json({ message: "Wystąpił błąd podczas wysyłania phishingu." });
    }
});

app.post("/check-similarity", (req, res) => {
    const { emailText } = req.body;

    if (!emailText) {
        return res.status(400).json({ error: "Brak tekstu e-maila." });
    }

    try {
        const tokenizer = new natural.WordTokenizer();
        const inputTokens = tokenizer.tokenize(emailText.toLowerCase()).join(" ");

        let maxSimilarity = 0;

        phishingExamples.forEach(example => {
            const tfidf = new natural.TfIdf();
            tfidf.addDocument(example.toLowerCase());
            tfidf.addDocument(inputTokens);

            const vec1 = tfidf.listTerms(0).map(t => t.tfidf);
            const vec2 = tfidf.listTerms(1).map(t => t.tfidf);

            const length = Math.max(vec1.length, vec2.length);
            while (vec1.length < length) vec1.push(0);
            while (vec2.length < length) vec2.push(0);

            const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
            const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
            const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
            const similarity = dot / (mag1 * mag2 || 1);

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
            }
        });

        res.json({ similarity: maxSimilarity });
    } catch (err) {
        console.error("❌ Błąd serwera:", err);
        res.status(500).json({ error: "Błąd podczas przetwarzania." });
    }
});


app.post("/check-url", (req, res) => {
    const url = req.body.url;

    try {
        const domain = new URL(url).hostname;

        const tldSuspicious = suspiciousTLDs.some(tld => domain.endsWith(tld));

        const tokenizer = new natural.WordTokenizer();
        const domainTokens = tokenizer.tokenize(domain.toLowerCase());

        let maxSimilarity = 0;
        for (const legit of knownLegitDomains) {
            const legitTokens = tokenizer.tokenize(legit);
            const similarity = natural.JaroWinklerDistance(domainTokens.join(" "), legitTokens.join(" "));
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
            }
        }

        const isSuspicious = tldSuspicious || maxSimilarity > 0.85;

        res.json({
            domain,
            maxSimilarity,
            tldSuspicious,
            isSuspicious
        });

    } catch (e) {
        console.error("❌ Błąd analizy URL:", e);
        res.status(400).json({ error: "Nieprawidłowy adres URL" });
    }
});

app.listen(port, () => {
    console.log(`✅ Serwer działa na http://localhost:${port}`);
});