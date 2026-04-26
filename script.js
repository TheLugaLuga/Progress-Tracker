let foods = JSON.parse(localStorage.getItem('myFoods')) || [];
window.onload = updateUI;

async function analyzeFood() {
    const query = document.getElementById('nlpInput').value;
    const loader = document.getElementById('loader');
    if (!query) return alert("Scrie ce ai mâncat!");

    loader.style.display = 'block';

    try {
        // Chemăm propria noastră funcție de backend pe Vercel
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: JSON.stringify({ query: query })
        });

        const result = await response.json();
        
        // Extragem textul generat de AI din răspunsul primit
        let aiText = "";
        if (Array.isArray(result)) {
            aiText = result[0].generated_text;
        } else if (result.error) {
            throw new Error(result.error);
        }

        // Extragem doar obiectul JSON { ... } din textul AI-ului
        const match = aiText.match(/\{.*\}/s);
        if (!match) throw new Error("AI-ul a trimis un format invalid.");
        
        const data = JSON.parse(match[0]);

        // Formula standard:
        // $$Calorii = (P \times 4) + (C \times 4) + (G \times 9)$$

        foods.push({
            name: data.name || query,
            p: data.protein || 0,
            c: data.carbs || 0,
            g: data.fat || 0,
            kcal: data.calories || 0
        });

        saveData();
        updateUI();
        document.getElementById('nlpInput').value = "";

    } catch (e) {
        console.error("Error:", e);
        alert("Eroare: Nu am putut procesa datele. Verifică token-ul HF în Vercel!");
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
                <td>**${item.kcal.toFixed(0)} kcal**</td>
                <td><button onclick="deleteFood(${index})" style="background:#e74c3c; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">X</button></td>
            </tr>`;
    });

    if (foods.length > 0) {
        list.innerHTML += `
            <tr style="background: #f1f2f6; font-weight: bold;">
                <td>TOTAL ZI</td>
                <td>${tP.toFixed(1)}g</td>
                <td>${tC.toFixed(1)}g</td>
                <td>${tG.toFixed(1)}g</td>
                <td>${tK.toFixed(0)} kcal</td>
                <td></td>
            </tr>`;
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
