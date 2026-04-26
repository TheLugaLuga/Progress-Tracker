const HF_TOKEN = "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"; 

let foods = JSON.parse(localStorage.getItem('myFoods')) || [];

// Afișăm datele la încărcarea paginii
window.onload = updateUI;

async function analyzeFood() {
    const query = document.getElementById('nlpInput').value;
    const loader = document.getElementById('loader');
    
    if (!query) return alert("Scrie ce ai mâncat (în engleză), ex: 2 boiled eggs");

    loader.style.display = 'block';

    // Îi spunem AI-ului exact ce vrem: un format de date numit JSON
    const prompt = `Return a JSON object for the nutritional value of "${query}". 
    Format: {"name": "item name", "calories": 0, "protein": 0, "carbs": 0, "fat": 0}. 
    Provide ONLY the JSON, no conversation, no markdown blocks.`;

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/Mistral-7B-Instruct-v0.2", {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify({ 
                inputs: "<s>[INST] " + prompt + " [/INST]",
                parameters: { max_new_tokens: 150, return_full_text: false }
            }),
        });

        const result = await response.json();
        
        // Extragem textul generat de AI
        let aiResponseText = "";
        if (Array.isArray(result) && result[0].generated_text) {
            aiResponseText = result[0].generated_text;
        } else {
            throw new Error("AI-ul nu a răspuns corect.");
        }

        // Curățăm textul pentru a găsi doar partea de JSON { ... }
        const jsonMatch = aiResponseText.match(/\{.*\}/s);
        if (!jsonMatch) throw new Error("Format invalid primit de la AI.");
        
        const foodData = JSON.parse(jsonMatch[0]);

        // Adăugăm în listă
        foods.push({
            name: foodData.name || query,
            p: foodData.protein || 0,
            c: foodData.carbs || 0,
            g: foodData.fat || 0,
            kcal: foodData.calories || 0
        });

        saveData();
        updateUI();
        document.getElementById('nlpInput').value = "";

    } catch (error) {
        console.error("Eroare AI:", error);
        alert("A apărut o eroare. Asigură-te că token-ul Hugging Face este corect și activ!");
    } finally {
        loader.style.display = 'none';
    }
}

function updateUI() {
    const list = document.getElementById('foodList');
    list.innerHTML = "";
    let tP = 0, tC = 0, tG = 0, tK = 0;

    foods.forEach((item, index) => {
        tP += item.p; tC += item.c; tG += item.g; tK += item.kcal;
        
        list.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.p.toFixed(1)}g</td>
                <td>${item.c.toFixed(1)}g</td>
                <td>${item.g.toFixed(1)}g</td>
                <td>${item.kcal.toFixed(0)} kcal</td>
                <td><button class="delete-btn" onclick="deleteFood(${index})">X</button></td>
            </tr>
        `;
    });

    if (foods.length > 0) {
        list.innerHTML += `
            <tr style="background: #f1f2f6; font-weight: bold;">
                <td>TOTAL</td>
                <td>${tP.toFixed(1)}g</td>
                <td>${tC.toFixed(1)}g</td>
                <td>${tG.toFixed(1)}g</td>
                <td>${tK.toFixed(0)} kcal</td>
                <td></td>
            </tr>
        `;
    }
}

function deleteFood(index) {
    foods.splice(index, 1);
    saveData();
    updateUI();
}

function saveData() {
    localStorage.setItem('myFoods', JSON.stringify(foods));
}
