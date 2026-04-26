let foods = JSON.parse(localStorage.getItem('myFoods')) || [];
window.onload = updateUI;

async function analyzeFood() {
    const query = document.getElementById('nlpInput').value;
    const loader = document.getElementById('loader');
    if (!query) return alert("Scrie ce ai mâncat!");

    loader.style.display = 'block';

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // FOARTE IMPORTANT
            body: JSON.stringify({ query: query })
        });

        const result = await response.json();
        
        if (result.error) {
            // Dacă modelul se încarcă (503), Hugging Face trimite un mesaj specific
            if (result.error.includes("loading")) {
                return alert("AI-ul se trezește acum. Mai încearcă o dată în 20 de secunde!");
            }
            throw new Error(result.error);
        }

        let aiText = Array.isArray(result) ? result[0].generated_text : "";
        const match = aiText.match(/\{.*\}/s);
        if (!match) throw new Error("Format AI invalid.");
        
        const data = JSON.parse(match[0]);

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
        console.error("Error detaliat:", e);
        alert("Eroare: " + e.message);
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
