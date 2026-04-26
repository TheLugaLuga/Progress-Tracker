const API_KEY = 'C5VGry39079SJAT52Xk4DxNvy0Wj9KNcwhtmzK3B';
let foods = JSON.parse(localStorage.getItem('myFoods')) || [];

// Afișăm datele la încărcarea paginii
window.onload = updateUI;

async function analyzeFood() {
    const query = document.getElementById('nlpInput').value;
    const loader = document.getElementById('loader');
    
    if (!query) return alert("Introdu un aliment (ex: 1 banana)");

    loader.style.display = 'block';

    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: { 'X-Api-Key': API_KEY }
        });

        const data = await response.json();

        if (data && data.length > 0) {
            data.forEach(item => {
                foods.push({
                    name: item.name,
                    p: item.protein_g,
                    c: item.carbohydrates_total_g,
                    g: item.fat_total_g,
                    kcal: item.calories
                });
            });
            
            saveData();
            updateUI();
            document.getElementById('nlpInput').value = "";
        } else {
            alert("Nu am putut identifica alimentul. Încearcă în engleză!");
        }
    } catch (error) {
        console.error("Eroare:", error);
        alert("Eroare de conexiune la API.");
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
                <td>${item.p.toFixed(1)}</td>
                <td>${item.c.toFixed(1)}</td>
                <td>${item.g.toFixed(1)}</td>
                <td>${item.kcal.toFixed(0)}</td>
                <td><button class="delete-btn" onclick="deleteFood(${index})">X</button></td>
            </tr>
        `;
    });

    // Adăugăm rândul de total dacă avem alimente
    if (foods.length > 0) {
        list.innerHTML += `
            <tr class="total-row">
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
