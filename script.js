let foods = [];

function addFood() {
    const name = document.getElementById('foodName').value;
    const p = parseFloat(document.getElementById('protein').value) || 0;
    const c = parseFloat(document.getElementById('carbs').value) || 0;
    const g = parseFloat(document.getElementById('fat').value) || 0;
    const kcal = (p * 4) + (c * 4) + (g * 9);

    if(!name) return alert("Pune un nume!");

    const row = `<tr><td>${name}</td><td>${p}</td><td>${c}</td><td>${g}</td><td>${kcal.toFixed(0)}</td></tr>`;
    document.getElementById('foodList').innerHTML += row;
}
