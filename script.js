// Încărcăm datele salvate când se deschide pagina
let foods = JSON.parse(localStorage.getItem('myFoods')) || [];

// Afișăm datele salvate imediat ce se încarcă pagina
window.onload = updateUI;

function addFood() {
    const nameInput = document.getElementById('foodName');
    const pInput = document.getElementById('protein');
    const cInput = document.getElementById('carbs');
    const gInput = document.getElementById('fat');

    const name = nameInput.value;
    const p = parseFloat(pInput.value) || 0;
    const c = parseFloat(cInput.value) || 0;
    const g = parseFloat(gInput.value) || 0;
    const kcal = (p * 4) + (c * 4) + (g * 9);

    if(!name) return alert("Introdu numele alimentului!");

    // Adăugăm obiectul în lista noastră
    foods.push({ name, p, c, g, kcal });

    // Salvează lista actualizată în memoria browserului
    saveData();
    
    // Actualizează tabelul
    updateUI();

    // Resetăm input-urile
    nameInput.value = "";
    pInput.value = "";
    cInput.value = "";
    gInput.value = "";
}

function updateUI() {
    const list = document.getElementById('foodList');
    list.innerHTML = "";

    foods.forEach((item, index) => {
        const row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.p}g</td>
                <td>${item.c}g</td>
                <td>${item.g}g</td>
                <td><strong>${item.kcal.toFixed(0)}</strong></td>
                <td><button style="background: #e74c3c; padding: 5px 10px;" onclick="deleteFood(${index})">X</button></td>
            </tr>
        `;
        list.innerHTML += row;
    });
}

function deleteFood(index) {
    foods.splice(index, 1); // Șterge alimentul din listă
    saveData(); // Salvează noua listă (fără cel șters)
    updateUI(); // Reîmprospătează tabelul
}

function saveData() {
    localStorage.setItem('myFoods', JSON.stringify(foods));
}
